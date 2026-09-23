package com.fasogarages.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "professionnel")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Professionnel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_utilisateur", nullable = false, unique = true)
    @JsonIgnoreProperties({"professionnel", "avis"})
    private Utilisateur utilisateur;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "professionnel_service",
        joinColumns = @JoinColumn(name = "professionnel_id"),
        inverseJoinColumns = @JoinColumn(name = "service_id")
    )
    @Builder.Default
    private List<ServiceOffert> services = new ArrayList<>();

    @NotBlank
    @Column(name = "nom_etablissement", nullable = false)
    private String nomEtablissement;

    @Column(length = 1000)
    private String description;

    private String telephone;
    private String whatsapp;

    @NotNull
    private Double latitude;

    @NotNull
    private Double longitude;

    private String ville;
    private String horaires;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Statut statut = Statut.EN_ATTENTE;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(name = "photo_couverture")
    private String photoCouverture;

    @Column(name = "telephone2")
    private String telephone2;

    @Column(name = "whatsapp2")
    private String whatsapp2;

    @Column(name = "email_public")
    private String emailPublic;

    @Column(name = "site_web")
    private String siteWeb;

    @Column(name = "adresse_physique", length = 500)
    private String adressePhysique;

    @CreationTimestamp
    @Column(name = "date_creation", updatable = false)
    private LocalDateTime dateCreation;

    /**
     * Date de validation par un admin — point de départ des 3 mois d'essai
     * gratuit avant qu'un abonnement payant ne soit requis pour rester visible.
     */
    @Column(name = "date_validation")
    private LocalDateTime dateValidation;

    @OneToMany(mappedBy = "professionnel", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ImageProfessionnel> images = new ArrayList<>();

    @OneToMany(mappedBy = "professionnel", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Avis> avis = new ArrayList<>();

    public enum Statut {
        EN_ATTENTE,
        VALIDE,
        REJETE
    }
}