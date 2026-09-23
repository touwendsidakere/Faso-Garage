package com.fasogarages.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "astuce")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Astuce {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String titre;
    private String categorie;

    @NotBlank
    @Column(length = 2000, nullable = false)
    private String contenu;

    @CreationTimestamp
    @Column(name = "date_publication", updatable = false)
    private LocalDateTime datePublication;
}
