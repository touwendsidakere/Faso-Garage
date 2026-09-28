package com.fasogarages.backend.config;

import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.fasogarages.backend.security.KeycloakRoleConverter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Value("${cors.allowed.origins}")
    private String allowedOrigins;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                        // ===== ENDPOINTS PUBLICS =====
                        .requestMatchers(
                                "/api/auth/**",
                                "/api/public/**",
                                "/api/services/**",
                                "/api/categories/**",
                                "/api/packs/**",
                                "/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**"
                        ).permitAll()

                        // ===== PROFESSIONNELS =====
                        .requestMatchers(HttpMethod.GET, "/api/professionnels").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/professionnels/search").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/professionnels/{id}").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/professionnels/profil").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/professionnels/profil").authenticated()

                        // ===== AVIS =====
                        .requestMatchers(HttpMethod.GET, "/api/avis/professionnel/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/avis/verifier/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/avis").authenticated()

                        // ===== PUBLICITÉS =====
                        .requestMatchers(HttpMethod.GET, "/api/publicites/actives").permitAll()

                        // ===== FICHIERS =====
                        .requestMatchers(HttpMethod.GET, "/api/fichiers/**").permitAll()

                        // ===== ABONNEMENTS =====
                        .requestMatchers("/api/abonnements/**").hasAnyRole("PRO", "ADMIN")

                        // ===== ADMINISTRATION =====
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/pro/**").hasAnyRole("PRO", "ADMIN")

                        // ===== TOUT LE RESTE =====
                        .anyRequest().authenticated()
                )
                // ===== CONFIGURATION OAUTH2 RESOURCE SERVER =====
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter()))
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                );

        return http.build();
    }

    /**
     * Configure le convertisseur JWT pour extraire les rôles Keycloak.
     */
    private JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(new KeycloakRoleConverter());
        return converter;
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}