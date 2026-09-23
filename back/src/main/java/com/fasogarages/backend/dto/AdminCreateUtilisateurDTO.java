package com.fasogarages.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminCreateUtilisateurDTO {

    @NotBlank
    private String nom;
    @NotBlank
    private String prenom;
    @NotBlank
    private String telephone; // format E.164, ex: "+22670009999"
    @NotBlank
    @Size(min = 8, message = "Le mot de passe doit contenir au moins 8 caractères")
    private String motDePasse;
    @NotBlank
    private String role; // "ROLE_USER", "ROLE_PRO", "ROLE_ADMIN"

    // Champs optionnels, utilisés uniquement si role = ROLE_PRO
    private String nomEtablissement;
    private List<Long> serviceIds;
    private String description;
    private String telephonePro; // format local, ex: "70009999"
    private String whatsapp;
    private Double latitude;
    private Double longitude;
    private String ville;
    private String horaires;
}