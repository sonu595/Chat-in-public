package com.example.chat.DTO;

import lombok.Data;

@Data
public class AuthRequest {
    private String email;
    private String password;
}
