package com.taskmanager.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;

import java.util.Collection;

/** UserDetails enrichi de l'id en base, pour ne pas relire l'utilisateur a chaque requete. */
public class AuthenticatedUser extends User {

    private final Long id;

    public AuthenticatedUser(Long id, String email, String password,
                             Collection<? extends GrantedAuthority> authorities) {
        super(email, password, authorities);
        this.id = id;
    }

    public Long getId() {
        return id;
    }
}
