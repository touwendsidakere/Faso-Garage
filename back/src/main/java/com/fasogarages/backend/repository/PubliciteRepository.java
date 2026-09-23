package com.fasogarages.backend.repository;

import com.fasogarages.backend.entity.Publicite;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PubliciteRepository extends JpaRepository<Publicite, Long> {
}