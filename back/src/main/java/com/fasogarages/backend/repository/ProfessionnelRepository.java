package com.fasogarages.backend.repository;

import com.fasogarages.backend.entity.Professionnel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProfessionnelRepository extends JpaRepository<Professionnel, Long> {

    List<Professionnel> findByStatut(Professionnel.Statut statut);

    Optional<Professionnel> findByUtilisateurId(Long utilisateurId);

    // ← SUPPRIMER cette méthode car 'categorieId' n'existe plus
    // List<Professionnel> findByCategorieId(Long categorieId);

    List<Professionnel> findByVilleContainingIgnoreCase(String ville);

    @Query("SELECT p FROM Professionnel p WHERE p.statut = 'VALIDE' AND " +
           "(LOWER(p.nomEtablissement) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.ville) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Professionnel> searchByKeyword(@Param("keyword") String keyword);

    @Query("SELECT p FROM Professionnel p WHERE p.statut = 'VALIDE' AND " +
           "EXISTS (SELECT s FROM p.services s WHERE s.categorie.id = :categorieId)")
    List<Professionnel> findValidatedByCategorieId(@Param("categorieId") Long categorieId);
}