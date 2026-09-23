package com.fasogarages.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "config_offre_gratuite")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConfigOffreGratuite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Builder.Default
    private Boolean active = true;

    @Column(name = "duree_jours")
    @Builder.Default
    private Integer dureeJours = 90;

    @Column(name = "date_debut")
    private LocalDateTime dateDebut;

    @Column(name = "date_fin")
    private LocalDateTime dateFin;

    @Column(columnDefinition = "TEXT")
    private String message;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ===== Méthodes utilitaires =====

    /**
     * Vérifie si l'offre gratuite est actuellement valide
     * (active ET dans la période définie)
     */
    @Transient
    public boolean isOffreActive() {
        if (active == null || !active) {
            return false;
        }
        LocalDateTime now = LocalDateTime.now();
        if (dateDebut != null && now.isBefore(dateDebut)) {
            return false;
        }
        if (dateFin != null && now.isAfter(dateFin)) {
            return false;
        }
        return true;
    }
}
