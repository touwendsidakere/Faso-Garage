package com.fasogarages.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class KeycloakAdminService {

    @Value("${keycloak.server-url:http://localhost:8081}")
    private String serverUrl;

    @Value("${keycloak.realm:faso-garages}")
    private String realm;

    @Value("${keycloak.client-id:faso-garages-Backend}")
    private String clientId;

    @Value("${keycloak.client-secret}")
    private String clientSecret;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Obtient un token admin via client_credentials pour appeler l'API Admin de Keycloak.
     */
    private String getAdminToken() {
        String url = serverUrl + "/realms/" + realm + "/protocol/openid-connect/token";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("grant_type", "client_credentials");
        body.add("client_id", clientId);
        body.add("client_secret", clientSecret);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);

        if (response.getBody() == null || response.getBody().get("access_token") == null) {
            throw new RuntimeException("Impossible d'obtenir un token admin Keycloak");
        }

        return (String) response.getBody().get("access_token");
    }

    /**
     * Crée un utilisateur dans Keycloak et lui assigne un rôle realm.
     *
     * @param username  Nom d'utilisateur (téléphone)
     * @param email     Email (peut être null)
     * @param password  Mot de passe
     * @param roleName  Nom du rôle SANS le préfixe ROLE_ ("USER", "PRO", "ADMIN")
     * @return L'ID Keycloak de l'utilisateur créé
     */
    public String createUser(String username, String email, String password, String roleName) {
        String token = getAdminToken();

        // 1. Créer l'utilisateur
        String createUserUrl = serverUrl + "/admin/realms/" + realm + "/users";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(token);

        Map<String, Object> user = new HashMap<>();
        user.put("username", username);
        user.put("enabled", true);
        user.put("emailVerified", true);
        if (email != null && !email.isEmpty()) {
            user.put("email", email);
        }

        // Définir le mot de passe
        Map<String, Object> credential = new HashMap<>();
        credential.put("type", "password");
        credential.put("value", password);
        credential.put("temporary", false);
        user.put("credentials", List.of(credential));

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(user, headers);
        ResponseEntity<Void> response = restTemplate.postForEntity(createUserUrl, request, Void.class);

        if (!response.getStatusCode().is2xxSuccessful()) {
            throw new RuntimeException("Erreur lors de la création de l'utilisateur dans Keycloak");
        }

        // 2. Récupérer l'ID de l'utilisateur créé
        String getUserIdUrl = createUserUrl + "?username=" + username + "&exact=true";
        ResponseEntity<List> usersResponse = restTemplate.exchange(
                getUserIdUrl, HttpMethod.GET, new HttpEntity<>(headers), List.class);

        if (usersResponse.getBody() == null || usersResponse.getBody().isEmpty()) {
            throw new RuntimeException("Utilisateur créé mais introuvable dans Keycloak");
        }

        @SuppressWarnings("unchecked")
        Map<String, Object> createdUser = (Map<String, Object>) usersResponse.getBody().get(0);
        String userId = (String) createdUser.get("id");

        // 3. Assigner le rôle
        assignRealmRole(userId, roleName, token);

        return userId;
    }

    /**
     * Assigne un rôle realm à un utilisateur Keycloak.
     */
    @SuppressWarnings("unchecked")
    private void assignRealmRole(String userId, String roleName, String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Récupérer les détails du rôle
        String getRoleUrl = serverUrl + "/admin/realms/" + realm + "/roles/" + roleName;
        ResponseEntity<Map> roleResponse = restTemplate.exchange(
                getRoleUrl, HttpMethod.GET, new HttpEntity<>(headers), Map.class);

        Map<String, Object> role = roleResponse.getBody();
        if (role == null) {
            throw new RuntimeException("Rôle Keycloak introuvable : " + roleName);
        }

        // Assigner le rôle
        String assignUrl = serverUrl + "/admin/realms/" + realm
                + "/users/" + userId + "/role-mappings/realm";

        HttpEntity<List<Map<String, Object>>> request = new HttpEntity<>(List.of(role), headers);
        restTemplate.postForEntity(assignUrl, request, Void.class);
    }

    /**
     * Supprime un utilisateur Keycloak.
     */
    public void deleteUser(String keycloakUserId) {
        String token = getAdminToken();

        String url = serverUrl + "/admin/realms/" + realm + "/users/" + keycloakUserId;

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);

        restTemplate.exchange(url, HttpMethod.DELETE, new HttpEntity<>(headers), Void.class);
    }
}
