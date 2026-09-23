package com.fasogarages.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling  // ← Active les tâches planifiées (@Scheduled)
public class BackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
        System.out.println(" FASO GARAGES Backend démarré avec succès !");
        System.out.println(" Documentation Swagger : http://localhost:8080/swagger-ui.html");
        System.out.println(" Tâches planifiées activées (vérification des abonnements à 2h et rappels à 10h)");
    }
}