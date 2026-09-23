import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth = inject(AuthService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const isAuthEndpoint = req.url.includes('/auth/login') || req.url.includes('/auth/register');

      if (err.status === 401 && !isAuthEndpoint) {
        auth.logout();
        router.navigate(['/connexion']);
      }
      if (err.status === 403) {
        router.navigate(['/']);
      }
      // On expose le message d'erreur de l'API ou un message générique
      const message =
        err.error?.erreur ?? `Erreur ${err.status} : veuillez réessayer.`;
      return throwError(() => new Error(message));
    })
  );
};