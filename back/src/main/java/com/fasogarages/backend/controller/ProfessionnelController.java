package com.fasogarages.backend.controller;

import com.fasogarages.backend.dto.ProfessionnelDTO;
import com.fasogarages.backend.dto.ProfessionnelUpdateDTO;
import com.fasogarages.backend.entity.Utilisateur;
import com.fasogarages.backend.service.ProfessionnelService;
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
@RequestMapping("/api/professionnels")
@RequiredArgsConstructor
@Tag(name = "Professionnels", description = "Endpoints pour la gestion des professionnels")
public class ProfessionnelController {

    private final ProfessionnelService professionnelService;

    @GetMapping
    @Operation(summary = "Lister tous les professionnels validés")
    public ResponseEntity<List<ProfessionnelDTO>> getAllProfessionnels(
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lon,
            @RequestParam(required = false) String categorie,
            @RequestParam(required = false) String ville
    ) {
        return ResponseEntity.ok(professionnelService.getAllValidated(lat, lon, categorie, ville));
    }

    @GetMapping("/search")
    @Operation(summary = "Rechercher des professionnels par mot-clé")
    public ResponseEntity<List<ProfessionnelDTO>> searchProfessionnels(
            @RequestParam String keyword,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lon
    ) {
        return ResponseEntity.ok(professionnelService.search(keyword, lat, lon));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtenir les détails d'un professionnel")
    public ResponseEntity<ProfessionnelDTO> getProfessionnel(
            @PathVariable Long id,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lon
    ) {
        return ResponseEntity.ok(professionnelService.getById(id, lat, lon));
    }

    @GetMapping("/profil")
    @Operation(summary = "Obtenir le profil du professionnel connecté")
    public ResponseEntity<ProfessionnelDTO> getMyProfil(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Utilisateur utilisateur = (Utilisateur) userDetails;
        return ResponseEntity.ok(professionnelService.getByUserId(utilisateur.getId()));
    }

    @PutMapping("/profil")
    @Operation(summary = "Mettre à jour le profil du professionnel connecté")
    public ResponseEntity<ProfessionnelDTO> updateMyProfil(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ProfessionnelUpdateDTO dto
    ) {
        Utilisateur utilisateur = (Utilisateur) userDetails;
        return ResponseEntity.ok(professionnelService.updateProfil(utilisateur.getId(), dto));
    }
}
