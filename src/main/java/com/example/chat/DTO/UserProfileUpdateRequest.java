package com.example.chat.DTO;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserProfileUpdateRequest {
    @Size(min = 2, max = 50, message = "name must be between 2 to 50 charactors")
    private String name;

    @Size(max = 200, message = "bio must be less then 200 characters")
    private String bio;


    private String avatarUrl;

}
