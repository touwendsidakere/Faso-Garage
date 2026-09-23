package com.fasogarages.backend.config;

import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.fasogarages.backend.security.JwtAuthenticationFilter;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Value("${cors.allowed.origins}")
    private String allowedOrigins;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                        // ===== AUTHENTIFICATION =====
                        .requestMatchers(HttpMethod.POST, "/api/auth/register", "/api/auth/login").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/auth/me").authenticated()
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
                        .requestMatchers(HttpMethod.GET, "/api/professionnels/pending").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/professionnels/profil").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/professionnels/profil").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/professionnels").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/professionnels/search").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/professionnels/{id}").permitAll()

                        // ===== CATÉGORIES ET SERVICES =====
                        .requestMatchers(HttpMethod.GET, "/api/categories").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/services").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/services/categories/**").permitAll()

                        // ===== AVIS =====
                        .requestMatchers(HttpMethod.GET, "/api/avis/professionnel/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/avis/verifier/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/avis").authenticated()

                        // ===== PUBLICITÉS =====
                        .requestMatchers(HttpMethod.GET, "/api/publicites/actives").permitAll()

                        // ===== FICHIERS =====
                        .requestMatchers(HttpMethod.GET, "/api/fichiers/**").permitAll()

                        // ===== ABONNEMENTS (Professionnels) =====
                        .requestMatchers("/api/abonnements/**").hasAnyRole("PRO", "ADMIN")  

                        // ===== ADMINISTRATION =====
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/pro/**").hasAnyRole("PRO", "ADMIN")

                        // ===== TOUT LE RESTE =====
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authenticationConfiguration
    ) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
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