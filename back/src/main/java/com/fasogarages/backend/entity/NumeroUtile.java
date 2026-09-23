package com.fasogarages.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "numero_utile")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NumeroUtile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String nom;

    @NotBlank
    @Column(nullable = false)
    private String numero;

    private String type; // "POLICE", "GENDARMERIE", "POMPIERS", "SAMU"
}
