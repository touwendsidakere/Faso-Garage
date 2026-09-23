package com.fasogarages.backend.controller;

import com.fasogarages.backend.dto.AvisCreateDTO;
import com.fasogarages.backend.dto.AvisDTO;
import com.fasogarages.backend.entity.Utilisateur;
import com.fasogarages.backend.service.AvisService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/avis")
@RequiredArgsConstructor
@Tag(name = "Avis", description = "Endpoints pour la gestion des avis")
public class AvisController {

    private final AvisService avisService;

    @PostMapping
    @Operation(summary = "Laisser un avis sur un professionnel")
    public ResponseEntity<AvisDTO> createAvis(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody AvisCreateDTO dto
    ) {
        Utilisateur utilisateur = (Utilisateur) userDetails;
        return ResponseEntity.ok(avisService.createAvis(utilisateur.getId(), dto));
    }

    @GetMapping("/professionnel/{professionnelId}")
    @Operation(summary = "Obtenir tous les avis d'un professionnel")
    public ResponseEntity<List<AvisDTO>> getAvisByProfessionnel(
            @PathVariable Long professionnelId
    ) {
        return ResponseEntity.ok(avisService.getAvisByProfessionnel(professionnelId));
    }

    @GetMapping("/professionnel/{professionnelId}/moyenne")
    @Operation(summary = "Obtenir la note moyenne d'un professionnel")
    public ResponseEntity<Double> getAverageNote(
            @PathVariable Long professionnelId
    ) {
        Double moyenne = avisService.getAverageNote(professionnelId);
        return ResponseEntity.ok(moyenne != null ? moyenne : 0.0);
    }

    @GetMapping("/verifier/{professionnelId}")
    @Operation(summary = "Vérifier si l'utilisateur a déjà donné un avis")
    public ResponseEntity<Boolean> hasReviewed(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long professionnelId
    ) {
        Utilisateur utilisateur = (Utilisateur) userDetails;
        return ResponseEntity.ok(avisService.hasUserReviewed(utilisateur.getId(), professionnelId));
    }
}
