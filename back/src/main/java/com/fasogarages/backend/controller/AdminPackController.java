package com.fasogarages.backend.controller;

import com.fasogarages.backend.dto.PackAbonnementDTO;
import com.fasogarages.backend.service.PackAbonnementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin/packs")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin - Packs d'abonnement", description = "Gestion des packs par l'administrateur")
public class AdminPackController {

    private final PackAbonnementService packService;

    @GetMapping
    @Operation(summary = "Lister tous les packs (y compris non publiés)")
    public ResponseEntity<List<PackAbonnementDTO>> getAllPacks() {
        return ResponseEntity.ok(packService.getAllPacks());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Récupérer un pack par son ID")
    public ResponseEntity<PackAbonnementDTO> getPackById(@PathVariable Long id) {
        return ResponseEntity.ok(packService.getPackById(id));
    }

    @PostMapping
    @Operation(summary = "Créer un nouveau pack")
    public ResponseEntity<PackAbonnementDTO> createPack(@Valid @RequestBody PackAbonnementDTO dto) {
        PackAbonnementDTO created = packService.createPack(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Modifier un pack existant")
    public ResponseEntity<PackAbonnementDTO> updatePack(
            @PathVariable Long id,
            @Valid @RequestBody PackAbonnementDTO dto) {
        return ResponseEntity.ok(packService.updatePack(id, dto));
    }

    @PutMapping("/{id}/publier")
    @Operation(summary = "Publier ou dépublier un pack")
    public ResponseEntity<PackAbonnementDTO> togglePublier(@PathVariable Long id) {
        return ResponseEntity.ok(packService.togglePublier(id));
    }

    @PutMapping("/{id}/promo")
    @Operation(summary = "Appliquer une promotion sur un pack")
    public ResponseEntity<PackAbonnementDTO> appliquerPromo(
            @PathVariable Long id,
            @RequestParam BigDecimal prixPromo,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateDebut,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateFin) {
        return ResponseEntity.ok(packService.appliquerPromo(id, prixPromo, dateDebut, dateFin));
    }

    @DeleteMapping("/{id}/promo")
    @Operation(summary = "Supprimer une promotion")
    public ResponseEntity<PackAbonnementDTO> supprimerPromo(@PathVariable Long id) {
        return ResponseEntity.ok(packService.supprimerPromo(id));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer un pack (si non utilisé)")
    public ResponseEntity<Void> deletePack(@PathVariable Long id) {
        packService.deletePack(id);
        return ResponseEntity.noContent().build();
    }
}
