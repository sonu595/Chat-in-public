package com.example.chat.DTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PasswordChangeRequest {
    @NotBlank(message = "Current password is required")
    private String currentPassword;

    @NotBlank(message = "new password is required")
    @Size(min = 6, message = "password must be at 6 characters")
    private String newPassword;

}
