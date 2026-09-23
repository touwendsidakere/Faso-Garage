package com.fasogarages.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfessionnelCreateDTO {

    private String nomEtablissement;
    private Long categorieId;
    private List<Long> serviceIds;
    private String description;
    private String telephone;
    private String whatsapp;
    private Double latitude;
    private Double longitude;
    private String ville;
    private String horaires;
}