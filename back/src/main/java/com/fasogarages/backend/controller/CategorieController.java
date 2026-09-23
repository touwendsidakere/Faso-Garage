package com.fasogarages.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fasogarages.backend.entity.Categorie;
import com.fasogarages.backend.repository.CategorieRepository;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@Tag(name = "Catégories", description = "Endpoints publics pour les catégories")
public class CategorieController {

    private final CategorieRepository categorieRepository;

    @GetMapping
    @Operation(summary = "Obtenir la liste de toutes les catégories")
    public ResponseEntity<List<Categorie>> getAllCategories() {
        return ResponseEntity.ok(categorieRepository.findAll());
    }
}