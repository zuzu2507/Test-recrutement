package com.taskmanager.service;

import com.taskmanager.dto.AuthResponse;
import com.taskmanager.dto.LoginRequest;
import com.taskmanager.dto.RegisterRequest;
import com.taskmanager.dto.UserResponse;
import com.taskmanager.entity.User;
import com.taskmanager.exception.EmailAlreadyUsedException;
import com.taskmanager.exception.NotFoundException;
import com.taskmanager.repository.UserRepository;
import com.taskmanager.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase();

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new EmailAlreadyUsedException("Un compte existe deja avec cet email");
        }

        User user = User.builder()
                .name(request.name().trim())
                .email(email)
                .password(passwordEncoder.encode(request.password()))
                .build();

        User saved = userRepository.save(user);
        String token = jwtService.generateToken(saved.getId(), saved.getEmail());

        return AuthResponse.of(token, jwtService.getExpirationMs(), UserResponse.from(saved));
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String email = request.email().trim().toLowerCase();

        // Leve BadCredentialsException -> 401 via GlobalExceptionHandler.
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.password()));

        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new NotFoundException("Utilisateur introuvable"));

        String token = jwtService.generateToken(user.getId(), user.getEmail());

        return AuthResponse.of(token, jwtService.getExpirationMs(), UserResponse.from(user));
    }
}
