package com.example.chat.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    @Autowired
    private JavaMailSender mailSender;

    public void sendOtp(String email, String otp){
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setTo(email);
        msg.setSubject("Your OTP Code");
        msg.setText("your OTP is : " + otp + "\n\nvalid for 5 minuts");

        mailSender.send(msg);
    }

    public void sendPasswordResetEmail(String email, String resetLink) {
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setTo(email);
        msg.setSubject("Password Reset Request");
        msg.setText("Click the link below to reset your password:\n\n" + resetLink + "\n\nThis link will expire in 1 hour.");
        mailSender.send(msg);        
    }

    public void sendPasswordResetOtp(String email, String otp) {
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setTo(email);
        msg.setSubject("Reset Password OTP");
        msg.setText("Your password reset OTP is: " + otp + "\n\nValid for 10 minutes.");
        mailSender.send(msg);
    }
}
