package com.fasogarages.backend.repository;

import com.fasogarages.backend.entity.OffreAbonnement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OffreAbonnementRepository extends JpaRepository<OffreAbonnement, Long> {

    List<OffreAbonnement> findByActifTrue();
}
