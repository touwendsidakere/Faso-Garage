package com.fasogarages.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AbonnementDTO {
    private Long id;
    private Long professionnelId;
    private Long packId;
    private String packNom;
    private String typeAcces;
    private String statut;
    private LocalDateTime dateDebut;
    private LocalDateTime dateFin;
    private BigDecimal montantPaye;
    private String transactionId;
    private Long joursRestants;
    private Boolean actif;
    private Boolean expire;
    private LocalDateTime createdAt;
}
