package com.fasogarages.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PackAbonnementDTO {
    private Long id;
    private String nom;
    private String description;
    private BigDecimal prix;
    private String devise;
    private Integer dureeJours;
    private String avantages;
    private Integer ordreAffichage;
    private Boolean actif;
    private BigDecimal prixPromo;
    private LocalDateTime dateDebutPromo;
    private LocalDateTime dateFinPromo;
    private BigDecimal prixActuel;
    private Boolean promoActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}