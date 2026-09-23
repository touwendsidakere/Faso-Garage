# Faso-Garage
Plateforme web et mobile de géolocalisation pour l'écosystème automobile au Burkina Faso.

FASO GARAGES permet aux utilisateurs de trouver facilement des professionnels de l'automobile (garages, mécaniciens, dépanneurs, vendeurs de pièces détachées, etc.) autour d'eux, de consulter leurs services, de laisser des avis, et d'accéder à des numéros utiles et astuces pratiques liés à l'automobile.

 Contexte

Ce projet est réalisé dans le cadre du mémoire de fin d'études (Licence Génie Logiciel, option Développement Web et Mobile) à l'Université Virtuelle du Burkina Faso (UVBF), en partenariat avec l'entreprise SmartPrest (Ouagadougou, Burkina Faso).

 Fonctionnalités principales
 Recherche et géolocalisation de professionnels de l'automobile
 Fiches détaillées des professionnels (services, localisation, contacts)
 Système d'avis et de notation
 Répertoire de numéros utiles (dépannage, urgences, etc.)
 Astuces automobiles
 Authentification et gestion des comptes utilisateurs
 Stack technique
Composant	Technologie
Backend	Spring Boot (Java 21)
Base de données	PostgreSQL 16
API	REST (30 endpoints documentés avec Swagger)
Frontend Web	Angular
Frontend Mobile	Flutter (en cours de développement)
 Architecture

Le backend expose une API REST documentée via Swagger/OpenAPI, consommée par le frontend web (Angular) et, à terme, par l'application mobile (Flutter).

Le modèle de données s'articule autour des entités principales suivantes :

Utilisateur
Professionnel
Categorie
Service
Avis
NumeroUtile
Astuce
  Installation
Prérequis
Java 21
PostgreSQL 16
Node.js / Angular CLI
Maven
Backend
bash
git clone https://github.com/<votre-utilisateur>/faso-garages.git
cd faso-garages/backend
# Configurer les variables de connexion à la base de données dans application.properties
mvn spring-boot:run

L'API sera accessible sur http://localhost:8080 et la documentation Swagger sur http://localhost:8080/swagger-ui.html.

Frontend Web (Angular)
bash
cd faso-garages/frontend
npm install
ng serve

L'application sera accessible sur http://localhost:4200.

Frontend Mobile (Flutter)

Le développement de l'application mobile est en cours.

 Documentation API

L'ensemble des 30 endpoints REST est documenté via Swagger, accessible une fois le backend lancé à l'adresse /swagger-ui.html.

 Équipe
Développement backend & mobile : Ashley
Directeur de mémoire : Dr. Moumouni DJIBO
Maître de stage : M. Teddy Ivan Ibrahim BESSIN
Entreprise d'accueil : SmartPrest — Fondateur : M. Ibrahima OUEDRAOGO
 Licence

Projet académique réalisé dans le cadre du mémoire de fin d'études à l'UVBF.
