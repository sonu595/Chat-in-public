package com.example.chat.service;

import java.time.Duration;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.chat.entity.User;
import com.example.chat.repository.UserRepository;

@Service
public class AuthService {
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
        String otp = String.valueOf(new Random().nextInt(900000) + 100000);

        redisTemplate.opsForValue().set(email, otp, Duration.ofMinutes(5));

        emailService.sendOtp(email, otp);
        return "otp sent successfully";
    }

    public boolean verifyotp(String email, String inputOtp) {
        String savedOtp = redisTemplate.opsForValue().get(email);

        if (savedOtp != null && savedOtp.equals(inputOtp)) {
            redisTemplate.delete(email);
            return true;
        } 
        return false;
    }

    public String register(String email, String name , String password){
        User user = new User();
        user.setEmail(email);
        user.setName(name);
        user.setPassword(passwordEncoder.encode(password));

        userRepository.save(user);

        return "User registered successfully";
    }

    public String login(String email, String password){
        User user = userRepository.findByEmail(email)
        .orElseThrow(() -> new RuntimeException("user not found"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Wrong password");
        }
        return jwtService.generateToken(user);
    }

}
