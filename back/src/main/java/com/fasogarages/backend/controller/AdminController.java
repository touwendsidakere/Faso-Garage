package com.fasogarages.backend.controller;

import com.fasogarages.backend.dto.AdminCreateProfessionnelDTO;
import com.fasogarages.backend.dto.AdminCreateUtilisateurDTO;
import com.fasogarages.backend.dto.AuthResponse;
import com.fasogarages.backend.service.AuthService;
import com.fasogarages.backend.dto.ProfessionnelDTO;
import com.fasogarages.backend.dto.ProfessionnelUpdateDTO;
import com.fasogarages.backend.dto.UtilisateurDTO;
import com.fasogarages.backend.entity.AnnonceDefilante;
import com.fasogarages.backend.entity.Astuce;
import com.fasogarages.backend.entity.Categorie;
import com.fasogarages.backend.entity.NumeroUtile;
import com.fasogarages.backend.entity.Publicite;
import com.fasogarages.backend.entity.ServiceOffert;
import com.fasogarages.backend.repository.AnnonceDefilanteRepository;
import com.fasogarages.backend.repository.AstuceRepository;
import com.fasogarages.backend.repository.CategorieRepository;
import com.fasogarages.backend.repository.NumeroUtileRepository;
import com.fasogarages.backend.repository.PubliciteRepository;
import com.fasogarages.backend.repository.ServiceOffertRepository;
import com.fasogarages.backend.repository.UtilisateurRepository;
import com.fasogarages.backend.service.ProfessionnelService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Administration", description = "Endpoints réservés aux administrateurs")
public class AdminController {

    private final ProfessionnelService professionnelService;
    private final CategorieRepository categorieRepository;
    private final ServiceOffertRepository serviceOffertRepository;
    private final AstuceRepository astuceRepository;
    private final NumeroUtileRepository numeroUtileRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final AnnonceDefilanteRepository annonceDefilanteRepository;
    private final PubliciteRepository publiciteRepository;
    private final AuthService authService;

    // ===== GESTION DES PROFESSIONNELS =====

    @GetMapping("/professionnels/pending")
    @Operation(summary = "Lister les professionnels en attente de validation")
    public ResponseEntity<List<ProfessionnelDTO>> getPendingProfessionals() {
        return ResponseEntity.ok(professionnelService.getPendingProfessionals());
    }

    @PutMapping("/professionnels/{id}/validate")
    @Operation(summary = "Valider ou rejeter un compte professionnel")
    public ResponseEntity<ProfessionnelDTO> validateProfessional(
            @PathVariable Long id,
            @RequestParam boolean valider) {
        return ResponseEntity.ok(professionnelService.validateProfessional(id, valider));
    }

    @GetMapping("/professionnels")
    @Operation(summary = "Lister tous les professionnels, tous statuts confondus")
    public ResponseEntity<List<ProfessionnelDTO>> getAllProfessionnelsAdmin() {
        return ResponseEntity.ok(professionnelService.getAllForAdmin());
    }

    @GetMapping("/professionnels/rejected")
    @Operation(summary = "Lister les professionnels rejetés")
    public ResponseEntity<List<ProfessionnelDTO>> getRejectedProfessionnels() {
        return ResponseEntity.ok(professionnelService.getRejected());
    }

    @PostMapping("/professionnels")
    @Operation(summary = "Créer un professionnel directement (compte + établissement, validé d'emblée)")
    public ResponseEntity<ProfessionnelDTO> createProfessionnel(
            @Valid @RequestBody AdminCreateProfessionnelDTO dto) {
        ProfessionnelDTO created = professionnelService.createByAdmin(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/professionnels/{id}")
    @Operation(summary = "Modifier un professionnel existant (admin)")
    public ResponseEntity<ProfessionnelDTO> updateProfessionnelAdmin(
            @PathVariable Long id,
            @Valid @RequestBody ProfessionnelUpdateDTO dto) {
        return ResponseEntity.ok(professionnelService.updateByAdmin(id, dto));
    }

    @DeleteMapping("/professionnels/{id}")
    @Operation(summary = "Supprimer un professionnel (admin)")
    public ResponseEntity<Void> deleteProfessionnelAdmin(@PathVariable Long id) {
        professionnelService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ===== GESTION DES UTILISATEURS =====

    @GetMapping("/utilisateurs")
    @Operation(summary = "Lister tous les utilisateurs")
    public ResponseEntity<List<UtilisateurDTO>> getAllUtilisateurs() {
        List<UtilisateurDTO> utilisateurs = utilisateurRepository.findAll().stream()
                .map(u -> UtilisateurDTO.builder()
                        .id(u.getId())
                        .nom(u.getNom())
                        .prenom(u.getPrenom())
                        .telephone(u.getTelephone())
                        .email(u.getEmail())
                        .role(u.getRole().name())
                        .build())
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(utilisateurs);
    }

    @DeleteMapping("/utilisateurs/{id}")
    @Operation(summary = "Supprimer un utilisateur")
    public ResponseEntity<Void> deleteUtilisateur(@PathVariable Long id) {
        if (!utilisateurRepository.existsById(id)) {
            throw new RuntimeException("Utilisateur non trouvé");
        }
        utilisateurRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/utilisateurs")
    @Operation(summary = "Créer un compte (utilisateur, professionnel ou admin) directement")
    public ResponseEntity<AuthResponse> createUtilisateur(@Valid @RequestBody AdminCreateUtilisateurDTO dto) {
        AuthResponse created = authService.createByAdmin(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // ===== GESTION DES CATÉGORIES =====

    @GetMapping("/categories")
    @Operation(summary = "Lister toutes les catégories (admin)")
    public ResponseEntity<List<Categorie>> getAllCategories() {
        return ResponseEntity.ok(categorieRepository.findAll());
    }

    @PostMapping("/categories")
    @Operation(summary = "Créer une nouvelle catégorie")
    public ResponseEntity<Categorie> createCategory(@Valid @RequestBody Categorie categorie) {
        if (categorieRepository.findByLibelleIgnoreCase(categorie.getLibelle()).isPresent()) {
            throw new RuntimeException("Une catégorie avec ce libellé existe déjà");
        }
        Categorie saved = categorieRepository.save(categorie);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/categories/{id}")
    @Operation(summary = "Modifier une catégorie existante")
    public ResponseEntity<Categorie> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody Categorie categorieDetails) {

        Categorie categorie = categorieRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Catégorie non trouvée"));

        if (categorieDetails.getLibelle() != null) {
            categorieRepository.findByLibelleIgnoreCase(categorieDetails.getLibelle())
                    .ifPresent(existing -> {
                        if (!existing.getId().equals(id)) {
                            throw new RuntimeException("Une catégorie avec ce libellé existe déjà");
                        }
                    });
            categorie.setLibelle(categorieDetails.getLibelle());
        }
        if (categorieDetails.getDescription() != null) {
            categorie.setDescription(categorieDetails.getDescription());
        }
        if (categorieDetails.getIcone() != null) {
            categorie.setIcone(categorieDetails.getIcone());
        }

        return ResponseEntity.ok(categorieRepository.save(categorie));
    }

    @DeleteMapping("/categories/{id}")
    @Operation(summary = "Supprimer une catégorie et tous ses services associés")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        Categorie categorie = categorieRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Catégorie non trouvée"));

        categorieRepository.delete(categorie); // cascade = CascadeType.ALL supprime déjà les services liés
        return ResponseEntity.noContent().build();
    }

    // ===== GESTION DES SERVICES OFFRTS =====

    @GetMapping("/services")
    @Operation(summary = "Lister tous les services (admin)")
    public ResponseEntity<List<ServiceOffert>> getAllServices() {
        return ResponseEntity.ok(serviceOffertRepository.findAll());
    }

    @GetMapping("/services/categorie/{categorieId}")
    @Operation(summary = "Lister les services d'une catégorie (admin)")
    public ResponseEntity<List<ServiceOffert>> getServicesByCategorie(@PathVariable Long categorieId) {
        return ResponseEntity.ok(serviceOffertRepository.findByCategorieId(categorieId));
    }

    @PostMapping("/services")
    @Operation(summary = "Créer un nouveau service, sans catégorie assignée")
    public ResponseEntity<ServiceOffert> createService(@Valid @RequestBody ServiceOffert service) {
        service.setCategorie(null); // un service est toujours créé sans catégorie
        ServiceOffert saved = serviceOffertRepository.save(service);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/services/{id}")
    @Operation(summary = "Modifier un service existant")
    public ResponseEntity<ServiceOffert> updateService(
            @PathVariable Long id,
            @Valid @RequestBody ServiceOffert serviceDetails) {

        ServiceOffert service = serviceOffertRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service non trouvé"));

        if (serviceDetails.getLibelle() != null) {
            service.setLibelle(serviceDetails.getLibelle());
        }
        if (serviceDetails.getDescription() != null) {
            service.setDescription(serviceDetails.getDescription());
        }
        if (serviceDetails.getCategorie() != null) {
            service.setCategorie(serviceDetails.getCategorie());
        }

        return ResponseEntity.ok(serviceOffertRepository.save(service));
    }

    @DeleteMapping("/services/{id}")
    @Operation(summary = "Supprimer un service (retiré automatiquement des professionnels qui l'utilisaient)")
    public ResponseEntity<Void> deleteService(@PathVariable Long id) {
        ServiceOffert service = serviceOffertRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service non trouvé"));

        serviceOffertRepository.delete(service);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/services/sans-categorie")
    @Operation(summary = "Lister les services non encore affectés à une catégorie")
    public ResponseEntity<List<ServiceOffert>> getServicesSansCategorie() {
        return ResponseEntity.ok(serviceOffertRepository.findByCategorieIsNull());
    }

    @PutMapping("/services/{id}/affecter/{categorieId}")
    @Operation(summary = "Affecter un service existant à une catégorie")
    public ResponseEntity<ServiceOffert> affecterServiceACategorie(
            @PathVariable Long id,
            @PathVariable Long categorieId) {

        ServiceOffert service = serviceOffertRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service non trouvé"));

        Categorie categorie = categorieRepository.findById(categorieId)
                .orElseThrow(() -> new RuntimeException("Catégorie non trouvée"));

        service.setCategorie(categorie);
        return ResponseEntity.ok(serviceOffertRepository.save(service));
    }

    @PutMapping("/services/{id}/retirer")
    @Operation(summary = "Retirer un service de sa catégorie (le rend disponible pour une autre affectation)")
    public ResponseEntity<ServiceOffert> retirerServiceDeCategorie(@PathVariable Long id) {
        ServiceOffert service = serviceOffertRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service non trouvé"));

        service.setCategorie(null);
        return ResponseEntity.ok(serviceOffertRepository.save(service));
    }

    // ===== GESTION DES ASTUCES =====

    @GetMapping("/astuces")
    @Operation(summary = "Lister toutes les astuces (admin)")
    public ResponseEntity<List<Astuce>> getAllAstuces() {
        return ResponseEntity.ok(astuceRepository.findAll());
    }

    @PostMapping("/astuces")
    @Operation(summary = "Créer une nouvelle astuce")
    public ResponseEntity<Astuce> createAstuce(@Valid @RequestBody Astuce astuce) {
        Astuce saved = astuceRepository.save(astuce);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/astuces/{id}")
    @Operation(summary = "Modifier une astuce existante")
    public ResponseEntity<Astuce> updateAstuce(
            @PathVariable Long id,
            @Valid @RequestBody Astuce astuceDetails) {

        Astuce astuce = astuceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Astuce non trouvée"));

        if (astuceDetails.getTitre() != null) {
            astuce.setTitre(astuceDetails.getTitre());
        }
        if (astuceDetails.getContenu() != null) {
            astuce.setContenu(astuceDetails.getContenu());
        }
        if (astuceDetails.getCategorie() != null) {
            astuce.setCategorie(astuceDetails.getCategorie());
        }

        return ResponseEntity.ok(astuceRepository.save(astuce));
    }

    @DeleteMapping("/astuces/{id}")
    @Operation(summary = "Supprimer une astuce")
    public ResponseEntity<Void> deleteAstuce(@PathVariable Long id) {
        Astuce astuce = astuceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Astuce non trouvée"));
        astuceRepository.delete(astuce);
        return ResponseEntity.noContent().build();
    }

    // ===== GESTION DES NUMÉROS UTILES =====

    @GetMapping("/numeros-utiles")
    @Operation(summary = "Lister tous les numéros utiles (admin)")
    public ResponseEntity<List<NumeroUtile>> getAllNumerosUtiles() {
        return ResponseEntity.ok(numeroUtileRepository.findAll());
    }

    @PostMapping("/numeros-utiles")
    @Operation(summary = "Créer un nouveau numéro utile")
    public ResponseEntity<NumeroUtile> createNumeroUtile(@Valid @RequestBody NumeroUtile numeroUtile) {
        NumeroUtile saved = numeroUtileRepository.save(numeroUtile);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/numeros-utiles/{id}")
    @Operation(summary = "Modifier un numéro utile existant")
    public ResponseEntity<NumeroUtile> updateNumeroUtile(
            @PathVariable Long id,
            @Valid @RequestBody NumeroUtile numeroUtileDetails) {

        NumeroUtile numeroUtile = numeroUtileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Numéro utile non trouvé"));

        if (numeroUtileDetails.getNom() != null) {
            numeroUtile.setNom(numeroUtileDetails.getNom());
        }
        if (numeroUtileDetails.getNumero() != null) {
            numeroUtile.setNumero(numeroUtileDetails.getNumero());
        }
        if (numeroUtileDetails.getType() != null) {
            numeroUtile.setType(numeroUtileDetails.getType());
        }

        return ResponseEntity.ok(numeroUtileRepository.save(numeroUtile));
    }

    @DeleteMapping("/numeros-utiles/{id}")
    @Operation(summary = "Supprimer un numéro utile")
    public ResponseEntity<Void> deleteNumeroUtile(@PathVariable Long id) {
        NumeroUtile numeroUtile = numeroUtileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Numéro utile non trouvé"));
        numeroUtileRepository.delete(numeroUtile);
        return ResponseEntity.noContent().build();
    }

    // ===== GESTION DE L'ANNONCE DÉFILANTE =====

    @GetMapping("/annonce-defilante")
    @Operation(summary = "Récupérer l'annonce défilante actuelle (admin)")
    public ResponseEntity<AnnonceDefilante> getAnnonceDefilante() {
        AnnonceDefilante annonce = annonceDefilanteRepository.findAll().stream()
                .findFirst()
                .orElse(AnnonceDefilante.builder().texte("").actif(false).build());
        return ResponseEntity.ok(annonce);
    }

    @PutMapping("/annonce-defilante")
    @Operation(summary = "Modifier l'annonce défilante (créée si elle n'existe pas encore)")
    public ResponseEntity<AnnonceDefilante> updateAnnonceDefilante(
            @jakarta.validation.Valid @RequestBody AnnonceDefilante dto) {

        AnnonceDefilante annonce = annonceDefilanteRepository.findAll().stream()
                .findFirst()
                .orElse(new AnnonceDefilante());

        annonce.setTexte(dto.getTexte());
        annonce.setActif(dto.isActif());

        return ResponseEntity.ok(annonceDefilanteRepository.save(annonce));
    }

    // ===== GESTION DES PUBLICITÉS =====

    @GetMapping("/publicites")
    @Operation(summary = "Lister toutes les publicités (admin)")
    public ResponseEntity<List<Publicite>> getAllPublicites() {
        return ResponseEntity.ok(publiciteRepository.findAll());
    }

    @PostMapping("/publicites")
    @Operation(summary = "Créer une nouvelle publicité")
    public ResponseEntity<Publicite> createPublicite(@Valid @RequestBody Publicite publicite) {
        Publicite saved = publiciteRepository.save(publicite);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/publicites/{id}")
    @Operation(summary = "Modifier une publicité existante")
    public ResponseEntity<Publicite> updatePublicite(
            @PathVariable Long id,
            @Valid @RequestBody Publicite publiciteDetails) {

        Publicite publicite = publiciteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Publicité non trouvée"));

        if (publiciteDetails.getMediaUrl() != null) {
            publicite.setMediaUrl(publiciteDetails.getMediaUrl());
        }
        if (publiciteDetails.getType() != null) {
            publicite.setType(publiciteDetails.getType());
        }
        publicite.setDateDebut(publiciteDetails.getDateDebut());
        publicite.setDateFin(publiciteDetails.getDateFin());
        publicite.setActif(publiciteDetails.isActif());
        publicite.setLienRedirection(publiciteDetails.getLienRedirection());

        return ResponseEntity.ok(publiciteRepository.save(publicite));
    }

    @DeleteMapping("/publicites/{id}")
    @Operation(summary = "Supprimer une publicité")
    public ResponseEntity<Void> deletePublicite(@PathVariable Long id) {
        Publicite publicite = publiciteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Publicité non trouvée"));
        publiciteRepository.delete(publicite);
        return ResponseEntity.noContent().build();
    }
}