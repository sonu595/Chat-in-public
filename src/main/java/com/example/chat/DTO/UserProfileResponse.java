package com.example.chat.DTO;
import java.time.LocalDateTime;

import lombok.Data;

@Data
public class UserProfileResponse {
    private Long id;
    private String email;
    private String name;
    private String bio;
    private String avatarUrl;
    private boolean isVerified;
    private boolean isActive;
    private LocalDateTime lastloginAt;
    private LocalDateTime createdAt;
}
