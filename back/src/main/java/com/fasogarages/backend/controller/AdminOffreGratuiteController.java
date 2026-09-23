package com.fasogarages.backend.controller;

import com.fasogarages.backend.dto.ConfigOffreGratuiteDTO;
import com.fasogarages.backend.service.ConfigOffreGratuiteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/offre-gratuite")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin - Offre gratuite", description = "Gestion de l'offre gratuite par l'administrateur")
public class AdminOffreGratuiteController {

    private final ConfigOffreGratuiteService configService;

    @GetMapping
    @Operation(summary = "Voir la configuration actuelle de l'offre gratuite")
    public ResponseEntity<ConfigOffreGratuiteDTO> getConfig() {
        return ResponseEntity.ok(configService.getConfig());
    }

    @PutMapping
    @Operation(summary = "Modifier la configuration de l'offre gratuite")
    public ResponseEntity<ConfigOffreGratuiteDTO> updateConfig(
            @Valid @RequestBody ConfigOffreGratuiteDTO dto) {
        return ResponseEntity.ok(configService.updateConfig(dto));
    }

    @PutMapping("/toggle")
    @Operation(summary = "Activer ou désactiver l'offre gratuite")
    public ResponseEntity<ConfigOffreGratuiteDTO> toggleActive() {
        return ResponseEntity.ok(configService.toggleActive());
    }
}
