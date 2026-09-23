package com.fasogarages.backend.repository;

import com.fasogarages.backend.entity.NumeroUtile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;


public interface NumeroUtileRepository extends JpaRepository<NumeroUtile, Long> {

    /**
     * Liste des numéros utiles par type, triés par nom
     * @param type Le type (POLICE, GENDARMERIE, POMPIERS, SAMU)
     * @return Liste des numéros
     */
    List<NumeroUtile> findByTypeOrderByNomAsc(String type);

    /**
     * Recherche un numéro par son nom
     * @param nom Le nom du numéro
     * @return Un Optional contenant le numéro
     */
    Optional<NumeroUtile> findByNomIgnoreCase(String nom);
}
