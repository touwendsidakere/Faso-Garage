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
public class ProfessionnelUpdateDTO {

    private String nomEtablissement;
    private Long categorieId;
    private List<Long> serviceIds;
    private String description;
    private String telephone;
    private String whatsapp;
    private String telephone2;
    private String whatsapp2;
    private String emailPublic;
    private String siteWeb;
    private String adressePhysique;
    private Double latitude;
    private Double longitude;
    private String ville;
    private String horaires;
}