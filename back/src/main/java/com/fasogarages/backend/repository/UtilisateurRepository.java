package com.fasogarages.backend.repository;

import com.fasogarages.backend.entity.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UtilisateurRepository extends JpaRepository<Utilisateur, Long> {

    Optional<Utilisateur> findByTelephone(String telephone);

    Optional<Utilisateur> findByEmail(String email);

    boolean existsByTelephone(String telephone);

    boolean existsByEmail(String email);
}