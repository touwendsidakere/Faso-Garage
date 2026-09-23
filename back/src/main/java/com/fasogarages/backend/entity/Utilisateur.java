package com.fasogarages.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Collections;
import java.util.List;

@Entity
@Table(name = "utilisateur")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Utilisateur implements UserDetails {

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

    // ===== NOUVEAUX CHAMPS POUR LES INFOS PAYS =====
    @Column(name = "indicatif_pays")
    private Integer indicatifPays;

    @Column(name = "code_pays_iso", length = 2)
    private String codePaysIso;

    @Column(name = "telephone_verifie")
    private boolean telephoneVerifie = false;

    @NotBlank
    @Column(nullable = false)
    private String motDePasse;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

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

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(new SimpleGrantedAuthority(role.name()));
    }

    @Override
    public String getPassword() {
        return motDePasse;
    }

    @Override
    public String getUsername() {
        return telephone;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}