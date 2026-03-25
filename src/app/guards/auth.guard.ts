import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { FunctionsService } from '../services/functions.service';
import { MessageService } from 'primeng/api';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    public auth: AuthService,
    public router: Router,
    public fun: FunctionsService,
    private message: MessageService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> {
    if (!this.auth.is_login) {
      this.router.navigate(['login'], { queryParams: { returnUrl: state.url } });
      return false;
    }

    const requiredRoles = route.data['roles'] as string[];
    const userRole = this.auth.getUserRole({ access_token: this.auth.getAccessToken() });

    if (!userRole || (requiredRoles && !requiredRoles.includes(userRole))) {
      this.message.add({ severity: 'error', summary: 'Acceso Denegado', detail: 'No tienes permisos para acceder a esta página.' });

      // Retraso breve para mostrar el mensaje antes de redirigir
      setTimeout(() => {
        switch (userRole) {
          case 'TEACHER':
            this.router.navigateByUrl('/component/maestro');
            break;
          case 'ADMIN':
            this.router.navigateByUrl('/dashboard');
            break;
          case 'STUDENT':
            this.router.navigateByUrl('/component/inicioalumno');
            break;
          default:
            this.router.navigateByUrl('/login'); // Página por defecto
        }
      }, 1500);  // Espera de 1.5 segundos para mostrar el mensaje

      return false;
    }

    return true;
  }
}
