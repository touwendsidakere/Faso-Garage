package com.fasogarages.backend.service;

import com.fasogarages.backend.dto.ProfessionnelDTO;
import com.fasogarages.backend.dto.ProfessionnelUpdateDTO;
import com.fasogarages.backend.entity.Professionnel;
import com.fasogarages.backend.entity.Professionnel.Statut;
import com.fasogarages.backend.entity.ServiceOffert;
import com.fasogarages.backend.repository.AvisRepository;
import com.fasogarages.backend.repository.ProfessionnelRepository;
import com.fasogarages.backend.repository.ServiceOffertRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProfessionnelService {

    private final ProfessionnelRepository professionnelRepository;
    private final ServiceOffertRepository serviceOffertRepository;
    private final AvisRepository avisRepository;
    
    @Lazy  // ← Évite la dépendance circulaire avec AbonnementService
    private final AbonnementService abonnementService;

    private double calculerDistance(double lat1, double lon1, double lat2, double lon2) {
        final int RAYON_TERRE = 6371;
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return RAYON_TERRE * c;
    }

    private ProfessionnelDTO toDTO(Professionnel p, Double userLat, Double userLon) {
        Double distance = null;
        if (userLat != null && userLon != null) {
            distance = calculerDistance(userLat, userLon, p.getLatitude(), p.getLongitude());
        }

        Double moyenne = avisRepository.findAverageNoteByProfessionnelId(p.getId());
        Integer nbAvis = p.getAvis() != null ? p.getAvis().size() : 0;

        String categorieLibelle = null;
        Long categorieId = null;
        if (!p.getServices().isEmpty()) {
            categorieLibelle = p.getServices().get(0).getCategorie().getLibelle();
            categorieId = p.getServices().get(0).getCategorie().getId();
        }

        List<Long> serviceIds = p.getServices().stream()
                .map(ServiceOffert::getId)
                .collect(Collectors.toList());
        List<String> services = p.getServices().stream()
                .map(ServiceOffert::getLibelle)
                .collect(Collectors.toList());

        return ProfessionnelDTO.builder()
                .id(p.getId())
                .nomEtablissement(p.getNomEtablissement())
                .categorie(categorieLibelle)
                .categorieId(categorieId)
                .serviceIds(serviceIds)
                .services(services)
                .description(p.getDescription())
                .telephone(p.getTelephone())
                .whatsapp(p.getWhatsapp())
                .latitude(p.getLatitude())
                .longitude(p.getLongitude())
                .ville(p.getVille())
                .horaires(p.getHoraires())
                .statut(p.getStatut().name())
                .logoUrl(p.getLogoUrl())
                .photoCouverture(p.getPhotoCouverture())
                .distance(distance)
                .moyenneNotes(moyenne != null ? Math.round(moyenne * 10.0) / 10.0 : 0.0)
                .nombreAvis(nbAvis)
                .nomProprietaire(p.getUtilisateur().getNom())
                .prenomProprietaire(p.getUtilisateur().getPrenom())
                .emailProprietaire(p.getUtilisateur().getEmail())
                .telephoneProprietaire(p.getUtilisateur().getTelephone())
                .appelPossible(p.getTelephone() != null && !p.getTelephone().isEmpty())
                .build();
    }

    /**
     * Liste les professionnels VALIDÉS et AVEC ABONNEMENT ACTIF.
     */
    public List<ProfessionnelDTO> getAllValidated(Double userLat, Double userLon, String categorie, String ville) {
        List<Professionnel> professionnels = professionnelRepository.findByStatut(Statut.VALIDE);

        // Filtre par catégorie
        if (categorie != null && !categorie.isEmpty()) {
            professionnels = professionnels.stream()
                    .filter(p -> p.getServices().stream()
                            .anyMatch(s -> s.getCategorie().getLibelle().equalsIgnoreCase(categorie)))
                    .collect(Collectors.toList());
        }

        // Filtre par ville
        if (ville != null && !ville.isEmpty()) {
            professionnels = professionnels.stream()
                    .filter(p -> p.getVille() != null && p.getVille().equalsIgnoreCase(ville))
                    .collect(Collectors.toList());
        }

        // ⭐ NOUVEAU : Filtre par abonnement actif (UNE SEULE requête SQL)
        Set<Long> prosAvecAbonnement = abonnementService.getProfessionnelIdsAvecAbonnementActif();
        professionnels = professionnels.stream()
                .filter(p -> prosAvecAbonnement.contains(p.getId()))
                .collect(Collectors.toList());

        return professionnels.stream()
                .map(p -> toDTO(p, userLat, userLon))
                .sorted((p1, p2) -> {
                    if (p1.getDistance() == null && p2.getDistance() == null) return 0;
                    if (p1.getDistance() == null) return 1;
                    if (p2.getDistance() == null) return -1;
                    return Double.compare(p1.getDistance(), p2.getDistance());
                })
                .collect(Collectors.toList());
    }

    public List<ProfessionnelDTO> search(String keyword, Double userLat, Double userLon) {
        List<Professionnel> professionnels = professionnelRepository.searchByKeyword(keyword);
        
        // ⭐ Filtre par abonnement actif
        Set<Long> prosAvecAbonnement = abonnementService.getProfessionnelIdsAvecAbonnementActif();
        professionnels = professionnels.stream()
                .filter(p -> prosAvecAbonnement.contains(p.getId()))
                .collect(Collectors.toList());
        
        return professionnels.stream()
                .map(p -> toDTO(p, userLat, userLon))
                .collect(Collectors.toList());
    }

    public ProfessionnelDTO getById(Long id, Double userLat, Double userLon) {
        Professionnel professionnel = professionnelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Professionnel non trouvé"));

        if (professionnel.getStatut() != Statut.VALIDE) {
            throw new RuntimeException("Ce professionnel n'est pas encore validé");
        }

        // ⭐ Vérifier que le pro a un abonnement actif
        if (!abonnementService.hasAbonnementActif(id)) {
            throw new RuntimeException("Ce professionnel n'a pas d'abonnement actif");
        }

        return toDTO(professionnel, userLat, userLon);
    }

    public ProfessionnelDTO getByUserId(Long userId) {
        Professionnel professionnel = professionnelRepository.findByUtilisateurId(userId)
                .orElseThrow(() -> new RuntimeException("Profil professionnel non trouvé"));
        return toDTO(professionnel, null, null);
    }

    @Transactional
    public ProfessionnelDTO updateProfil(Long userId, ProfessionnelUpdateDTO dto) {
        Professionnel professionnel = professionnelRepository.findByUtilisateurId(userId)
                .orElseThrow(() -> new RuntimeException("Profil professionnel non trouvé"));

        if (dto.getNomEtablissement() != null) {
            professionnel.setNomEtablissement(dto.getNomEtablissement());
        }

        if (dto.getServiceIds() != null && !dto.getServiceIds().isEmpty()) {
            List<ServiceOffert> services = serviceOffertRepository.findAllById(dto.getServiceIds());
            if (services.size() != dto.getServiceIds().size()) {
                throw new RuntimeException("Un ou plusieurs services n'existent pas");
            }
            professionnel.setServices(services);
        }

        if (dto.getDescription() != null) professionnel.setDescription(dto.getDescription());
        if (dto.getTelephone() != null) professionnel.setTelephone(dto.getTelephone());
        if (dto.getWhatsapp() != null) professionnel.setWhatsapp(dto.getWhatsapp());
        if (dto.getLatitude() != null) professionnel.setLatitude(dto.getLatitude());
        if (dto.getLongitude() != null) professionnel.setLongitude(dto.getLongitude());
        if (dto.getVille() != null) professionnel.setVille(dto.getVille());
        if (dto.getHoraires() != null) professionnel.setHoraires(dto.getHoraires());

        professionnel = professionnelRepository.save(professionnel);
        return toDTO(professionnel, null, null);
    }

    public List<ProfessionnelDTO> getPendingProfessionals() {
        List<Professionnel> professionnels = professionnelRepository.findByStatut(Statut.EN_ATTENTE);
        return professionnels.stream()
                .map(p -> toDTO(p, null, null))
                .collect(Collectors.toList());
    }

    @Transactional
    public ProfessionnelDTO validateProfessional(Long id, boolean valider) {
        Professionnel professionnel = professionnelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Professionnel non trouvé"));

        professionnel.setStatut(valider ? Statut.VALIDE : Statut.REJETE);
        professionnel = professionnelRepository.save(professionnel);
        return toDTO(professionnel, null, null);
    }

        // ============================================================
    // MÉTHODES POUR L'ADMIN
    // ============================================================

    /**
     * Liste TOUS les professionnels (tous statuts confondus) - Pour l'admin
     */
    public List<ProfessionnelDTO> getAllForAdmin() {
        return professionnelRepository.findAll().stream()
                .map(p -> toDTO(p, null, null))
                .collect(Collectors.toList());
    }

    /**
     * Liste les professionnels REJETÉS - Pour l'admin
     */
    public List<ProfessionnelDTO> getRejected() {
        return professionnelRepository.findByStatut(Statut.REJETE).stream()
                .map(p -> toDTO(p, null, null))
                .collect(Collectors.toList());
    }

    /**
     * Créer un professionnel directement par l'admin (validé d'emblée)
     * NOTE : Cette méthode est déléguée à AuthService.createByAdmin()
     * car elle doit créer un Utilisateur + un Professionnel + un Abonnement.
     */
    @Transactional
    public ProfessionnelDTO createByAdmin(com.fasogarages.backend.dto.AdminCreateProfessionnelDTO dto) {
        // Créer l'utilisateur + le professionnel via AuthService
        // puis retourner le DTO du professionnel créé
        
        // Solution : On utilise AuthService qui gère la création complète
        // et on récupère ensuite le professionnel créé
        throw new RuntimeException(
            "Utilisez plutôt POST /api/admin/utilisateurs avec role=ROLE_PRO pour créer un professionnel. " +
            "Cette méthode est conservée pour compatibilité mais délègue à AuthService."
        );
    }

    /**
     * Modifier un professionnel (par l'admin)
     */
    @Transactional
    public ProfessionnelDTO updateByAdmin(Long id, ProfessionnelUpdateDTO dto) {
        Professionnel professionnel = professionnelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Professionnel non trouvé"));

        if (dto.getNomEtablissement() != null) {
            professionnel.setNomEtablissement(dto.getNomEtablissement());
        }

        if (dto.getServiceIds() != null && !dto.getServiceIds().isEmpty()) {
            List<ServiceOffert> services = serviceOffertRepository.findAllById(dto.getServiceIds());
            if (services.size() != dto.getServiceIds().size()) {
                throw new RuntimeException("Un ou plusieurs services n'existent pas");
            }
            professionnel.setServices(services);
        }

        if (dto.getDescription() != null) professionnel.setDescription(dto.getDescription());
        if (dto.getTelephone() != null) professionnel.setTelephone(dto.getTelephone());
        if (dto.getWhatsapp() != null) professionnel.setWhatsapp(dto.getWhatsapp());
        if (dto.getLatitude() != null) professionnel.setLatitude(dto.getLatitude());
        if (dto.getLongitude() != null) professionnel.setLongitude(dto.getLongitude());
        if (dto.getVille() != null) professionnel.setVille(dto.getVille());
        if (dto.getHoraires() != null) professionnel.setHoraires(dto.getHoraires());

        professionnel = professionnelRepository.save(professionnel);
        return toDTO(professionnel, null, null);
    }

    /**
     * Supprimer un professionnel par son ID (admin)
     * La suppression de l'utilisateur associé se fait en cascade.
     */
    @Transactional
    public void deleteById(Long id) {
        Professionnel professionnel = professionnelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Professionnel non trouvé"));

        // Supprimer l'utilisateur associé (cascade supprime aussi le professionnel)
        // OU supprimer directement le professionnel (selon la config)
        professionnelRepository.delete(professionnel);
    }
}