package com.fasogarages.backend.service;

import com.fasogarages.backend.dto.AuthRequest;
import com.fasogarages.backend.dto.AuthResponse;
import com.fasogarages.backend.dto.RegisterRequest;
import com.fasogarages.backend.entity.Categorie;
import com.fasogarages.backend.entity.Professionnel;
import com.fasogarages.backend.entity.ServiceOffert;
import com.fasogarages.backend.entity.Utilisateur;
import com.fasogarages.backend.repository.CategorieRepository;
import com.fasogarages.backend.repository.ProfessionnelRepository;
import com.fasogarages.backend.repository.ServiceOffertRepository;
import com.fasogarages.backend.repository.UtilisateurRepository;
import com.fasogarages.backend.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UtilisateurRepository utilisateurRepository;
    private final ProfessionnelRepository professionnelRepository;
    private final CategorieRepository categorieRepository;
    private final ServiceOffertRepository serviceOffertRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final TelephoneValidationService telephoneValidationService;  // ← NOUVEAU

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // 1. VALIDER LE NUMÉRO DE TÉLÉPHONE
        telephoneValidationService.validerNumero(request.getTelephone());

        // 2. FORMATER LE NUMÉRO (E.164 pour stockage standard)
        String telephoneFormate = telephoneValidationService.formaterE164(request.getTelephone());

        // 3. Vérifier si le téléphone existe déjà
        if (utilisateurRepository.existsByTelephone(telephoneFormate)) {
            throw new RuntimeException("Ce numéro de téléphone est déjà utilisé");
        }

        // 4. Vérifier si l'email existe déjà (si fourni)
        if (request.getEmail() != null && !request.getEmail().isEmpty()
                && utilisateurRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Cet email est déjà utilisé");
        }

        // 5. Récupérer les informations du pays
        String codePays = telephoneValidationService.getCodePays(telephoneFormate);
        Integer indicatifPays = telephoneValidationService.getIndicatifPays(telephoneFormate);

        // 6. Déterminer le rôle
        if (!"ROLE_USER".equals(request.getRole()) && !"ROLE_PRO".equals(request.getRole())) {
            throw new RuntimeException("Le rôle doit être ROLE_USER ou ROLE_PRO");
        }
        Utilisateur.Role role = Utilisateur.Role.valueOf(request.getRole());

        // 7. Créer l'utilisateur
        Utilisateur utilisateur = Utilisateur.builder()
                .nom(request.getNom())
                .prenom(request.getPrenom())
                .telephone(telephoneFormate)
                .email(request.getEmail())
                .indicatifPays(indicatifPays)
                .codePaysIso(codePays)
                .telephoneVerifie(false)  // ← Par défaut, non vérifié
                .motDePasse(passwordEncoder.encode(request.getMotDePasse()))
                .role(role)
                .build();

        utilisateur = utilisateurRepository.save(utilisateur);

        // 8. Si c'est un professionnel, créer le profil
        if (role == Utilisateur.Role.ROLE_PRO) {
            if (request.getCategorieId() == null) {
                throw new RuntimeException("La catégorie est obligatoire pour un professionnel");
            }

            Categorie categorie = categorieRepository.findById(request.getCategorieId())
                    .orElseThrow(() -> new RuntimeException("Catégorie non trouvée"));

            Professionnel professionnel = Professionnel.builder()
                    .utilisateur(utilisateur)
                    .nomEtablissement(request.getNomEtablissement())
                    .services(getServicesFromIds(request.getServiceIds()))
                    .description(request.getDescription())
                    .telephone(request.getTelephonePro())
                    .whatsapp(request.getWhatsapp())
                    .latitude(request.getLatitude())
                    .longitude(request.getLongitude())
                    .ville(request.getVille())
                    .horaires(request.getHoraires())
                    .statut(Professionnel.Statut.EN_ATTENTE)
                    .build();

            professionnelRepository.save(professionnel);
        }

        // 9. Générer le token JWT
        UserDetails userDetails = userDetailsService.loadUserByUsername(utilisateur.getTelephone());
        String token = jwtUtils.generateToken(userDetails);

        return AuthResponse.builder()
                .token(token)
                .telephone(utilisateur.getTelephone())
                .email(utilisateur.getEmail())
                .nom(utilisateur.getNom())
                .prenom(utilisateur.getPrenom())
                .role(utilisateur.getRole().name())
                .userId(utilisateur.getId())
                .build();
    }

    @Transactional
    public AuthResponse createByAdmin(com.fasogarages.backend.dto.AdminCreateUtilisateurDTO dto) {
        if (utilisateurRepository.existsByTelephone(dto.getTelephone())) {
            throw new RuntimeException("Ce numéro de téléphone est déjà utilisé");
        }

        Utilisateur.Role role;
        try {
            role = Utilisateur.Role.valueOf(dto.getRole());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Le rôle doit être ROLE_USER, ROLE_PRO ou ROLE_ADMIN");
        }

        Utilisateur utilisateur = Utilisateur.builder()
                .nom(dto.getNom())
                .prenom(dto.getPrenom())
                .telephone(dto.getTelephone())
                .motDePasse(passwordEncoder.encode(dto.getMotDePasse()))
                .role(role)
                .build();

        utilisateur = utilisateurRepository.save(utilisateur);

        if (role == Utilisateur.Role.ROLE_PRO) {
            if (dto.getNomEtablissement() == null) {
                throw new RuntimeException("Le nom de l'établissement est obligatoire pour un professionnel");
            }

            Professionnel professionnel = Professionnel.builder()
                    .utilisateur(utilisateur)
                    .nomEtablissement(dto.getNomEtablissement())
                    .services(getServicesFromIds(dto.getServiceIds()))
                    .description(dto.getDescription())
                    .telephone(dto.getTelephonePro())
                    .whatsapp(dto.getWhatsapp())
                    .latitude(dto.getLatitude())
                    .longitude(dto.getLongitude())
                    .ville(dto.getVille())
                    .horaires(dto.getHoraires())
                    .statut(Professionnel.Statut.VALIDE) // créé par un admin -> validé d'emblée
                    .build();

            professionnelRepository.save(professionnel);
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(utilisateur.getTelephone());
        String token = jwtUtils.generateToken(userDetails);

        return AuthResponse.builder()
                .token(token)
                .telephone(utilisateur.getTelephone())
                .email(utilisateur.getEmail())
                .nom(utilisateur.getNom())
                .prenom(utilisateur.getPrenom())
                .role(utilisateur.getRole().name())
                .userId(utilisateur.getId())
                .build();
    }

    private List<ServiceOffert> getServicesFromIds(List<Long> serviceIds) {
        if (serviceIds == null || serviceIds.isEmpty()) {
            return new java.util.ArrayList<>();
        }
        return serviceOffertRepository.findAllById(serviceIds);
    }

    public AuthResponse login(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getTelephone(), request.getMotDePasse())
        );

        Utilisateur utilisateur = utilisateurRepository.findByTelephone(request.getTelephone())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        UserDetails userDetails = userDetailsService.loadUserByUsername(utilisateur.getTelephone());
        String token = jwtUtils.generateToken(userDetails);

        return AuthResponse.builder()
                .token(token)
                .telephone(utilisateur.getTelephone())
                .email(utilisateur.getEmail())
                .nom(utilisateur.getNom())
                .prenom(utilisateur.getPrenom())
                .role(utilisateur.getRole().name())
                .userId(utilisateur.getId())
                .build();
    }
}