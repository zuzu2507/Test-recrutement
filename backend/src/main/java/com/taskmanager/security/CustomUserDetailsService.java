package com.taskmanager.security;

import com.taskmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findByEmailIgnoreCase(email)
                .map(user -> new AuthenticatedUser(
                        user.getId(),
                        user.getEmail(),
                        user.getPassword(),
                        List.of()))
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur introuvable : " + email));
    }
}
