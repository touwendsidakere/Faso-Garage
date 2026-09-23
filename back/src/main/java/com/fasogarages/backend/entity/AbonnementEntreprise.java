package com.fasogarages.backend.entity;

import jakarta.persistence.*;
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
@Table(name = "abonnement_entreprise")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AbonnementEntreprise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_professionnel", nullable = false)
    private Professionnel professionnel;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_pack")
    private PackAbonnement pack;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_acces", nullable = false)
    private TypeAcces typeAcces;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private StatutAbonnement statut = StatutAbonnement.ACTIF;

    @NotNull
    @Column(name = "date_debut", nullable = false)
    private LocalDateTime dateDebut;

    @NotNull
    @Column(name = "date_fin", nullable = false)
    private LocalDateTime dateFin;

    @Column(name = "montant_paye", precision = 10, scale = 2)
    private BigDecimal montantPaye;

    @Column(name = "transaction_id")
    private String transactionId;

    @Column(name = "notification_envoyee")
    @Builder.Default
    private Boolean notificationEnvoyee = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ===== Relations =====
    @OneToMany(mappedBy = "abonnement", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<PaiementAbonnement> paiements = new ArrayList<>();

    // ===== Enums =====
    public enum TypeAcces {
        GRATUIT,
        PAYANT
    }

    public enum StatutAbonnement {
        ACTIF,
        EXPIRE,
        ANNULE,
        EN_ATTENTE
    }

    // ===== Méthodes utilitaires =====

    /**
     * Vérifie si l'abonnement est actuellement valide
     */
    @Transient
    public boolean isActif() {
        if (statut != StatutAbonnement.ACTIF) {
            return false;
        }
        LocalDateTime now = LocalDateTime.now();
        return now.isAfter(dateDebut) && now.isBefore(dateFin);
    }

    /**
     * Vérifie si l'abonnement est expiré
     */
    @Transient
    public boolean isExpire() {
        return LocalDateTime.now().isAfter(dateFin);
    }

    /**
     * Retourne le nombre de jours restants
     */
    @Transient
    public long getJoursRestants() {
        if (isExpire()) return 0;
        return java.time.temporal.ChronoUnit.DAYS.between(LocalDateTime.now(), dateFin);
    }
}