import { Injectable, OnDestroy } from '@angular/core';
import { ApiService } from './api.service';
import { FunctionsService } from './functions.service';
import { Observable, Subject, catchError, throwError, map } from 'rxjs';
import { MessageService } from 'primeng/api';

interface VerificacionResponse {
  success: boolean;
  maestrosBloqueados: string[]; // Array de nombres de maestros con evaluaciones existentes
}
@Injectable({
  providedIn: 'root',
})
export class RespuestasService implements OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(
    private api: ApiService,
    private fun: FunctionsService,
    private messageService: MessageService
  ) {}

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private handleError(error: any): Observable<never> {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: error.error?.message || 'Error al verificar maestros'
    });
    return throwError(() => error);
  }

verificarMaestros(nombreAlumno: string): Observable<VerificacionResponse> {
  return this.api.post<VerificacionResponse>('respuestas/verificar-maestros', {
    alumno: nombreAlumno
  }).pipe(
    map((response: VerificacionResponse) => ({
      success: response.success,
      maestrosBloqueados: response.maestrosBloqueados || []
    })),
    catchError(error => this.handleError(error))
  );
}

  
  private confirmAction(message: string, action: () => void): void {
    this.fun.presentConfirm((e) => {
      if (e) {
        action();
      }
    }, message);
  }

  save(data: any): Observable<any> {
    return this.api.post('respuestas', data).pipe(catchError(this.handleError.bind(this)));
  }

  update(id: string, data: any): Observable<any> {
    return this.api.put(`respuestas/${id}`, data).pipe(catchError(this.handleError.bind(this)));
  }

  getList(): Observable<any> {
    return this.api.get('respuestas').pipe(catchError(this.handleError.bind(this)));
  }

  confirmDelete(respuesta: any) {
    this.confirmAction('Confirmar Eliminación', () => this.delete(respuesta).subscribe());
  }

  delete(respuesta: any): Observable<any> {
    return this.api.delete(`respuestas/${respuesta.id}`).pipe(catchError(this.handleError.bind(this)));
  }

  confirmDeleteAll() {
    this.confirmAction('Confirmar Eliminación de Todas', () => this.deleteAll().subscribe());
  }

  deleteAll(): Observable<any> {
    return this.api.delete('respuestas').pipe(catchError(this.handleError.bind(this)));
  }

  saveAll(data: any[]): Observable<any> {
    return this.api.post('respuestas/saveall', data).pipe(catchError(this.handleError.bind(this)));
  }
  
 
}