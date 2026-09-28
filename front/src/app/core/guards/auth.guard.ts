import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthGuardData, createAuthGuard } from 'keycloak-angular';

const isAccessAllowed = async (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
  authData: AuthGuardData
): Promise<boolean> => {
  const { authenticated, grantedRoles, keycloak } = authData;

  // Si non authentifié, rediriger vers Keycloak
  if (!authenticated) {
    await keycloak.login({
      redirectUri: window.location.origin + state.url
    });
    return false;
  }

  // Récupérer le rôle requis depuis la route
  const requiredRole = route.data['role'] as string | undefined;

  // Si aucun rôle requis, autoriser l'accès
  if (!requiredRole) {
    return true;
  }

  // Vérifier si l'utilisateur a le rôle requis
  const hasRole = grantedRoles.realmRoles.includes(requiredRole);

  if (!hasRole) {
    // Rediriger vers une page d'accès refusé
    inject(Router).navigate(['/forbidden']);
    return false;
  }

  return true;
};

export const canActivateAuthRole = createAuthGuard<CanActivateFn>(isAccessAllowed);