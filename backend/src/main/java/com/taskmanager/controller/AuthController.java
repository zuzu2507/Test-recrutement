package com.taskmanager.controller;

import com.taskmanager.dto.AuthResponse;
import com.taskmanager.dto.LoginRequest;
import com.taskmanager.dto.RegisterRequest;
import com.taskmanager.dto.UserResponse;
import com.taskmanager.repository.UserRepository;
import com.taskmanager.exception.NotFoundException;
import com.taskmanager.security.AuthenticatedUser;
import com.taskmanager.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    /** Pratique cote frontend pour revalider un token stocke au rechargement de la page. */
    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(@AuthenticationPrincipal AuthenticatedUser principal) {
        return userRepository.findById(principal.getId())
                .map(UserResponse::from)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new NotFoundException("Utilisateur introuvable"));
    }
}
