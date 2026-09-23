package com.fasogarages.backend.initializer;

import com.fasogarages.backend.entity.*;
import com.fasogarages.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@RequiredArgsConstructor
@Profile({"dev", "local"})
public class DataLoader implements CommandLineRunner {

    private final CategorieRepository categorieRepository;
    private final ServiceOffertRepository serviceOffertRepository;
    private final NumeroUtileRepository numeroUtileRepository;
    private final AstuceRepository astuceRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final ProfessionnelRepository professionnelRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {

        // ===== 1. CATÉGORIES =====
        if (categorieRepository.count() == 0) {
            List<Categorie> categories = List.of(
                    Categorie.builder().libelle("Garage mécanique").icone("fa-wrench").build(),
                    Categorie.builder().libelle("Station-service").icone("fa-gas-pump").build(),
                    Categorie.builder().libelle("Assurance auto").icone("fa-shield-alt").build(),
                    Categorie.builder().libelle("Dépannage").icone("fa-truck").build(),
                    Categorie.builder().libelle("Lavage automobile").icone("fa-car-wash").build()
            );
            categorieRepository.saveAll(categories);
            System.out.println("✅ Catégories initialisées");

            Categorie garage = categorieRepository.findByLibelleIgnoreCase("Garage mécanique").orElse(null);
            if (garage != null) {
                List<ServiceOffert> services = List.of(
                        ServiceOffert.builder().libelle("Révision moteur").categorie(garage).build(),
                        ServiceOffert.builder().libelle("Vidange").categorie(garage).build(),
                        ServiceOffert.builder().libelle("Pneus").categorie(garage).build(),
                        ServiceOffert.builder().libelle("Freinage").categorie(garage).build()
                );
                serviceOffertRepository.saveAll(services);
                System.out.println("✅ Services initiés");
            }
        }

        // ===== 2. NUMÉROS UTILES =====
        if (numeroUtileRepository.count() == 0) {
            List<NumeroUtile> numeros = List.of(
                    NumeroUtile.builder().nom("Police Nationale").numero("17").type("POLICE").build(),
                    NumeroUtile.builder().nom("Gendarmerie Nationale").numero("18").type("GENDARMERIE").build(),
                    NumeroUtile.builder().nom("Sapeurs-Pompiers").numero("18").type("POMPIERS").build(),
                    NumeroUtile.builder().nom("SAMU / Urgences").numero("15").type("SAMU").build()
            );
            numeroUtileRepository.saveAll(numeros);
            System.out.println("✅ Numéros utiles initialisés");
        }

        // ===== 3. ASTUCES =====
        if (astuceRepository.count() == 0) {
            List<Astuce> astuces = List.of(
                    Astuce.builder()
                            .titre("Vérifier la pression des pneus")
                            .contenu("Il est recommandé de vérifier la pression de vos pneus au moins une fois par mois.")
                            .build(),
                    Astuce.builder()
                            .titre("Changer l'huile régulièrement")
                            .contenu("La vidange doit être effectuée tous les 5 000 à 10 000 km.")
                            .build()
            );
            astuceRepository.saveAll(astuces);
            System.out.println("✅ Astuces initialisées");
        }

        // ===== 4. COMPTE ADMINISTRATEUR =====
        if (!utilisateurRepository.existsByEmail("admin@fasogarages.com") 
            && !utilisateurRepository.existsByTelephone("+22670000000")) {
            Utilisateur admin = Utilisateur.builder()
                    .nom("Administrateur")
                    .prenom("Faso")
                    .email("admin@fasogarages.com")
                    .telephone("+22670000000")
                    .motDePasse(passwordEncoder.encode("admin123"))
                    .role(Utilisateur.Role.ROLE_ADMIN)
                    .build();
            utilisateurRepository.save(admin);
            System.out.println("Compte administrateur créé");
        } else {
            System.out.println("compte administrateur existe déjà, ignoré.");
        }

        // ===== 5. PROFESSIONNEL DE DÉMONSTRATION =====
        if (!utilisateurRepository.existsByEmail("demo@garage.com") 
            && !utilisateurRepository.existsByTelephone("70001111")) {
            Utilisateur proUser = Utilisateur.builder()
                    .nom("Zongo")
                    .prenom("Souleymane")
                    .email("demo@garage.com")
                    .telephone("70001111")
                    .motDePasse(passwordEncoder.encode("password123"))
                    .role(Utilisateur.Role.ROLE_PRO)
                    .build();
            utilisateurRepository.save(proUser);

            Categorie categorie = categorieRepository.findByLibelleIgnoreCase("Garage mécanique").orElse(null);
            if (categorie != null) {
                Professionnel professionnel = Professionnel.builder()
                        .utilisateur(proUser)
                        .nomEtablissement("Garage Zongo")
                        .services(serviceOffertRepository.findAll())
                        .description("Garage généraliste avec 15 ans d'expérience.")
                        .telephone("70001111")
                        .whatsapp("70001111")
                        .latitude(12.3714)
                        .longitude(-1.5197)
                        .ville("Ouagadougou")
                        .horaires("Lun-Sam: 7h30-18h30")
                        .statut(Professionnel.Statut.VALIDE)
                        .build();
                professionnelRepository.save(professionnel);
                System.out.println("✅ Professionnel de démonstration créé");
            }
        } else {
            System.out.println("ℹ️ Professionnel de démonstration existe déjà, ignoré.");
        }

        System.out.println("🎉 Initialisation terminée !");
    }
}