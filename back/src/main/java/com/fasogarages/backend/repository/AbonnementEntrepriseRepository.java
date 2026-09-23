package com.fasogarages.backend.repository;

import com.fasogarages.backend.entity.AbonnementEntreprise;
import com.fasogarages.backend.entity.AbonnementEntreprise.StatutAbonnement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface AbonnementEntrepriseRepository extends JpaRepository<AbonnementEntreprise, Long> {

    Optional<AbonnementEntreprise> findByProfessionnelIdAndStatut(Long professionnelId, StatutAbonnement statut);

    List<AbonnementEntreprise> findByProfessionnelIdOrderByCreatedAtDesc(Long professionnelId);

    List<AbonnementEntreprise> findByStatut(StatutAbonnement statut);

    Optional<AbonnementEntreprise> findFirstByProfessionnelIdOrderByCreatedAtDesc(Long professionnelId);

    @Query("SELECT COUNT(a) > 0 FROM AbonnementEntreprise a " +
           "WHERE a.professionnel.id = :professionnelId " +
           "AND a.typeAcces = 'GRATUIT'")
    boolean hasDejaEuAbonnementGratuit(@Param("professionnelId") Long professionnelId);

    @Query("SELECT a FROM AbonnementEntreprise a " +
           "WHERE a.statut = 'ACTIF' " +
           "AND a.dateFin BETWEEN :maintenant AND :dansXJours " +
           "AND a.notificationEnvoyee = false")
    List<AbonnementEntreprise> findAbonnementsExpirantBientot(
            @Param("maintenant") LocalDateTime maintenant,
            @Param("dansXJours") LocalDateTime dansXJours);

    @Query("SELECT a FROM AbonnementEntreprise a " +
           "WHERE a.statut = 'ACTIF' " +
           "AND a.dateFin < :maintenant")
    List<AbonnementEntreprise> findAbonnementsExpires(@Param("maintenant") LocalDateTime maintenant);

    // ===== NOUVELLE MÉTHODE OPTIMISÉE =====
    
    /**
     * Récupère les IDs de tous les professionnels qui ont un abonnement actif.
     * Évite le problème N+1 (une seule requête SQL au lieu de N).
     */
    @Query("SELECT DISTINCT a.professionnel.id FROM AbonnementEntreprise a " +
           "WHERE a.statut = 'ACTIF' " +
           "AND a.dateDebut <= :maintenant " +
           "AND a.dateFin >= :maintenant")
    List<Long> findProfessionnelIdsAvecAbonnementActif(@Param("maintenant") LocalDateTime maintenant);
}