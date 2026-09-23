// ============================================================
// FASO GARAGES — MODELS
// ============================================================

// === TÉLÉPHONE / INDICATIF (pour le composant phone-input avec country picker) ===
// Le champ "telephone" dans tous les modèles/requêtes est TOUJOURS
// stocké et envoyé au format E.164 complet (ex: "+22670001111").
// Le composant phone-input assemble indicatif.code + numéro local avant envoi.
export interface Indicatif {
  pays: string;       // ex: "Burkina Faso"
  code: string;       // ex: "+226"
  drapeau: string;     // ex: "🇧🇫"
  isoCode: string;     // ex: "BF"
  longueurNumero?: number; // longueur attendue du numéro local (ex: 8 pour BF)
}

// === AUTH ===
export interface LoginRequest {
  telephone: string;
  motDePasse: string;
}

export interface LoginResponse {
  token: string;
  telephone: string;
  email?: string;
  nom?: string;
  prenom?: string;
  role: 'ROLE_USER' | 'ROLE_PRO' | 'ROLE_ADMIN';
  userId: number;
}

export interface RegisterUserRequest {
  nom: string;
  prenom: string;
  telephone: string;
  motDePasse: string;
  role: 'ROLE_USER';
}

export interface RegisterProRequest {
  nom: string;
  prenom: string;
  telephone: string;
  motDePasse: string;
  role: 'ROLE_PRO';
  nomEtablissement: string;
  categorieId: number;
  serviceIds: number[];
  description: string;
  whatsapp?: string;
  ville: string;
  horaires: string;
  longitude: number;
  latitude: number;
}

export interface ApiError {
  timestamp: string;
  status: number;
  erreur: string;
}

// === PROFESSIONNEL ===
export interface Professionnel {
  id: number;
  nomEtablissement: string;
  categorie: string;
  categorieId: number;
  serviceIds: number[];
  services: string[];
  description: string;

  // Contacts (multi-champs)
  telephone: string;
  telephone2?: string;
  whatsapp?: string;
  whatsapp2?: string;
  emailPublic?: string;
  siteWeb?: string;

  // Localisation
  latitude: number;
  longitude: number;
  ville: string;
  adressePhysique?: string;
  horaires: string;

  statut: 'PENDING' | 'VALIDE' | 'REJECTED';
  logoUrl?: string;
  photoCouverture?: string;
  galeriePhotos?: string[];
  distance?: number;
  moyenneNotes: number;
  nombreAvis: number;

  // Propriétaire du compte
  nomProprietaire: string;
  prenomProprietaire: string;
  emailProprietaire: string;
  telephoneProprietaire: string;

  appelPossible: boolean;
}

// === AVIS ===
export interface Avis {
  id: number;
  userId: number;
  nomUtilisateur: string;
  prenomUtilisateur: string;
  note: number;
  commentaire: string;
  dateCreation: string;
}

export interface AvisRequest {
  professionnelId: number;
  note: number;
  commentaire: string;
}

// === NUMÉROS UTILES ===
export interface NumeroUtile {
  id: number;
  nom: string;
  numero: string;
  type: string;
  description?: string;
}

// === ASTUCE ===
export interface Astuce {
  id: number;
  titre: string;
  contenu: string;
  categorie?: string;
  imageUrl?: string;
  datePublication: string;
  aLaUne?: boolean;
}

// === CATÉGORIE ===
export interface Categorie {
  id: number;
  libelle: string;
  description?: string;
  icone: string;
  nombreProfessionnels?: number;
  professionnels?: any[];
}

// === SERVICE ===
export interface Service {
  id: number;
  libelle: string;
  description?: string;
  categorie?: {
    id: number;
    libelle: string;
    icone?: string;
  };
  dateCreation?: string;
}

export interface ServiceRequest {
  libelle: string;
  description?: string;
  categorie?: { id: number };
}

// === ANNONCE DÉFILANTE (bandeau scrolling dans le header, gérée par admin) ===
export interface AnnonceDefilante {
  id: number;
  texte: string;
  actif: boolean;
}

export interface AnnonceDefilanteRequest {
  texte: string;
  actif: boolean;
}

// === PUBLICITÉ (carrousel accueil, géré par admin) ===
export interface Publicite {
  id: number;
  mediaUrl: string;
  type: 'IMAGE' | 'VIDEO';
  dateDebut?: string; // null/undefined = diffusion immédiate
  dateFin?: string;   // null/undefined = durée indéfinie
  actif: boolean;
  lienRedirection?: string;
}

export interface PubliciteRequest {
  mediaUrl: string;
  type: 'IMAGE' | 'VIDEO';
  dateDebut?: string;
  dateFin?: string;
  actif: boolean;
  lienRedirection?: string;
}

export interface AdminCreateUtilisateurRequest {
  nom: string;
  prenom: string;
  telephone: string;
  motDePasse: string;
  role: 'ROLE_USER' | 'ROLE_PRO' | 'ROLE_ADMIN';
  nomEtablissement?: string;
  serviceIds?: number[];
  description?: string;
  telephonePro?: string;
  whatsapp?: string;
  latitude?: number;
  longitude?: number;
  ville?: string;
  horaires?: string;
}