package com.fasogarages.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "annonce_defilante")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnnonceDefilante {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(length = 500, nullable = false)
    private String texte;

    @Column(nullable = false)
    private boolean actif;
}