package com.example.chat.service;

import java.time.Duration;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.mail.MailException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.chat.entity.User;
import com.example.chat.exception.BusinessException;
import com.example.chat.repository.UserRepository;

@Service
public class AuthService {
    private static final String OTP_PREFIX = "otp:";
    private static final String VERIFIED_PREFIX = "verified:";
    private static final int OTP_EXPIRY_MINUTES = 5;
    private static final int RATE_LIMIT_SECONDS = 60;
    
    @Autowired
    private StringRedisTemplate redisTemplate;

    @Autowired
    private EmailService emailService;

    @Autowired 
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    public String sendOtp(String email) {
        // Rate limiting check
        String rateLimitKey = "ratelimit:" + email;
        if (Boolean.TRUE.equals(redisTemplate.hasKey(rateLimitKey))) {
            throw new BusinessException("Please wait 60 seconds before requesting another OTP");
        }
        
        // Check if email already registered
        if (userRepository.findByEmail(email).isPresent()) {
            throw new BusinessException("Email already registered");
        }
        
        String otp = String.format("%06d", new Random().nextInt(999999));
        
        // Store OTP in Redis
        redisTemplate.opsForValue().set(OTP_PREFIX + email, otp, Duration.ofMinutes(OTP_EXPIRY_MINUTES));
        
        // Set rate limit
        redisTemplate.opsForValue().set(rateLimitKey, "1", Duration.ofSeconds(RATE_LIMIT_SECONDS));

        try {
            emailService.sendOtp(email, otp);
        } catch (MailException ex) {
            redisTemplate.delete(OTP_PREFIX + email);
            redisTemplate.delete(rateLimitKey);
            throw new BusinessException("Failed to send OTP email. Please check the mail configuration.");
        }

        return "OTP sent successfully. Valid for 5 minutes.";
    }

    public String verifyOtp(String email, String inputOtp) {
        String savedOtp = redisTemplate.opsForValue().get(OTP_PREFIX + email);
        
        if (savedOtp == null) {
            throw new BusinessException("OTP expired or not found. Please request a new OTP.");
        }
        
        if (!savedOtp.equals(inputOtp)) {
            throw new BusinessException("Invalid OTP");
        }
        
        // Mark email as verified
        redisTemplate.opsForValue().set(VERIFIED_PREFIX + email, "true", Duration.ofMinutes(10));
        redisTemplate.delete(OTP_PREFIX + email);
        
        return "OTP verified successfully. You can now register.";
    }

    public String register(String email, String name, String password) {
        // Check if email is verified
        String verifiedKey = VERIFIED_PREFIX + email;
        if (!Boolean.TRUE.equals(redisTemplate.hasKey(verifiedKey))) {
            throw new BusinessException("Please verify OTP first before registering");
        }
        
        // Check if user already exists
        if (userRepository.findByEmail(email).isPresent()) {
            throw new BusinessException("User already exists");
        }
        
        User user = new User();
        user.setEmail(email);
        user.setName(name);
        user.setPassword(passwordEncoder.encode(password));
        user.setVerified(true);

        userRepository.save(user);
        
        // Clean up Redis
        redisTemplate.delete(verifiedKey);
        
        return "User registered successfully";
    }

    public String login(String email, String password) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new BusinessException("User not found"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new BusinessException("Invalid password");
        }
        
        if (!user.isVerified()) {
            throw new BusinessException("Email not verified. Please verify your email first.");
        }
        
        return jwtService.generateToken(user);
    }
}
