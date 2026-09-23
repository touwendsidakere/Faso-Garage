package com.fasogarages.backend.repository;

import com.fasogarages.backend.entity.Avis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;


public interface AvisRepository extends JpaRepository<Avis, Long> {

    /**
     * Liste des avis d'un professionnel, triés du plus récent au plus ancien
     * @param professionnelId L'ID du professionnel
     * @return Liste des avis
     */
    List<Avis> findByProfessionnelIdOrderByDateCreationDesc(Long professionnelId);

    /**
     * Vérifie si un utilisateur a déjà donné un avis pour un professionnel
     * @param utilisateurId L'ID de l'utilisateur
     * @param professionnelId L'ID du professionnel
     * @return Un Optional contenant l'avis s'il existe
     */
    Optional<Avis> findByUtilisateurIdAndProfessionnelId(Long utilisateurId, Long professionnelId);

    /**
     * Calcule la note moyenne d'un professionnel
     * @param professionnelId L'ID du professionnel
     * @return La moyenne des notes (ou null s'il n'y a pas d'avis)
     */
    @Query("SELECT AVG(a.note) FROM Avis a WHERE a.professionnel.id = :professionnelId")
    Double findAverageNoteByProfessionnelId(@Param("professionnelId") Long professionnelId);

    /**
     * Compte le nombre d'avis d'un professionnel
     * @param professionnelId L'ID du professionnel
     * @return Le nombre d'avis
     */
    long countByProfessionnelId(Long professionnelId);
}
