package com.taskmanager.exception;

import com.taskmanager.dto.ApiError;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.LinkedHashMap;
import java.util.Map;

/** Traduit les exceptions en reponses JSON homogenes pour le frontend. */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex,
                                                     HttpServletRequest request) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(error -> fieldErrors.putIfAbsent(error.getField(), error.getDefaultMessage()));

        return ResponseEntity.badRequest().body(ApiError.of(
                HttpStatus.BAD_REQUEST.value(),
                "Bad Request",
                "Donnees invalides",
                request.getRequestURI(),
                fieldErrors));
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiError> handleTypeMismatch(MethodArgumentTypeMismatchException ex,
                                                       HttpServletRequest request) {
        return ResponseEntity.badRequest().body(ApiError.of(
                HttpStatus.BAD_REQUEST.value(),
                "Bad Request",
                "Valeur invalide pour le parametre " + ex.getName(),
                request.getRequestURI()));
    }

    @ExceptionHandler(EmailAlreadyUsedException.class)
    public ResponseEntity<ApiError> handleEmailAlreadyUsed(EmailAlreadyUsedException ex,
                                                           HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(ApiError.of(
                HttpStatus.CONFLICT.value(),
                "Conflict",
                ex.getMessage(),
                request.getRequestURI()));
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ApiError> handleNotFound(NotFoundException ex,
                                                   HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiError.of(
                HttpStatus.NOT_FOUND.value(),
                "Not Found",
                ex.getMessage(),
                request.getRequestURI()));
    }

    @ExceptionHandler({BadCredentialsException.class, AuthenticationException.class})
    public ResponseEntity<ApiError> handleBadCredentials(AuthenticationException ex,
                                                         HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiError.of(
                HttpStatus.UNAUTHORIZED.value(),
                "Unauthorized",
                "Email ou mot de passe incorrect",
                request.getRequestURI()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleUnexpected(Exception ex, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiError.of(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Internal Server Error",
                "Une erreur inattendue est survenue",
                request.getRequestURI()));
    }
}
