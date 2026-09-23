package com.fasogarages.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConfigOffreGratuiteDTO {
    private Long id;
    private Boolean active;
    private Integer dureeJours;
    private LocalDateTime dateDebut;
    private LocalDateTime dateFin;
    private String message;
    private Boolean offreActive;
    private LocalDateTime updatedAt;
}
