import { Routes } from '@angular/router';
import { canActivateAuthRole } from './core/guards/auth.guard';

export const routes: Routes = [
  // ===== ROUTES PUBLIQUES =====
  {
    path: '',
    loadComponent: () => import('./features/home/home/home').then(m => m.Home)
  },
  {
    path: 'carte',
    loadComponent: () => import('./features/carte/carte/carte').then(m => m.Carte)
  },
  {
    path: 'astuces',
    loadComponent: () => import('./features/astuces/astuces/astuces').then(m => m.Astuces)
  },
  {
    path: 'numeros-utiles',
    loadComponent: () => import('./features/numeros-utiles/numeros-utiles/numeros-utiles').then(m => m.NumerosUtiles)
  },

  // ===== AUTHENTIFICATION =====
  {
    path: 'connexion',
    loadComponent: () => import('./features/auth/login/login/login').then(m => m.Login)
  },
  {
    path: 'inscription',
    loadComponent: () => import('./features/auth/register-user/register-user/register-user').then(m => m.RegisterUser)
  },
  {
    path: 'inscription-pro',
    loadComponent: () => import('./features/auth/register-pro/register-pro/register-pro').then(m => m.RegisterPro)
  },

  // ===== ROUTES PROTÉGÉES (connecté) =====
  {
    path: 'profil',
    loadComponent: () => import('./features/profil/profil/profil').then(m => m.Profil),
    canActivate: [canActivateAuthRole]
  },
  {
    path: 'mon-etablissement',
    loadComponent: () => import('./features/profil/profil-pro-edit/profil-pro-edit').then(m => m.ProfilProEdit),
    canActivate: [canActivateAuthRole],
    data: { role: 'PRO' }
  },

  // ===== ROUTES ADMIN =====
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin-dashboard/admin-dashboard').then(m => m.AdminDashboard),
    canActivate: [canActivateAuthRole],
    data: { role: 'ADMIN' }
  },
  {
    path: 'admin/professionnels',
    loadComponent: () => import('./features/admin/admin-professionnels/admin-professionnels').then(m => m.AdminProfessionnels),
    canActivate: [canActivateAuthRole],
    data: { role: 'ADMIN' }
  },

  // ===== PAGE ACCÈS REFUSÉ =====
  {
    path: 'forbidden',
    loadComponent: () => import('./shared/components/forbidden/forbidden').then(m => m.Forbidden)
  },

  // ===== REDIRECTION PAR DÉFAUT =====
  { path: '**', redirectTo: '' }
];