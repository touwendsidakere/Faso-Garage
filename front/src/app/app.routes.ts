import { Routes } from '@angular/router';
import { authGuard, adminGuard, proGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./features/home/home/home').then((m) => m.Home),
  },
  {
    path: 'carte',
    loadComponent: () =>
      import('./features/carte/carte/carte').then((m) => m.Carte),
  },
  {
    path: 'toutes-les-entreprises',
    loadComponent: () =>
      import('./features/entreprises/entreprises/entreprises').then((m) => m.Entreprises),
  },
  {
    path: 'connexion',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/login/login/login').then((m) => m.Login),
  },
  {
    path: 'inscription',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/register-user/register-user/register-user').then(
        (m) => m.RegisterUser
      ),
  },
  {
    path: 'inscription-pro',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/register-pro/register-pro/register-pro').then(
        (m) => m.RegisterPro
      ),
  },
  {
    path: 'en-attente',
    loadComponent: () =>
      import('./features/auth/pending-validation/pending-validation/pending-validation').then(
        (m) => m.PendingValidation
      ),
  },
  {
    path: 'professionnel/:id',
    loadComponent: () =>
      import('./features/professionnel/professionnel-detail/professionnel-detail').then(
        (m) => m.ProfessionnelDetail
      ),
  },
  {
    path: 'numeros-utiles',
    loadComponent: () =>
      import('./features/numeros-utiles/numeros-utiles/numeros-utiles').then(
        (m) => m.NumerosUtiles
      ),
  },
  {
    path: 'astuces',
    loadComponent: () =>
      import('./features/astuces/astuces/astuces').then((m) => m.Astuces),
  },
  {
    path: 'profil',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/profil/profil/profil').then((m) => m.Profil),
  },
  {
    path: 'mon-etablissement',
    canActivate: [authGuard, proGuard],
    loadComponent: () =>
      import('./features/profil/profil-pro-edit/profil-pro-edit').then(
        (m) => m.ProfilProEdit
      ),
  },
  {
    path: 'categories',
    loadComponent: () =>
      import('./features/categories/categories/categories').then((m) => m.Categories),
  },
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./features/admin/admin-dashboard/admin-dashboard').then(
        (m) => m.AdminDashboard
      ),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/admin/admin-overview/admin-overview').then((m) => m.AdminOverview),
      },
      {
        path: 'professionnels',
        loadComponent: () =>
          import('./features/admin/admin-professionnels/admin-professionnels').then((m) => m.AdminProfessionnels),
      },
      {
        path: 'utilisateurs',
        loadComponent: () =>
          import('./features/admin/admin-utilisateurs/admin-utilisateurs').then((m) => m.AdminUtilisateurs),
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./features/admin/admin-categories/admin-categories').then((m) => m.AdminCategories),
      },
      {
        path: 'services',
        loadComponent: () =>
          import('./features/admin/admin-services/admin-services').then((m) => m.AdminServices),
      },
      {
        path: 'astuces',
        loadComponent: () =>
          import('./features/admin/admin-astuces/admin-astuces').then((m) => m.AdminAstuces),
      },
      {
        path: 'numeros-utiles',
        loadComponent: () =>
          import('./features/admin/admin-numeros-utiles/admin-numeros-utiles').then((m) => m.AdminNumerosUtiles),
      },
      {
        path: 'publicites',
        loadComponent: () =>
          import('./features/admin/admin-publicites/admin-publicites').then((m) => m.AdminPublicites),
      },
      {
        path: 'annonce',
        loadComponent: () =>
          import('./features/admin/admin-annonce/admin-annonce').then((m) => m.AdminAnnonce),
      },
      {
        path: 'abonnements',
        loadComponent: () =>
          import('./features/admin/admin-abonnements/admin-abonnements').then((m) => m.AdminAbonnements),
      },
      {
        path: 'parametres',
        loadComponent: () =>
          import('./features/admin/admin-parametres/admin-parametres').then((m) => m.AdminParametres),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];