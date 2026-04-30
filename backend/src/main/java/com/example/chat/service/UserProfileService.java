package com.example.chat.service;

import java.time.LocalDateTime;
import java.time.Duration;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.chat.DTO.PasswordChangeRequest;
import com.example.chat.DTO.UserProfileResponse;
import com.example.chat.DTO.UserProfileUpdateRequest;
import com.example.chat.entity.User;
import com.example.chat.exception.BusinessException;
import com.example.chat.repository.UserRepository;

import jakarta.transaction.Transactional;
import java.util.List;

@Service
public class UserProfileService {
    private static final String RESET_OTP_PREFIX = "reset-otp:";
    private static final String RESET_RATE_LIMIT_PREFIX = "reset-ratelimit:";
    private static final int RESET_OTP_EXPIRY_MINUTES = 10;
    private static final int RESET_RATE_LIMIT_SECONDS = 60;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StringRedisTemplate redisTemplate;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    // get current loggin user
    private User GetCurrentUser() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String email = userDetails.getUsername();
        return userRepository.findByEmail(email)
        .orElseThrow(() -> new BusinessException("User not found"));
    }

    public String getCurrentUserEmail() {
        return GetCurrentUser().getEmail();
    }

    // get profile
    public UserProfileResponse getMyProfile() {
        User user = GetCurrentUser();
        return convertToResponse(user);
    }

    @Transactional
    public UserProfileResponse updateProfile(UserProfileUpdateRequest request) {
        User user = GetCurrentUser();

        if (request.getName() != null && !request.getName().isEmpty()) {
            user.setName(request.getName());
        }

        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }
        userRepository.save(user);
        return convertToResponse(user);
    }


    // change password 
    @Transactional
    public String changePassword(PasswordChangeRequest request) {
        User user = GetCurrentUser();
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BusinessException("current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return "password changed successfully";
    }


    // forget password 
    public String forgotPassword(String email) {
        userRepository.findByEmail(email)
            .orElseThrow(() -> new BusinessException("User not found with this email"));

        String rateLimitKey = RESET_RATE_LIMIT_PREFIX + email;
        if (Boolean.TRUE.equals(redisTemplate.hasKey(rateLimitKey))) {
            throw new BusinessException("Please wait 60 seconds before requesting another OTP");
        }

        String otp = String.format("%06d", new Random().nextInt(999999));
        redisTemplate.opsForValue().set(
            RESET_OTP_PREFIX + email,
            otp,
            Duration.ofMinutes(RESET_OTP_EXPIRY_MINUTES)
        );
        redisTemplate.opsForValue().set(
            rateLimitKey,
            "1",
            Duration.ofSeconds(RESET_RATE_LIMIT_SECONDS)
        );

        emailService.sendPasswordResetOtp(email, otp);

        return "Password reset OTP sent to your email";
    }

    // reset password
    @Transactional
    public String resetPassword(String email, String otp, String newpassword){
        String savedOtp = redisTemplate.opsForValue().get(RESET_OTP_PREFIX + email);
        if (savedOtp == null) {
            throw new BusinessException("OTP expired or not found. Please request a new OTP.");
        }

        if (!savedOtp.equals(otp)) {
            throw new BusinessException("Invalid OTP");
        }

        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new BusinessException("User not found"));
        user.setPassword(passwordEncoder.encode(newpassword));
        userRepository.save(user);
        redisTemplate.delete(RESET_OTP_PREFIX + email);

        return "Password reset successfully";
    }



    @Transactional
    public void updateLastlogin(String email) {
        User user = userRepository.findByEmail(email)
        .orElse(null);
        if (user != null) {
            user
            .setLastloginAt(LocalDateTime.now());
            userRepository.save(user);
        }
    }

    // get user by id 
    public UserProfileResponse getUserById(Long id) {
        User user = userRepository.findById(id)
        .orElseThrow(() -> new BusinessException("user not found"));
        return convertToResponse(user);
    }

    public List<UserProfileResponse> getAllUsers() {
        String currentUserEmail = getCurrentUserEmail();
        return userRepository.findAll().stream()
            .filter(User::isVerified)
            .filter(user -> !user.getEmail().equalsIgnoreCase(currentUserEmail))
            .map(this::convertToResponse)
            .toList();
    }

    // convert to response Dto method 
    private UserProfileResponse convertToResponse(User user) {
        UserProfileResponse response = new UserProfileResponse();
        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setName(user.getName());
        response.setBio(user.getBio());
        response.setAvatarUrl(user.getAvatarUrl());
        response.setVerified(user.isVerified());
        response.setActive(user.isActive());
        response.setLastloginAt(user.getLastloginAt());
        response.setCreatedAt(user.getCreatedAt());
        return response;
    }

}
