package com.taskmanager.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(

        @NotBlank(message = "Le nom est obligatoire")
        @Size(max = 100, message = "Le nom ne peut pas depasser 100 caracteres")
        String name,

        @NotBlank(message = "L'email est obligatoire")
        @Email(message = "Format d'email invalide")
        @Size(max = 180)
        String email,

        @NotBlank(message = "Le mot de passe est obligatoire")
        @Size(min = 6, max = 72, message = "Le mot de passe doit faire entre 6 et 72 caracteres")
        String password
) {}
