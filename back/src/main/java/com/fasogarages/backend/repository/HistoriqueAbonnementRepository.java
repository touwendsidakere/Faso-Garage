package com.fasogarages.backend.repository;

import com.fasogarages.backend.entity.HistoriqueAbonnement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HistoriqueAbonnementRepository extends JpaRepository<HistoriqueAbonnement, Long> {

    /**
     * Liste l'historique des abonnements d'un professionnel
     */
    List<HistoriqueAbonnement> findByProfessionnelIdOrderByCreatedAtDesc(Long professionnelId);

    /**
     * Vérifie si un professionnel a déjà bénéficié de l'offre gratuite
     */
    boolean existsByProfessionnelIdAndMotif(Long professionnelId, HistoriqueAbonnement.MotifHistorique motif);
}