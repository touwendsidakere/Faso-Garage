package com.fasogarages.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "utilisateur")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Utilisateur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String nom;

    @NotBlank
    @Column(nullable = false)
    private String prenom;

    @Email
    @Column(unique = true)
    private String email;

    @NotBlank
    @Column(unique = true, nullable = false)
    private String telephone;

    @Column(nullable = false)
    private String motDePasse;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    private Integer indicatifPays;
    private String codePaysIso;

    @Builder.Default
    private Boolean telephoneVerifie = false;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime dateCreation;

    @OneToOne(mappedBy = "utilisateur", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Professionnel professionnel;

    @OneToMany(mappedBy = "utilisateur", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Avis> avis = new java.util.ArrayList<>();

    public enum Role {
        ROLE_USER,
        ROLE_PRO,
        ROLE_ADMIN
    }
}