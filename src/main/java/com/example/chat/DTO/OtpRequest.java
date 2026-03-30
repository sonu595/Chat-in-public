package com.example.chat.DTO;

import lombok.Data;

@Data
public class OtpRequest {
    private String email;
    private String otp;
}
