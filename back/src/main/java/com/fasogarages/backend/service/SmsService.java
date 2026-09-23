package com.fasogarages.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class SmsService {

    /**
     * Envoie un SMS à un numéro donné.
     * L'intégration réelle avec l'API SMS sera faite plus tard.
     */
    public void envoyerSms(String telephone, String message) {
        // TODO: Intégrer l'API SMS quand elle sera disponible
        log.info("📱 SMS à envoyer à {} : {}", telephone, message);
        
        // Pour l'instant, on simule un envoi réussi
        // Plus tard : appel à l'API SMS (Orange SMS, Ikoddi, etc.)
    }
}