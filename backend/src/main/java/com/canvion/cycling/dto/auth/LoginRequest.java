package com.canvion.cycling.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {
    
    @NotBlank(message = "El nombre de usuario o email es obligatorio")
    private String usernameOrEmail;
    
    @NotBlank(message = "La contraseña es obligatoria")
    private String password;
}
