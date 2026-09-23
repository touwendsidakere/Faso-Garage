package com.fasogarages.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.LocalDateTime;

@Entity
@Table(name = "image_professionnel")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImageProfessionnel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "professionnel_id", nullable = false)
    @JsonIgnoreProperties({"avis", "images", "services", "utilisateur"})
    private Professionnel professionnel;

    @Column(name = "nom_fichier", nullable = false)
    private String nomFichier;

    @Column(nullable = false)
    private String url;

    private String type; // "LOGO", "PHOTO", "COUVERTURE"
    private Integer ordre;

    @CreationTimestamp
    @Column(name = "date_upload", updatable = false)
    private LocalDateTime dateUpload;

    private Long taille; // Taille en bytes
}
