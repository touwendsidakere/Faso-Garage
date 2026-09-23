package com.fasogarages.backend.controller;

import com.fasogarages.backend.entity.ServiceOffert;
import com.fasogarages.backend.repository.ServiceOffertRepository;
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
@RequestMapping("/api/services")
@RequiredArgsConstructor
@Tag(name = "Services", description = "Endpoints publics pour les services")
public class ServiceOffertController {

    private final ServiceOffertRepository serviceOffertRepository;

    @GetMapping
    @Operation(summary = "Obtenir la liste de tous les services")
    public ResponseEntity<List<ServiceOffert>> getAllServices() {
        return ResponseEntity.ok(serviceOffertRepository.findAll());
    }

    @GetMapping("/categorie/{categorieId}")
    @Operation(summary = "Obtenir les services d'une catégorie spécifique")
    public ResponseEntity<List<ServiceOffert>> getServicesByCategorie(@PathVariable Long categorieId) {
        return ResponseEntity.ok(serviceOffertRepository.findByCategorieId(categorieId));
    }
}