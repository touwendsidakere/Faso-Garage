package com.fasogarages.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "historique_abonnement")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HistoriqueAbonnement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_professionnel", nullable = false)
    private Professionnel professionnel;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_acces", nullable = false)
    private AbonnementEntreprise.TypeAcces typeAcces;

    @NotNull
    @Column(name = "date_debut", nullable = false)
    private LocalDateTime dateDebut;

    @Column(name = "date_fin")
    private LocalDateTime dateFin;

    @Enumerated(EnumType.STRING)
    private MotifHistorique motif;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // ===== Enum =====
    public enum MotifHistorique {
        INSCRIPTION,
        SOUSCRIPTION,
        EXPIRATION,
        ANNULATION,
        RENOUVELLEMENT
    }
}
