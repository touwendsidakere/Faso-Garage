package com.fasogarages.backend.service;

import com.fasogarages.backend.dto.AbonnementDTO;
import com.fasogarages.backend.entity.*;
import com.fasogarages.backend.entity.AbonnementEntreprise.StatutAbonnement;
import com.fasogarages.backend.entity.AbonnementEntreprise.TypeAcces;
import com.fasogarages.backend.entity.HistoriqueAbonnement.MotifHistorique;
import com.fasogarages.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AbonnementService {

    private final AbonnementEntrepriseRepository abonnementRepository;
    private final HistoriqueAbonnementRepository historiqueRepository;
    private final PackAbonnementRepository packRepository;
    private final ProfessionnelRepository professionnelRepository;
    private final ConfigOffreGratuiteService configOffreGratuiteService;
    private final SmsService smsService;

    // ===== CRÉATION AUTOMATIQUE À L'INSCRIPTION =====

    @Transactional
    public void creerAbonnementInscription(Professionnel professionnel) {
        Long proId = professionnel.getId();

        boolean dejaUtilise = historiqueRepository
                .existsByProfessionnelIdAndMotif(proId, MotifHistorique.INSCRIPTION);

        boolean offreActive = configOffreGratuiteService.isOffreGratuiteActive();

        AbonnementEntreprise abonnement;

        if (offreActive && !dejaUtilise) {
            int dureeGratuite = configOffreGratuiteService.getDureeGratuiteJours();
            LocalDateTime maintenant = LocalDateTime.now();

            abonnement = AbonnementEntreprise.builder()
                    .professionnel(professionnel)
                    .typeAcces(TypeAcces.GRATUIT)
                    .statut(StatutAbonnement.ACTIF)
                    .dateDebut(maintenant)
                    .dateFin(maintenant.plusDays(dureeGratuite))
                    .build();

            abonnement = abonnementRepository.save(abonnement);

            enregistrerHistorique(professionnel, TypeAcces.GRATUIT,
                    abonnement.getDateDebut(), abonnement.getDateFin(), MotifHistorique.INSCRIPTION);
        } else {
            abonnement = AbonnementEntreprise.builder()
                    .professionnel(professionnel)
                    .typeAcces(TypeAcces.PAYANT)
                    .statut(StatutAbonnement.EN_ATTENTE)
                    .dateDebut(LocalDateTime.now())
                    .dateFin(LocalDateTime.now())
                    .build();

            abonnementRepository.save(abonnement);
        }
    }

    // ===== LECTURE =====

    public AbonnementDTO getAbonnementActif(Long professionnelId) {
        AbonnementEntreprise abonnement = abonnementRepository
                .findByProfessionnelIdAndStatut(professionnelId, StatutAbonnement.ACTIF)
                .orElse(null);

        if (abonnement == null) {
            return null;
        }
        return toDTO(abonnement);
    }

    public List<AbonnementDTO> getAbonnementsByProfessionnel(Long professionnelId) {
        return abonnementRepository.findByProfessionnelIdOrderByCreatedAtDesc(professionnelId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public boolean hasAbonnementActif(Long professionnelId) {
        return abonnementRepository
                .findByProfessionnelIdAndStatut(professionnelId, StatutAbonnement.ACTIF)
                .map(AbonnementEntreprise::isActif)
                .orElse(false);
    }

    // ===== NOUVELLE MÉTHODE OPTIMISÉE =====
    
    /**
     * Récupère tous les IDs des professionnels ayant un abonnement actif.
     * UNE SEULE requête SQL — utilisé pour filtrer les pros visibles.
     */
    public Set<Long> getProfessionnelIdsAvecAbonnementActif() {
        return new HashSet<>(
            abonnementRepository.findProfessionnelIdsAvecAbonnementActif(LocalDateTime.now())
        );
    }

    // ===== SOUSCRIPTION =====

    @Transactional
    public AbonnementDTO souscrire(Long professionnelId, Long packId,
                                   String transactionId, BigDecimal montantPaye) {
        Professionnel professionnel = professionnelRepository.findById(professionnelId)
                .orElseThrow(() -> new RuntimeException("Professionnel non trouvé"));

        PackAbonnement pack = packRepository.findById(packId)
                .orElseThrow(() -> new RuntimeException("Pack non trouvé"));

        if (!pack.getActif()) {
            throw new RuntimeException("Ce pack n'est plus disponible");
        }

        abonnementRepository.findByProfessionnelIdAndStatut(professionnelId, StatutAbonnement.ACTIF)
                .ifPresent(ancien -> {
                    ancien.setStatut(StatutAbonnement.ANNULE);
                    abonnementRepository.save(ancien);
                    enregistrerHistorique(professionnel, ancien.getTypeAcces(),
                            ancien.getDateDebut(), LocalDateTime.now(), MotifHistorique.ANNULATION);
                });

        LocalDateTime maintenant = LocalDateTime.now();
        LocalDateTime dateFin = maintenant.plusDays(pack.getDureeJours());

        AbonnementEntreprise abonnement = AbonnementEntreprise.builder()
                .professionnel(professionnel)
                .pack(pack)
                .typeAcces(TypeAcces.PAYANT)
                .statut(StatutAbonnement.ACTIF)
                .dateDebut(maintenant)
                .dateFin(dateFin)
                .montantPaye(montantPaye != null ? montantPaye : pack.getPrixActuel())
                .transactionId(transactionId)
                .build();

        abonnement = abonnementRepository.save(abonnement);

        enregistrerHistorique(professionnel, TypeAcces.PAYANT,
                maintenant, dateFin, MotifHistorique.SOUSCRIPTION);

        return toDTO(abonnement);
    }

    // ===== ANNULATION =====

    @Transactional
    public void annulerAbonnement(Long professionnelId) {
        AbonnementEntreprise abonnement = abonnementRepository
                .findByProfessionnelIdAndStatut(professionnelId, StatutAbonnement.ACTIF)
                .orElseThrow(() -> new RuntimeException("Aucun abonnement actif trouvé"));

        abonnement.setStatut(StatutAbonnement.ANNULE);
        abonnementRepository.save(abonnement);

        enregistrerHistorique(abonnement.getProfessionnel(), abonnement.getTypeAcces(),
                abonnement.getDateDebut(), LocalDateTime.now(), MotifHistorique.ANNULATION);
    }

    // ===== GESTION DE L'EXPIRATION =====

    @Transactional
    public void verifierAbonnementsExpires() {
        List<AbonnementEntreprise> expires = abonnementRepository
                .findAbonnementsExpires(LocalDateTime.now());

        for (AbonnementEntreprise abonnement : expires) {
            abonnement.setStatut(StatutAbonnement.EXPIRE);
            abonnementRepository.save(abonnement);

            try {
                String telephone = abonnement.getProfessionnel().getUtilisateur().getTelephone();
                String message = "Votre abonnement FASO GARAGES a expiré. " +
                        "Renouvelez-le pour rester visible sur la plateforme.";
                smsService.envoyerSms(telephone, message);
                abonnement.setNotificationEnvoyee(true);
                abonnementRepository.save(abonnement);
            } catch (Exception e) {
                System.err.println("Erreur envoi SMS : " + e.getMessage());
            }

            enregistrerHistorique(abonnement.getProfessionnel(), abonnement.getTypeAcces(),
                    abonnement.getDateDebut(), abonnement.getDateFin(), MotifHistorique.EXPIRATION);
        }
    }

    @Transactional
    public void envoyerRappelsExpiration() {
        LocalDateTime maintenant = LocalDateTime.now();
        LocalDateTime dans7Jours = maintenant.plusDays(7);

        List<AbonnementEntreprise> bientotExpires = abonnementRepository
                .findAbonnementsExpirantBientot(maintenant, dans7Jours);

        for (AbonnementEntreprise abonnement : bientotExpires) {
            if (!abonnement.getNotificationEnvoyee()) {
                try {
                    String telephone = abonnement.getProfessionnel().getUtilisateur().getTelephone();
                    long joursRestants = abonnement.getJoursRestants();
                    String message = "Votre abonnement FASO GARAGES expire dans " +
                            joursRestants + " jour(s). Renouvelez-le pour rester visible.";
                    smsService.envoyerSms(telephone, message);
                    abonnement.setNotificationEnvoyee(true);
                    abonnementRepository.save(abonnement);
                } catch (Exception e) {
                    System.err.println("Erreur envoi SMS rappel : " + e.getMessage());
                }
            }
        }
    }

    // ===== MÉTHODES PRIVÉES =====

    private void enregistrerHistorique(Professionnel professionnel, TypeAcces typeAcces,
                                       LocalDateTime dateDebut, LocalDateTime dateFin,
                                       MotifHistorique motif) {
        HistoriqueAbonnement historique = HistoriqueAbonnement.builder()
                .professionnel(professionnel)
                .typeAcces(typeAcces)
                .dateDebut(dateDebut)
                .dateFin(dateFin)
                .motif(motif)
                .build();
        historiqueRepository.save(historique);
    }

    private AbonnementDTO toDTO(AbonnementEntreprise abonnement) {
        return AbonnementDTO.builder()
                .id(abonnement.getId())
                .professionnelId(abonnement.getProfessionnel().getId())
                .packId(abonnement.getPack() != null ? abonnement.getPack().getId() : null)
                .packNom(abonnement.getPack() != null ? abonnement.getPack().getNom() : null)
                .typeAcces(abonnement.getTypeAcces().name())
                .statut(abonnement.getStatut().name())
                .dateDebut(abonnement.getDateDebut())
                .dateFin(abonnement.getDateFin())
                .montantPaye(abonnement.getMontantPaye())
                .transactionId(abonnement.getTransactionId())
                .joursRestants(abonnement.getJoursRestants())
                .actif(abonnement.isActif())
                .expire(abonnement.isExpire())
                .createdAt(abonnement.getCreatedAt())
                .build();
    }
}