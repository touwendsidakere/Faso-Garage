package com.fasogarages.backend.service;

import com.fasogarages.backend.dto.AvisCreateDTO;
import com.fasogarages.backend.dto.AvisDTO;
import com.fasogarages.backend.entity.Avis;
import com.fasogarages.backend.entity.Professionnel;
import com.fasogarages.backend.entity.Utilisateur;
import com.fasogarages.backend.repository.AvisRepository;
import com.fasogarages.backend.repository.ProfessionnelRepository;
import com.fasogarages.backend.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AvisService {

    private final AvisRepository avisRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final ProfessionnelRepository professionnelRepository;

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    /**
     * Convertit une entité Avis en DTO
     */
    private AvisDTO toDTO(Avis avis) {
        return AvisDTO.builder()
                .id(avis.getId())
                .userId(avis.getUtilisateur().getId())
                .nomUtilisateur(avis.getUtilisateur().getNom())
                .prenomUtilisateur(avis.getUtilisateur().getPrenom())
                .note(avis.getNote())
                .commentaire(avis.getCommentaire())
                .dateCreation(avis.getDateCreation() != null ?
                        avis.getDateCreation().format(DATE_FORMAT) : null)
                .build();
    }

    /**
     * Crée un nouvel avis
     */
    @Transactional
    public AvisDTO createAvis(Long userId, AvisCreateDTO dto) {
        // Vérifier si l'utilisateur existe
        Utilisateur utilisateur = utilisateurRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        // Vérifier si le professionnel existe et est validé
        Professionnel professionnel = professionnelRepository.findById(dto.getProfessionnelId())
                .orElseThrow(() -> new RuntimeException("Professionnel non trouvé"));

        if (professionnel.getStatut() != Professionnel.Statut.VALIDE) {
            throw new RuntimeException("Ce professionnel n'est pas encore validé");
        }

        // Vérifier si l'utilisateur a déjà donné un avis pour ce professionnel
        if (avisRepository.findByUtilisateurIdAndProfessionnelId(userId, dto.getProfessionnelId()).isPresent()) {
            throw new RuntimeException("Vous avez déjà donné un avis pour ce professionnel");
        }

        // Créer l'avis
        Avis avis = Avis.builder()
                .utilisateur(utilisateur)
                .professionnel(professionnel)
                .note(dto.getNote())
                .commentaire(dto.getCommentaire())
                .build();

        avis = avisRepository.save(avis);
        return toDTO(avis);
    }

    /**
     * Récupère tous les avis d'un professionnel
     */
    public List<AvisDTO> getAvisByProfessionnel(Long professionnelId) {
        List<Avis> avis = avisRepository.findByProfessionnelIdOrderByDateCreationDesc(professionnelId);
        return avis.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Calcule la note moyenne d'un professionnel
     */
    public Double getAverageNote(Long professionnelId) {
        return avisRepository.findAverageNoteByProfessionnelId(professionnelId);
    }

    /**
     * Vérifie si un utilisateur a déjà donné un avis pour un professionnel
     */
    public boolean hasUserReviewed(Long userId, Long professionnelId) {
        return avisRepository.findByUtilisateurIdAndProfessionnelId(userId, professionnelId).isPresent();
    }
}
