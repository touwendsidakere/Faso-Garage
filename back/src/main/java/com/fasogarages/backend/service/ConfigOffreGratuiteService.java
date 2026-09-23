package com.fasogarages.backend.service;

import com.fasogarages.backend.dto.ConfigOffreGratuiteDTO;
import com.fasogarages.backend.entity.ConfigOffreGratuite;
import com.fasogarages.backend.repository.ConfigOffreGratuiteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ConfigOffreGratuiteService {

    private final ConfigOffreGratuiteRepository configRepository;

    /**
     * Récupère la configuration actuelle de l'offre gratuite
     */
    public ConfigOffreGratuiteDTO getConfig() {
        ConfigOffreGratuite config = configRepository.findConfig()
                .orElseGet(this::createDefaultConfig);
        return toDTO(config);
    }

    /**
     * Vérifie si l'offre gratuite est actuellement valide
     */
    public boolean isOffreGratuiteActive() {
        return configRepository.findConfig()
                .map(ConfigOffreGratuite::isOffreActive)
                .orElse(false);
    }

    /**
     * Récupère la durée gratuite en jours
     */
    public int getDureeGratuiteJours() {
        return configRepository.findConfig()
                .map(ConfigOffreGratuite::getDureeJours)
                .orElse(0);
    }

    /**
     * Met à jour la configuration
     */
    @Transactional
    public ConfigOffreGratuiteDTO updateConfig(ConfigOffreGratuiteDTO dto) {
        ConfigOffreGratuite config = configRepository.findConfig()
                .orElseGet(this::createDefaultConfig);

        if (dto.getActive() != null) config.setActive(dto.getActive());
        if (dto.getDureeJours() != null) config.setDureeJours(dto.getDureeJours());
        if (dto.getDateDebut() != null) config.setDateDebut(dto.getDateDebut());
        if (dto.getDateFin() != null) config.setDateFin(dto.getDateFin());
        if (dto.getMessage() != null) config.setMessage(dto.getMessage());

        // Validation : la date de fin doit être après la date de début
        if (config.getDateDebut() != null && config.getDateFin() != null
                && config.getDateFin().isBefore(config.getDateDebut())) {
            throw new RuntimeException("La date de fin doit être après la date de début");
        }

        config = configRepository.save(config);
        return toDTO(config);
    }

    /**
     * Active/désactive l'offre gratuite
     */
    @Transactional
    public ConfigOffreGratuiteDTO toggleActive() {
        ConfigOffreGratuite config = configRepository.findConfig()
                .orElseGet(this::createDefaultConfig);

        config.setActive(!config.getActive());
        config = configRepository.save(config);
        return toDTO(config);
    }

    // ===== Méthodes privées =====

    private ConfigOffreGratuite createDefaultConfig() {
        ConfigOffreGratuite config = ConfigOffreGratuite.builder()
                .active(true)
                .dureeJours(90)
                .dateDebut(LocalDateTime.now())
                .dateFin(LocalDateTime.now().plusYears(1))
                .message("Profitez de 3 mois gratuits pour découvrir la plateforme !")
                .build();
        return configRepository.save(config);
    }

    private ConfigOffreGratuiteDTO toDTO(ConfigOffreGratuite config) {
        return ConfigOffreGratuiteDTO.builder()
                .id(config.getId())
                .active(config.getActive())
                .dureeJours(config.getDureeJours())
                .dateDebut(config.getDateDebut())
                .dateFin(config.getDateFin())
                .message(config.getMessage())
                .offreActive(config.isOffreActive())
                .updatedAt(config.getUpdatedAt())
                .build();
    }
}
