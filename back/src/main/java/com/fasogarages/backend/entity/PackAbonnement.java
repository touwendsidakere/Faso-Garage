package com.fasogarages.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pack_abonnement")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PackAbonnement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String nom;

    @Column(columnDefinition = "TEXT")
    private String description;

    @NotNull
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal prix;

    @Column(length = 3)
    @Builder.Default
    private String devise = "XOF";

    @NotNull
    @Column(name = "duree_jours", nullable = false)
    private Integer dureeJours;

    @Column(columnDefinition = "TEXT")
    private String avantages;

    @Column(name = "ordre_affichage")
    @Builder.Default
    private Integer ordreAffichage = 0;

    @Builder.Default
    private Boolean actif = true;

    // ===== Gestion des remises =====
    @Column(name = "prix_promo", precision = 10, scale = 2)
    private BigDecimal prixPromo;

    @Column(name = "date_debut_promo")
    private LocalDateTime dateDebutPromo;

    @Column(name = "date_fin_promo")
    private LocalDateTime dateFinPromo;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ===== Relations =====
    @OneToMany(mappedBy = "pack", fetch = FetchType.LAZY)
    @Builder.Default
    private List<AbonnementEntreprise> abonnements = new ArrayList<>();

    // ===== Méthodes utilitaires =====

    /**
     * Vérifie si une promotion est actuellement active
     */
    @Transient
    public boolean isPromoActive() {
        if (prixPromo == null || dateDebutPromo == null || dateFinPromo == null) {
            return false;
        }
        LocalDateTime now = LocalDateTime.now();
        return now.isAfter(dateDebutPromo) && now.isBefore(dateFinPromo);
    }

    /**
     * Retourne le prix actuel (promo ou normal)
     */
    @Transient
    public BigDecimal getPrixActuel() {
        return isPromoActive() ? prixPromo : prix;
    }
}