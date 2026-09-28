package com.fasogarages.backend.security;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Convertit les rôles Keycloak (realm_access.roles) en autorités Spring Security.
 * Exemple : "ADMIN" devient "ROLE_ADMIN"
 */
public class KeycloakRoleConverter implements Converter<Jwt, Collection<GrantedAuthority>> {

    @Override
    @SuppressWarnings("unchecked")
    public Collection<GrantedAuthority> convert(Jwt jwt) {
        // Keycloak place les rôles dans le claim "realm_access.roles"
        Map<String, Object> realmAccess = jwt.getClaim("realm_access");

        if (realmAccess == null || realmAccess.isEmpty()) {
            return List.of();
        }

        List<String> roles = (List<String>) realmAccess.get("roles");

        if (roles == null || roles.isEmpty()) {
            return List.of();
        }

        // Spring Security attend le préfixe "ROLE_"
        return roles.stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                .collect(Collectors.toList());
    }
}