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
public class AdminCreateProfessionnelDTO {

    // Compte utilisateur associé (créé en même temps que l'établissement)
    private String nom;
    private String prenom;
    private String telephoneCompte; // format E.164, ex: "+22670009999"
    private String motDePasse;

    // Établissement
    private String nomEtablissement;
    private List<Long> serviceIds;
    private String description;
    private String telephone; // format local, ex: "70009999"
    private String whatsapp;
    private Double latitude;
    private Double longitude;
    private String ville;
    private String horaires;
}