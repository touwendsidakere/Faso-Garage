package com.fasogarages.backend.controller;

import com.fasogarages.backend.entity.AnnonceDefilante;
import com.fasogarages.backend.entity.Astuce;
import com.fasogarages.backend.entity.NumeroUtile;
import com.fasogarages.backend.repository.AnnonceDefilanteRepository;
import com.fasogarages.backend.repository.AstuceRepository;
import com.fasogarages.backend.repository.NumeroUtileRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
@Tag(name = "Public", description = "Endpoints accessibles sans authentification")
public class PublicController {

    private final NumeroUtileRepository numeroUtileRepository;
    private final AstuceRepository astuceRepository;
    private final AnnonceDefilanteRepository annonceDefilanteRepository;

    @GetMapping("/numeros-utiles")
    @Operation(summary = "Obtenir tous les numéros utiles")
    public ResponseEntity<List<NumeroUtile>> getNumerosUtiles() {
        return ResponseEntity.ok(numeroUtileRepository.findAll());
    }

    @GetMapping("/numeros-utiles/type/{type}")
    @Operation(summary = "Obtenir les numéros utiles par type")
    public ResponseEntity<List<NumeroUtile>> getNumerosUtilesByType(@PathVariable String type) {
        return ResponseEntity.ok(numeroUtileRepository.findByTypeOrderByNomAsc(type));
    }

    @GetMapping("/astuces")
    @Operation(summary = "Obtenir toutes les astuces")
    public ResponseEntity<List<Astuce>> getAstuces() {
        return ResponseEntity.ok(astuceRepository.findAllByOrderByDatePublicationDesc());
    }

    @GetMapping("/annonce-defilante")
    @Operation(summary = "Récupérer l'annonce défilante active (bandeau header)")
    public ResponseEntity<List<AnnonceDefilante>> getAnnonceActive() {
        List<AnnonceDefilante> annonces = annonceDefilanteRepository.findAll().stream()
                .filter(AnnonceDefilante::isActif)
                .toList();
        return ResponseEntity.ok(annonces);
    }
}