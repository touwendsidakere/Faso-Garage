package com.fasogarages.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Un pack d'abonnement proposé aux professionnels (géré par l'admin),
 * ex: "Basique", "Standard", "Premium", chacun avec son propre prix.
 */
@Entity
@Table(name = "offre_abonnement")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OffreAbonnement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String nom;

    @Column(length = 1000)
    private String description;

    @NotNull
    @Positive
    @Column(nullable = false)
    private Double prix;

    @NotNull
    @Positive
    @Column(name = "duree_mois", nullable = false)
    @Builder.Default
    private Integer dureeMois = 12;

    @Column(nullable = false)
    @Builder.Default
    private boolean actif = true;
}
