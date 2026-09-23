package com.fasogarages.backend.repository;

import com.fasogarages.backend.entity.ImageProfessionnel;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;


public interface ImageProfessionnelRepository extends JpaRepository<ImageProfessionnel, Long> {

    /**
     * Liste des images d'un professionnel, triées par ordre d'affichage
     * @param professionnelId L'ID du professionnel
     * @return Liste des images
     */
    List<ImageProfessionnel> findByProfessionnelIdOrderByOrdreAsc(Long professionnelId);

    /**
     * Supprime toutes les images d'un professionnel
     * @param professionnelId L'ID du professionnel
     */
    void deleteByProfessionnelId(Long professionnelId);

    /**
     * Recherche une image par son ID et l'ID du professionnel (pour la sécurité)
     * @param id L'ID de l'image
     * @param professionnelId L'ID du professionnel
     * @return Un Optional contenant l'image
     */
    Optional<ImageProfessionnel> findByIdAndProfessionnelId(Long id, Long professionnelId);
}
