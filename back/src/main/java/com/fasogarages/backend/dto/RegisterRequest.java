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
public class RegisterRequest {

    // ===== Champs obligatoires pour tous =====
    @NotBlank(message = "Le nom est obligatoire")
    private String nom;

    @NotBlank(message = "Le prénom est obligatoire")
    private String prenom;

    @NotBlank(message = "Le téléphone est obligatoire")
    private String telephone;  // ← Le format est validé dans le service

    @NotBlank(message = "Le mot de passe est obligatoire")
    @Size(min = 8, message = "Le mot de passe doit contenir au moins 8 caractères")
    private String motDePasse;

    @NotBlank(message = "Le rôle est obligatoire (ROLE_USER ou ROLE_PRO)")
    private String role;

    // ===== Champs optionnels pour le professionnel =====
    private String email;
    private String nomEtablissement;
    private Long categorieId;
    private List<Long> serviceIds;
    private String description;
    private String telephonePro;
    private String whatsapp;
    private Double latitude;
    private Double longitude;
    private String ville;
    private String horaires;
}