package com.fasogarages.backend.repository;

import com.fasogarages.backend.entity.Categorie;
import org.springframework.data.jpa.repository.JpaRepository;


import java.util.Optional;


public interface CategorieRepository extends JpaRepository<Categorie, Long> {

    /**
     * Recherche une catégorie par son libellé (insensible à la casse)
     * @param libelle Le libellé de la catégorie
     * @return Un Optional contenant la catégorie
     */
    Optional<Categorie> findByLibelleIgnoreCase(String libelle);
}
