package com.example.chat.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;

@Entity
public class Otp {
    @Id
    @GeneratedValue
    Long id;
    String email;
    String otp;
    LocalDateTime expiryTime;
    boolean Verified;
}
