package com.fasogarages.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AvisDTO {
    private Long id;
    private Long userId;
    private String nomUtilisateur;
    private String prenomUtilisateur;
    private Integer note;
    private String commentaire;
    private String dateCreation;
}