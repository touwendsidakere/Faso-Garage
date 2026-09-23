package com.fasogarages.backend.controller;

import com.fasogarages.backend.dto.AbonnementDTO;
import com.fasogarages.backend.entity.Utilisateur;
import com.fasogarages.backend.service.AbonnementService;
import com.fasogarages.backend.service.ProfessionnelService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/abonnements")
@RequiredArgsConstructor
@Tag(name = "Abonnements", description = "Gestion des abonnements des professionnels")
public class AbonnementController {

    private final AbonnementService abonnementService;
    private final ProfessionnelService professionnelService;

    @GetMapping("/me")
    @PreAuthorize("hasRole('PRO')")
    @Operation(summary = "Voir son abonnement actif")
    public ResponseEntity<Map<String, Object>> getMonAbonnement(
            @AuthenticationPrincipal UserDetails userDetails) {
        Utilisateur utilisateur = (Utilisateur) userDetails;
        Long professionnelId = professionnelService.getByUserId(utilisateur.getId()).getId();

        AbonnementDTO abonnement = abonnementService.getAbonnementActif(professionnelId);
        boolean hasActif = abonnementService.hasAbonnementActif(professionnelId);

        Map<String, Object> response = new HashMap<>();
        response.put("abonnement", abonnement);
        response.put("hasAbonnementActif", hasActif);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/me/historique")
    @PreAuthorize("hasRole('PRO')")
    @Operation(summary = "Voir l'historique de ses abonnements")
    public ResponseEntity<List<AbonnementDTO>> getMonHistorique(
            @AuthenticationPrincipal UserDetails userDetails) {
        Utilisateur utilisateur = (Utilisateur) userDetails;
        Long professionnelId = professionnelService.getByUserId(utilisateur.getId()).getId();

        return ResponseEntity.ok(abonnementService.getAbonnementsByProfessionnel(professionnelId));
    }

    @PostMapping("/me/cancel")
    @PreAuthorize("hasRole('PRO')")
    @Operation(summary = "Annuler son abonnement actif")
    public ResponseEntity<Map<String, String>> annulerMonAbonnement(
            @AuthenticationPrincipal UserDetails userDetails) {
        Utilisateur utilisateur = (Utilisateur) userDetails;
        Long professionnelId = professionnelService.getByUserId(utilisateur.getId()).getId();

        abonnementService.annulerAbonnement(professionnelId);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Abonnement annulé avec succès");
        return ResponseEntity.ok(response);
    }
}