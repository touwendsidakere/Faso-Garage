package com.fasogarages.backend.controller;

import com.fasogarages.backend.entity.Utilisateur;
import com.fasogarages.backend.repository.UtilisateurRepository;
import com.fasogarages.backend.service.FichierStorageService;
import com.fasogarages.backend.service.ProfessionnelService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/fichiers")
@RequiredArgsConstructor
@Tag(name = "Fichiers", description = "Upload et téléchargement de fichiers")
public class FichierController {

    private final FichierStorageService fichierStorageService;
    private final UtilisateurRepository utilisateurRepository;

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    @PostMapping("/upload")
    @Operation(summary = "Uploader un fichier pour un professionnel")
    public ResponseEntity<String> uploaderFichier(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam("fichier") MultipartFile fichier,
            @RequestParam(value = "type", defaultValue = "PHOTO") String type) {
        try {
            Utilisateur utilisateur = getUtilisateurFromJwt(jwt);
            String url = fichierStorageService.stockerFichier(fichier, "professionnels/" + utilisateur.getId());
            return ResponseEntity.ok(url);
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Erreur lors de l'upload : " + e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }

    @GetMapping("/{sousDossier}/{nomFichier:.+}")
    @Operation(summary = "Télécharger un fichier")
    public ResponseEntity<Resource> telechargerFichier(
            @PathVariable String sousDossier,
            @PathVariable String nomFichier) throws IOException {
        Path cheminFichier = Paths.get(uploadDir, sousDossier, nomFichier);
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

    /**
     * Extrait l'utilisateur local depuis le JWT Keycloak.
     */
    private Utilisateur getUtilisateurFromJwt(Jwt jwt) {
        String telephone = jwt.getClaimAsString("preferred_username");
        return utilisateurRepository.findByTelephone(telephone)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé : " + telephone));
    }
}