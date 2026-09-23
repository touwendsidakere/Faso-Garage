import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

// Redirige vers /connexion si non connecté
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) return true;
  return router.createUrlTree(['/connexion']);
};

// Réservé aux admins (rôle revérifié auprès du serveur, pas du localStorage)
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) return router.createUrlTree(['/connexion']);

  return auth.me().pipe(
    map((user) => (user.role === 'ROLE_ADMIN' ? true : router.createUrlTree(['/']))),
    catchError(() => of(router.createUrlTree(['/connexion'])))
  );
};

// Réservé aux professionnels (rôle revérifié auprès du serveur, pas du localStorage)
export const proGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) return router.createUrlTree(['/connexion']);

  return auth.me().pipe(
    map((user) => (user.role === 'ROLE_PRO' ? true : router.createUrlTree(['/']))),
    catchError(() => of(router.createUrlTree(['/connexion'])))
  );
};

// Redirige les utilisateurs déjà connectés (ex: page login)
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const role = auth.getRole();

  if (!auth.isLoggedIn()) return true;

  if (role === 'ROLE_ADMIN') return router.createUrlTree(['/admin']);
  if (role === 'ROLE_PRO') return router.createUrlTree(['/mon-etablissement']);
  return router.createUrlTree(['/']);
};