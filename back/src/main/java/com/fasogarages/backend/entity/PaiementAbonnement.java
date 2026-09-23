package com.fasogarages.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "paiement_abonnement")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaiementAbonnement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_abonnement", nullable = false)
    private AbonnementEntreprise abonnement;

    @Column(name = "transaction_id")
    private String transactionId;

    @Column(precision = 10, scale = 2)
    private BigDecimal montant;

    @Column(length = 3)
    @Builder.Default
    private String devise = "XOF";

    @Enumerated(EnumType.STRING)
    private StatutPaiement statut;

    @CreationTimestamp
    @Column(name = "date_paiement", updatable = false)
    private LocalDateTime datePaiement;

    // ===== Enum =====
    public enum StatutPaiement {
        EN_ATTENTE,
        SUCCES,
        ECHEC,
        ANNULE
    }
}