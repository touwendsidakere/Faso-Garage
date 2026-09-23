package com.fasogarages.backend.repository;

import com.fasogarages.backend.entity.ConfigOffreGratuite;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ConfigOffreGratuiteRepository extends JpaRepository<ConfigOffreGratuite, Long> {

    /**
     * Récupère la configuration actuelle de l'offre gratuite.
     * Il ne devrait y avoir qu'une seule ligne dans cette table.
     */
    default Optional<ConfigOffreGratuite> findConfig() {
        return findAll().stream().findFirst();
    }
}