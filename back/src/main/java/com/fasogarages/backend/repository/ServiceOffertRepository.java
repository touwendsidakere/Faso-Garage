package com.fasogarages.backend.repository;

import com.fasogarages.backend.entity.ServiceOffert;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ServiceOffertRepository extends JpaRepository<ServiceOffert, Long> {

    List<ServiceOffert> findByCategorieId(Long categorieId);

    List<ServiceOffert> findByCategorieIsNull();

    Optional<ServiceOffert> findByLibelleIgnoreCaseAndCategorieId(String libelle, Long categorieId);

    boolean existsByLibelleIgnoreCaseAndCategorieId(String libelle, Long categorieId);
}