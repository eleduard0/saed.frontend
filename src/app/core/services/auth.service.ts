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

  // Expresión regular para detectar matrícula (ej: L12345678) o número de empleado (solo dígitos)
  // Ajusta según el formato real de tu institución
  private readonly MATRICULA_REGEX = /^[a-zA-Z]\d{8,}$/;
  private readonly EMPLEADO_REGEX  = /^\d{6,}$/;

  constructor(private http: HttpClient, private router: Router) {}

  /**
   * Determina si la credencial ingresada pertenece a un usuario
   * institucional (alumno/empleado) o a un admin local.
   *
   * Reglas:
   *  - Matrícula  → alumno  → endpoint escolar
   *  - Número de empleado → también escolar (ajustar si tiene endpoint propio)
   *  - Correo o username sin formato universitario → admin local
   */
  private esUsuarioInstitucional(credencial: string): boolean {
    return (
      this.MATRICULA_REGEX.test(credencial) ||
      this.EMPLEADO_REGEX.test(credencial)
    );
  }

  /**
   * Punto de entrada único. Detecta el tipo de usuario y delega
   * al login correspondiente.
   */
  login(credencial: string, password: string): Observable<any> {
    if (this.esUsuarioInstitucional(credencial)) {
      return this.loginEscolar(credencial, password);
    } else {
      return this.loginAdmin(credencial, password);
    }
  }

  // ─────────────────────────────────────────────
  // Login Escolar  →  POST /auth/login
  // ─────────────────────────────────────────────
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

  // ─────────────────────────────────────────────
  // Login Admin  →  POST /auth/admin/login
  // El backend devuelve solo el token como string
  // ─────────────────────────────────────────────
  private loginAdmin(username: string, password: string): Observable<string> {
    return this.http
      .post(`${environment.apiUrl}/admin/auth/login`, { username, password }, { responseType: 'text' })
      .pipe(
        tap((token) => {
          const sesion: UsuarioSesion = {
            username,
            rol:   'Admin',
            token,
          };
          this.guardarSesion(sesion);
        }),
        catchError((err) =>
          throwError(() => new Error(err?.error ?? 'Credenciales incorrectas'))
        )
      );
  }

  // ─────────────────────────────────────────────
  // Helpers de sesión
  // ─────────────────────────────────────────────
  private guardarSesion(sesion: UsuarioSesion): void {
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(sesion));
  }

  getSesion(): UsuarioSesion | null {
    const raw = localStorage.getItem(this.SESSION_KEY);
    return raw ? (JSON.parse(raw) as UsuarioSesion) : null;
  }

  getToken(): string | null {
    return this.getSesion()?.token ?? null;
  }

  estaAutenticado(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem(this.SESSION_KEY);
    this.router.navigate(['/auth/login']);
  }
}