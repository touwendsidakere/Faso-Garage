package com.fasogarages.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

/**
 * Implémentation de {@link FichierStorageService} qui stocke les fichiers
 * sur le disque local du serveur. À remplacer par une implémentation S3 (ou
 * équivalent) le jour où le projet doit tourner sur plusieurs instances.
 */
@Service
public class LocalFichierStorageService implements FichierStorageService {

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    private static final List<String> EXTENSIONS_AUTORISEES = Arrays.asList(
            "jpg", "jpeg", "png", "gif", "webp"
    );

    private static final long TAILLE_MAXIMALE = 5 * 1024 * 1024; // 5MB

    @Override
    public String stockerFichier(MultipartFile fichier, String sousDossier) throws IOException {
        // Vérifier l'extension
        String nomOriginal = fichier.getOriginalFilename();
        if (nomOriginal == null || nomOriginal.isEmpty()) {
            throw new IllegalArgumentException("Le nom du fichier est invalide");
        }

        String extension = extraireExtension(nomOriginal);
        if (!EXTENSIONS_AUTORISEES.contains(extension.toLowerCase())) {
            throw new IllegalArgumentException(
                    "Extension non autorisée. Extensions autorisées : " + String.join(", ", EXTENSIONS_AUTORISEES)
            );
        }

        // Vérifier la taille
        if (fichier.getSize() > TAILLE_MAXIMALE) {
            throw new IllegalArgumentException("Le fichier ne doit pas dépasser 5MB");
        }

        // Générer un nom de fichier unique
        String nomFichier = UUID.randomUUID().toString() + "." + extension;

        // Construire le chemin complet
        Path cheminDossier = Paths.get(uploadDir, sousDossier);
        Path cheminFichier = cheminDossier.resolve(nomFichier);

        // Créer le dossier s'il n'existe pas
        if (!Files.exists(cheminDossier)) {
            Files.createDirectories(cheminDossier);
        }

        // Copier le fichier
        Files.copy(fichier.getInputStream(), cheminFichier, StandardCopyOption.REPLACE_EXISTING);

        // Retourner l'URL publique
        return "/api/fichiers/" + sousDossier + "/" + nomFichier;
    }

    @Override
    public boolean supprimerFichier(String url) {
        try {
            // Extraire le chemin du fichier depuis l'URL
            String[] parts = url.split("/api/fichiers/");
            if (parts.length < 2) {
                return false;
            }

            String cheminRelatif = parts[1];
            Path racine = Paths.get(uploadDir).toAbsolutePath().normalize();
            Path cheminFichier = racine.resolve(cheminRelatif).normalize();

            if (!cheminFichier.startsWith(racine)) {
                return false;
            }

            return Files.deleteIfExists(cheminFichier);
        } catch (IOException e) {
            return false;
        }
    }

    /**
     * Extrait l'extension d'un nom de fichier
     */
    private String extraireExtension(String nomFichier) {
        int dernierPoint = nomFichier.lastIndexOf(".");
        if (dernierPoint == -1) {
            return "";
        }
        return nomFichier.substring(dernierPoint + 1);
    }
}
