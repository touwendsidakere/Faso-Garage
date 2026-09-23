package com.fasogarages.backend.service;

import com.fasogarages.backend.dto.PackAbonnementDTO;
import com.fasogarages.backend.entity.PackAbonnement;
import com.fasogarages.backend.repository.PackAbonnementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PackAbonnementService {

    private final PackAbonnementRepository packRepository;

    // ===== LECTURE =====

    /**
     * Liste tous les packs (pour l'admin)
     */
    public List<PackAbonnementDTO> getAllPacks() {
        return packRepository.findAllByOrderByOrdreAffichageAsc()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Liste les packs publiés (pour les pros)
     */
    public List<PackAbonnementDTO> getPacksPublies() {
        return packRepository.findByActifTrueOrderByOrdreAffichageAsc()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Récupère un pack par son ID
     */
    public PackAbonnementDTO getPackById(Long id) {
        PackAbonnement pack = packRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pack non trouvé"));
        return toDTO(pack);
    }

    // ===== CRÉATION =====

    /**
     * Crée un nouveau pack
     */
    @Transactional
    public PackAbonnementDTO createPack(PackAbonnementDTO dto) {
        if (packRepository.existsByNomIgnoreCase(dto.getNom())) {
            throw new RuntimeException("Un pack avec ce nom existe déjà");
        }

        PackAbonnement pack = PackAbonnement.builder()
                .nom(dto.getNom())
                .description(dto.getDescription())
                .prix(dto.getPrix())
                .devise(dto.getDevise() != null ? dto.getDevise() : "XOF")
                .dureeJours(dto.getDureeJours())
                .avantages(dto.getAvantages())
                .ordreAffichage(dto.getOrdreAffichage() != null ? dto.getOrdreAffichage() : 0)
                .actif(dto.getActif() != null ? dto.getActif() : true)
                .build();

        pack = packRepository.save(pack);
        return toDTO(pack);
    }

    // ===== MODIFICATION =====

    /**
     * Met à jour un pack existant
     */
    @Transactional
    public PackAbonnementDTO updatePack(Long id, PackAbonnementDTO dto) {
        PackAbonnement pack = packRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pack non trouvé"));

        if (dto.getNom() != null && !dto.getNom().equalsIgnoreCase(pack.getNom())) {
            if (packRepository.existsByNomIgnoreCase(dto.getNom())) {
                throw new RuntimeException("Un pack avec ce nom existe déjà");
            }
            pack.setNom(dto.getNom());
        }

        if (dto.getDescription() != null) pack.setDescription(dto.getDescription());
        if (dto.getPrix() != null) pack.setPrix(dto.getPrix());
        if (dto.getDevise() != null) pack.setDevise(dto.getDevise());
        if (dto.getDureeJours() != null) pack.setDureeJours(dto.getDureeJours());
        if (dto.getAvantages() != null) pack.setAvantages(dto.getAvantages());
        if (dto.getOrdreAffichage() != null) pack.setOrdreAffichage(dto.getOrdreAffichage());
        if (dto.getActif() != null) pack.setActif(dto.getActif());

        pack = packRepository.save(pack);
        return toDTO(pack);
    }

    // ===== PUBLIER / DÉPUBLIER =====

    @Transactional
    public PackAbonnementDTO togglePublier(Long id) {
        PackAbonnement pack = packRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pack non trouvé"));

        pack.setActif(!pack.getActif());
        pack = packRepository.save(pack);
        return toDTO(pack);
    }

    // ===== GESTION DES PROMOTIONS =====

    /**
     * Applique une promotion sur un pack
     */
    @Transactional
    public PackAbonnementDTO appliquerPromo(Long id, BigDecimal prixPromo,
                                             LocalDateTime dateDebut,
                                             LocalDateTime dateFin) {
        PackAbonnement pack = packRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pack non trouvé"));

        if (prixPromo == null || prixPromo.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Le prix promo doit être supérieur à 0");
        }
        if (prixPromo.compareTo(pack.getPrix()) >= 0) {
            throw new RuntimeException("Le prix promo doit être inférieur au prix normal");
        }
        if (dateDebut == null || dateFin == null || dateFin.isBefore(dateDebut)) {
            throw new RuntimeException("Les dates de promotion sont invalides");
        }

        pack.setPrixPromo(prixPromo);
        pack.setDateDebutPromo(dateDebut);
        pack.setDateFinPromo(dateFin);

        pack = packRepository.save(pack);
        return toDTO(pack);
    }

    /**
     * Supprime une promotion
     */
    @Transactional
    public PackAbonnementDTO supprimerPromo(Long id) {
        PackAbonnement pack = packRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pack non trouvé"));

        pack.setPrixPromo(null);
        pack.setDateDebutPromo(null);
        pack.setDateFinPromo(null);

        pack = packRepository.save(pack);
        return toDTO(pack);
    }

    // ===== SUPPRESSION =====

    @Transactional
    public void deletePack(Long id) {
        PackAbonnement pack = packRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pack non trouvé"));

        // Vérifier si le pack est utilisé
        if (!pack.getAbonnements().isEmpty()) {
            throw new RuntimeException(
                "Impossible de supprimer ce pack : il est utilisé par " +
                pack.getAbonnements().size() + " abonnement(s). " +
                "Désactivez-le plutôt."
            );
        }

        packRepository.delete(pack);
    }

    // ===== MAPPING =====

    private PackAbonnementDTO toDTO(PackAbonnement pack) {
        return PackAbonnementDTO.builder()
                .id(pack.getId())
                .nom(pack.getNom())
                .description(pack.getDescription())
                .prix(pack.getPrix())
                .devise(pack.getDevise())
                .dureeJours(pack.getDureeJours())
                .avantages(pack.getAvantages())
                .ordreAffichage(pack.getOrdreAffichage())
                .actif(pack.getActif())
                .prixPromo(pack.getPrixPromo())
                .dateDebutPromo(pack.getDateDebutPromo())
                .dateFinPromo(pack.getDateFinPromo())
                .prixActuel(pack.getPrixActuel())
                .promoActive(pack.isPromoActive())
                .createdAt(pack.getCreatedAt())
                .updatedAt(pack.getUpdatedAt())
                .build();
    }
}