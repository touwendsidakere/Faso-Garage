package com.fasogarages.backend.repository;

import com.fasogarages.backend.entity.Astuce;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;


public interface AstuceRepository extends JpaRepository<Astuce, Long> {

    /**
     * Liste des astuces triées par date de publication (récentes en premier)
     * @return Liste des astuces
     */
    List<Astuce> findAllByOrderByDatePublicationDesc();
}
