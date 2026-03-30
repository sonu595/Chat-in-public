package com.example.chat.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.chat.service.AuthService;

@RestController
@RequestMapping("/auth")
public class AuthController {
    @Autowired
    private AuthService authService;

    @PostMapping("/send-otp")
    public String sendOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        return authService.sendOtp(email);
    }

    @PostMapping("/verify-otp")
    public String verifyOtp(@RequestBody Map<String, String> body) {
        boolean result = authService.verifyotp(
            body.get("email"),
            body.get("otp")
        );

        return result ? "OTP Verified" : "Invalid OTP";
    }

    @PostMapping("/register")
    public String register(@RequestBody Map<String, String> body) {
        return authService.register(
            body.get("email"),
            body.get("name"),
            body.get("password")
        );
    }

    // LOGIN
    @PostMapping("/login")
    public String login(@RequestParam String email,
                        @RequestParam String password) {

        return authService.login(email, password);
    }

}
