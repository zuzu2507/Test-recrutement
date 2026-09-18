package com.taskmanager.dto;

/** Reponse renvoyee par /register et /login : le JWT + le profil de l'utilisateur. */
public record AuthResponse(String token, String tokenType, long expiresIn, UserResponse user) {

    public static AuthResponse of(String token, long expiresIn, UserResponse user) {
        return new AuthResponse(token, "Bearer", expiresIn, user);
    }
}
