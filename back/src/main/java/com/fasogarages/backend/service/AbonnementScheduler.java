package com.fasogarages.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class AbonnementScheduler {

    private final AbonnementService abonnementService;

    /**
     * Vérifie les abonnements expirés chaque jour à 2h du matin
     */
    @Scheduled(cron = "0 0 2 * * *")
    public void verifierExpirations() {
        log.info("🔍 Vérification des abonnements expirés...");
        try {
            abonnementService.verifierAbonnementsExpires();
            log.info("✅ Vérification des expirations terminée");
        } catch (Exception e) {
            log.error("❌ Erreur lors de la vérification : {}", e.getMessage(), e);
        }
    }

    /**
     * Envoie les rappels d'expiration chaque jour à 10h
     */
    @Scheduled(cron = "0 0 10 * * *")
    public void envoyerRappels() {
        log.info("📱 Envoi des rappels d'expiration...");
        try {
            abonnementService.envoyerRappelsExpiration();
            log.info("✅ Rappels envoyés");
        } catch (Exception e) {
            log.error("❌ Erreur lors des rappels : {}", e.getMessage(), e);
        }
    }
}
