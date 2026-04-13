import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  Router,
  UrlTree,
} from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    // 1. Sin sesión → al login
    if (!this.authService.estaAutenticado()) {
      return this.router.createUrlTree(['/login']);
    }

    const sesion        = this.authService.getSesion();
    const rolActual     = sesion?.rol;
    const rolesPermitidos = route.data['roles'] as string[] | undefined;

    // 2. Si la ruta requiere roles, verificar que el usuario los tenga
    if (rolesPermitidos && rolesPermitidos.length > 0) {
      const tieneAcceso = rolesPermitidos.includes(rolActual ?? '');
      if (!tieneAcceso) {
        return this.dashboardPorRol(rolActual);
      }
    }

    return true;
  }

  private dashboardPorRol(rol?: string): UrlTree {
    switch (rol) {
      case 'Admin':
        return this.router.createUrlTree(['/dashboard']);
      case 'Alumno':
        return this.router.createUrlTree(['/component/inicioalumno']);
      default:
        return this.router.createUrlTree(['/login']);
    }
  }
}