package com.example.chat.DTO;

import lombok.Data;

@Data
public abstract class AuthRequest {
    private String email;
    private String paassword;
}
