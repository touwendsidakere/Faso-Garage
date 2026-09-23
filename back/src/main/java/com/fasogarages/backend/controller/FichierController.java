package com.fasogarages.backend.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.fasogarages.backend.entity.ImageProfessionnel;
import com.fasogarages.backend.entity.Professionnel;
import com.fasogarages.backend.entity.Utilisateur;
import com.fasogarages.backend.repository.ImageProfessionnelRepository;
import com.fasogarages.backend.repository.ProfessionnelRepository;
import com.fasogarages.backend.service.FichierStorageService;
import com.fasogarages.backend.service.ProfessionnelService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/fichiers")
@RequiredArgsConstructor
@Tag(name = "Fichiers", description = "Endpoints pour l'upload et le téléchargement de fichiers")
public class FichierController {

    private final FichierStorageService fichierStorageService;
    private final ProfessionnelService professionnelService;
    private final ProfessionnelRepository professionnelRepository;
    private final ImageProfessionnelRepository imageProfessionnelRepository;

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    @PostMapping("/upload")
    @Operation(summary = "Uploader un fichier (logo, couverture, photo de galerie, publicité...)")
    public ResponseEntity<String> uploaderFichier(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam("fichier") MultipartFile fichier,
            @RequestParam(value = "type", defaultValue = "PHOTO") String type
    ) {
        try {
            Utilisateur utilisateur = (Utilisateur) userDetails;
            String url = fichierStorageService.stockerFichier(fichier, "professionnels/" + utilisateur.getId());

            // Ne concerne que les utilisateurs ayant un profil professionnel
            // (ex: un admin qui uploade une publicité n'a pas de Professionnel associé)
            professionnelRepository.findByUtilisateurId(utilisateur.getId()).ifPresent(professionnel -> {
                if ("LOGO".equalsIgnoreCase(type)) {
                    professionnel.setLogoUrl(url);
                    professionnelRepository.save(professionnel);
                } else if ("COUVERTURE".equalsIgnoreCase(type)) {
                    professionnel.setPhotoCouverture(url);
                    professionnelRepository.save(professionnel);
                } else {
                    // PHOTO / GALERIE : ajoutée à la galerie
                    int ordreActuel = imageProfessionnelRepository
                            .findByProfessionnelIdOrderByOrdreAsc(professionnel.getId()).size();

                    ImageProfessionnel image = ImageProfessionnel.builder()
                            .professionnel(professionnel)
                            .nomFichier(fichier.getOriginalFilename())
                            .url(url)
                            .type(type)
                            .ordre(ordreActuel)
                            .taille(fichier.getSize())
                            .build();
                    imageProfessionnelRepository.save(image);
                }
            });

            return ResponseEntity.ok(url);
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Erreur lors de l'upload : " + e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }

    @DeleteMapping("/galerie/{imageId}")
    @Operation(summary = "Supprimer une photo de la galerie du professionnel connecté")
    public ResponseEntity<Void> supprimerPhotoGalerie(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long imageId
    ) {
        Utilisateur utilisateur = (Utilisateur) userDetails;
        Professionnel professionnel = professionnelRepository.findByUtilisateurId(utilisateur.getId())
                .orElseThrow(() -> new RuntimeException("Profil professionnel non trouvé"));

        ImageProfessionnel image = imageProfessionnelRepository
                .findByIdAndProfessionnelId(imageId, professionnel.getId())
                .orElseThrow(() -> new RuntimeException("Photo non trouvée"));

        imageProfessionnelRepository.delete(image);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{sousDossier}/{nomFichier:.+}")
    @Operation(summary = "Télécharger un fichier")
    public ResponseEntity<Resource> telechargerFichier(
            @PathVariable String sousDossier,
            @PathVariable String nomFichier
    ) throws IOException {
        Path racine = Paths.get(uploadDir).toAbsolutePath().normalize();
        Path cheminFichier = racine.resolve(sousDossier).resolve(nomFichier).normalize();

        if (!cheminFichier.startsWith(racine)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Resource resource = new UrlResource(cheminFichier.toUri());

        if (!resource.exists() || !resource.isReadable()) {
            return ResponseEntity.notFound().build();
        }

        String contentType = Files.probeContentType(cheminFichier);
        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}