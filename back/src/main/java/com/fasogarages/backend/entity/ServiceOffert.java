package com.fasogarages.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "service", uniqueConstraints = @UniqueConstraint(columnNames = {"libelle", "categorie_id"}))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceOffert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String libelle;

    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categorie_id", nullable = true)
    @JsonIgnoreProperties({"services"})
    private Categorie categorie;

    @CreationTimestamp
    @Column(name = "date_creation", updatable = false)
    private LocalDateTime dateCreation;

    @ManyToMany(mappedBy = "services")
    @Builder.Default
    @JsonIgnoreProperties({"services"})
    private List<Professionnel> professionnels = new ArrayList<>();
}