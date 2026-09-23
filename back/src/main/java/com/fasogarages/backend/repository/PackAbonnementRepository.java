package com.fasogarages.backend.repository;

import com.fasogarages.backend.entity.PackAbonnement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PackAbonnementRepository extends JpaRepository<PackAbonnement, Long> {

    /**
     * Liste tous les packs actifs (publiés), triés par ordre d'affichage
     */
    List<PackAbonnement> findByActifTrueOrderByOrdreAffichageAsc();

    /**
     * Liste tous les packs, triés par ordre d'affichage
     */
    List<PackAbonnement> findAllByOrderByOrdreAffichageAsc();

    /**
     * Vérifie si un pack avec ce nom existe déjà
     */
    boolean existsByNomIgnoreCase(String nom);
}