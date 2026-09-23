package com.fasogarages.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "publicite")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Publicite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "media_url", nullable = false)
    private String mediaUrl;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Type type;

    @Column(name = "date_debut")
    private LocalDate dateDebut; // null = diffusion immédiate

    @Column(name = "date_fin")
    private LocalDate dateFin; // null = durée indéfinie

    @Column(nullable = false)
    private boolean actif;

    @Column(name = "lien_redirection")
    private String lienRedirection;

    public enum Type {
        IMAGE,
        VIDEO
    }
}