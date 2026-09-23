package com.fasogarages.backend.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

/**
 * Abstraction du stockage de fichiers : la logique métier (contrôleurs, services)
 * ne dépend que de cette interface, jamais d'une implémentation concrète
 * (disque local, S3, etc.), pour permettre de changer de fournisseur sans
 * toucher au reste du code.
 */
public interface FichierStorageService {

    /**
     * Stocke un fichier et retourne son URL d'accès publique.
     */
    String stockerFichier(MultipartFile fichier, String sousDossier) throws IOException;

    /**
     * Supprime un fichier précédemment stocké, à partir de son URL.
     */
    boolean supprimerFichier(String url);
}
