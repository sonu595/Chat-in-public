package com.example.chat.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.chat.DTO.PasswordChangeRequest;
import com.example.chat.DTO.UserProfileResponse;
import com.example.chat.DTO.UserProfileUpdateRequest;
import com.example.chat.entity.PasswordResetToken;
import com.example.chat.entity.User;
import com.example.chat.exception.BusinessException;
import com.example.chat.repository.PasswordResetTokenRepository;
import com.example.chat.repository.UserRepository;

import jakarta.transaction.Transactional;
import java.util.List;

@Service
public class UserProfileService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordResetTokenRepository tokenRepository;

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
        User user = userRepository.findByEmail(email)
        .orElseThrow(() -> new  BusinessException("User not found with this email"));

        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(token);
        resetToken.setEmail(email);
        resetToken.setExpiryDate(LocalDateTime.now().plusHours(1));
        resetToken.setUsed(false);
        tokenRepository.save(resetToken);

        String resetLink = "http://localhost:8080/auth/reset-password?token=" + token;

        emailService.sendPasswordResetEmail(email, resetLink);

        return "Password reset link sent to your email";
    }

    // reset password
    @Transactional
    public String resetPassword(String token, String newpassword){
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
        .orElseThrow(()-> new BusinessException("Invalid or expired token"));
        if (resetToken.isUsed()) {
            throw new BusinessException("token has alredy been used");
        }

        if (resetToken.isExpired()) {
            throw new BusinessException("Token has expired");
        }

        User user = userRepository.findByEmail(resetToken.getEmail())
        .orElseThrow(() -> new BusinessException("User not found"));
        user.setPassword(passwordEncoder.encode(newpassword));
        userRepository.save(user);

        resetToken.setUsed(true);
        tokenRepository.save(resetToken);

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
