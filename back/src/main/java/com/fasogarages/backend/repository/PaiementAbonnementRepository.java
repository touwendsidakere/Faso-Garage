package com.fasogarages.backend.repository;

import com.fasogarages.backend.entity.PaiementAbonnement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaiementAbonnementRepository extends JpaRepository<PaiementAbonnement, Long> {

    /**
     * Liste les paiements d'un abonnement
     */
    List<PaiementAbonnement> findByAbonnementIdOrderByDatePaiementDesc(Long abonnementId);

    /**
     * Récupère un paiement par son ID de transaction (Sappay)
     */
    Optional<PaiementAbonnement> findByTransactionId(String transactionId);
}