package com.fasogarages.backend.controller;

import com.fasogarages.backend.entity.Publicite;
import com.fasogarages.backend.repository.PubliciteRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/publicites")
@RequiredArgsConstructor
@Tag(name = "Publicités", description = "Endpoints publics pour le carrousel publicitaire")
public class PubliciteController {

    private final PubliciteRepository publiciteRepository;

    @GetMapping("/actives")
    @Operation(summary = "Lister les publicités actuellement actives et dans leur période de diffusion")
    public ResponseEntity<List<Publicite>> getPublicitesActives() {
        LocalDate aujourdHui = LocalDate.now();

        List<Publicite> actives = publiciteRepository.findAll().stream()
                .filter(Publicite::isActif)
                .filter(p -> p.getDateDebut() == null || !p.getDateDebut().isAfter(aujourdHui))
                .filter(p -> p.getDateFin() == null || !p.getDateFin().isBefore(aujourdHui))
                .toList();

        return ResponseEntity.ok(actives);
    }
}