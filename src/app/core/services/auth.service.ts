import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, throwError, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  LoginResponseDto,
  UsuarioSesion,
} from '../../pages/auth/models/auth.models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly SESSION_KEY = 'saed_usuario';

  private readonly MATRICULA_REGEX = /^[a-zA-Z]\d{8,}$/;
  private readonly EMPLEADO_REGEX  = /^\d{6,}$/;

  constructor(private http: HttpClient, private router: Router) {}

  private esUsuarioInstitucional(credencial: string): boolean {
    return (
      this.MATRICULA_REGEX.test(credencial) ||
      this.EMPLEADO_REGEX.test(credencial)
    );
  }

  login(credencial: string, password: string): Observable<any> {
    if (this.esUsuarioInstitucional(credencial)) {
      return this.loginEscolar(credencial, password);
    } else {
      return this.loginAdmin(credencial, password);
    }
  }

  // ── Login Escolar ─────────────────────────────────────────────────────────
  private loginEscolar(username: string, password: string): Observable<LoginResponseDto> {
    return this.http
      .post<LoginResponseDto>(`${environment.apiUrl}/auth/login-universidad`, { username, password })
      .pipe(
        tap((res) => {
          const sesion: UsuarioSesion = {
            username: res.matricula,
            nombre:   res.nombre,
            rol:      res.rol as 'Alumno',
            token:    res.token,
          };
          this.guardarSesion(sesion);
        }),
        catchError((err) =>
          throwError(() => new Error(err?.error?.message ?? 'Error al iniciar sesión escolar'))
        )
      );
  }

  // ── Login Admin ───────────────────────────────────────────────────────────
  // El backend devuelve { "token": "eyJ..." } como JSON
  private loginAdmin(username: string, password: string): Observable<any> {
    return this.http
      .post<{ token: string }>(`${environment.apiUrl}/admin/auth/login`, { username, password })
      .pipe(
        tap((res) => {
          // res es { token: "eyJ..." } — extraer solo el string
          const tokenString = typeof res === 'string'
            ? (res as string).replace(/^"|"$/g, '')  // si llegó como string puro
            : res.token;                              // si llegó como objeto JSON

          const sesion: UsuarioSesion = {
            username,
            rol:   'Admin',
            token: tokenString,
          };
          this.guardarSesion(sesion);
        }),
        catchError((err) =>
          throwError(() => new Error(err?.error?.message ?? err?.error ?? 'Credenciales incorrectas'))
        )
      );
  }

  // ── Helpers de sesión ─────────────────────────────────────────────────────
  private guardarSesion(sesion: UsuarioSesion): void {
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(sesion));
  }

  getSesion(): UsuarioSesion | null {
    try {
      const raw = localStorage.getItem(this.SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      localStorage.removeItem(this.SESSION_KEY);
      return null;
    }
  }

  getToken(): string | null {
    return this.getSesion()?.token ?? null;
  }

  estaAutenticado(): boolean {
    try {
      return !!this.getToken();
    } catch {
      return false;
    }
  }

  logout(): void {
    localStorage.removeItem(this.SESSION_KEY);
    this.router.navigate(['/login']);
  }

  hasRole(roles: string[]): boolean {
    const sesion = this.getSesion();
    return roles.includes(sesion?.rol ?? '');
  }
}