package com.fasogarages.backend.controller;

import com.fasogarages.backend.dto.AuthResponse;
import com.fasogarages.backend.dto.RegisterRequest;
import com.fasogarages.backend.entity.Utilisateur;
import com.fasogarages.backend.repository.UtilisateurRepository;
import com.fasogarages.backend.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentification", description = "Inscription (le login est géré par Keycloak)")
public class AuthController {

    private final AuthService authService;
    private final UtilisateurRepository utilisateurRepository;

    @PostMapping("/register")
    @Operation(summary = "Inscription d'un nouvel utilisateur (dans Keycloak + base locale)")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @GetMapping("/me")
    @Operation(summary = "Récupérer les informations de l'utilisateur connecté")
    public ResponseEntity<AuthResponse> me(@AuthenticationPrincipal Jwt jwt) {
        String telephone = jwt.getClaimAsString("preferred_username");

        Utilisateur utilisateur = utilisateurRepository.findByTelephone(telephone)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé : " + telephone));

        return ResponseEntity.ok(AuthResponse.builder()
                .telephone(utilisateur.getTelephone())
                .email(utilisateur.getEmail())
                .nom(utilisateur.getNom())
                .prenom(utilisateur.getPrenom())
                .role(utilisateur.getRole().name())
                .userId(utilisateur.getId())
                .build());
    }
}