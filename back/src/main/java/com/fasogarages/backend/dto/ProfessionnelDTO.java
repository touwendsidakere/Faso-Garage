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
public class ProfessionnelDTO {

    private Long id;
    private String nomEtablissement;
    private String categorie;
    private Long categorieId;
    private List<Long> serviceIds;
    private List<String> services;
    private String description;
    private String telephone;
    private String whatsapp;
    private Double latitude;
    private Double longitude;
    private String ville;
    private String horaires;
    private String statut;
    private String logoUrl;
    private String photoCouverture;
    private String telephone2;
    private String whatsapp2;
    private String emailPublic;
    private String siteWeb;
    private String adressePhysique;
    private List<String> galeriePhotos;
    private Double distance;
    private Double moyenneNotes;
    private Integer nombreAvis;
    private String nomProprietaire;
    private String prenomProprietaire;
    private String emailProprietaire;
    private String telephoneProprietaire;
    private Boolean appelPossible;
}