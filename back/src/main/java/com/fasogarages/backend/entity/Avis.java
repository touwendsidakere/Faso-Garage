package com.fasogarages.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.LocalDateTime;

@Entity
@Table(name = "avis", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"id_utilisateur", "id_professionnel"}))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Avis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_utilisateur", nullable = false)
    @JsonIgnoreProperties({"avis", "images", "services", "utilisateur"})
    private Utilisateur utilisateur;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_professionnel", nullable = false)
    @JsonIgnoreProperties({"avis", "images", "services"})
    private Professionnel professionnel;

    @NotNull
    @Min(1)
    @Max(5)
    @Column(nullable = false)
    private Integer note;

    @Column(length = 1000)
    private String commentaire;

    @CreationTimestamp
    @Column(name = "date_creation", updatable = false)
    private LocalDateTime dateCreation;
}
