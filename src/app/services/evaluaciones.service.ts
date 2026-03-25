import { Injectable, OnDestroy } from '@angular/core';
import { ApiService } from './api.service';
import { FunctionsService } from './functions.service';
import { Observable, Subject, catchError, takeUntil, tap, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class EvaluacionesService implements OnDestroy {
  private deleteSubject: Subject<void> = new Subject<void>();

  constructor(
    private http:HttpClient,
    private api: ApiService, 
    private fun: FunctionsService,
    private messageService: MessageService
  ) {}

  ngOnDestroy() {
    this.deleteSubject.next(); 
    this.deleteSubject.complete();
  }

  getDeleteObservable(): Observable<void> {
    return this.deleteSubject.asObservable();
  }

  // Crear una nueva evaluación
  save(data: any): Observable<any> {
    // Asegurarse de que los campos requeridos estén presentes
    const evaluacionData = {
      nombre: data.nombre,
      materia: data.materia,
      maestro: data.maestro,
      grupo: data.grupo,
      alumno: data.alumno,
      procesoId: data.procesoId,  // Este es el ID del proceso
      instrumentoId: data.instrumentoId,  // Este es el ID del instrumento
      estatus: data.estatus
    };

    return this.api.post('evaluaciones', evaluacionData).pipe(
      tap(() => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Evaluación creada correctamente' });
      }),
      catchError((error) => this.handleError(error))
    );
  }

  // Actualizar una evaluación
  update(id: string, data: any): Observable<any> {
    // Asegurarse de que los campos requeridos estén presentes
    const evaluacionData = {
      nombre: data.nombre,
      materia: data.materia,
      maestro: data.maestro,
      grupo: data.grupo,
      alumno: data.alumno,
      procesoId: data.procesoId,  // Este es el ID del proceso
      instrumentoId: data.instrumentoId,  // Este es el ID del instrumento
      estatus: data.estatus
    };

    return this.api.put(`evaluaciones/${id}`, evaluacionData).pipe(
      tap(() => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Evaluación actualizada correctamente' });
      }),
      catchError((error) => this.handleError(error))
    );
  }

  // Obtener la lista de evaluaciones
  getList(nombre: string = ''): Observable<any> {
    const url = nombre ? `evaluaciones?nombre=${encodeURIComponent(nombre)}` : 'evaluaciones';
    return this.api.get(url).pipe(
      catchError((error) => this.handleError(error))
    );
  }

  // Confirmar eliminación de una evaluación
  confirmDelete(evaluacion: any) {
    this.fun.presentConfirm((e) => {
      if (e) {
        this.delete(evaluacion.id);
      }
    }, `Confirmar eliminación de la evaluación del alumno: ${evaluacion.alumno}`);
  }

  // Eliminar una evaluación
  delete(id: string) {
    this.api.delete(`evaluaciones/${id}`).pipe(
      takeUntil(this.deleteSubject),
      tap(() => this.deleteSubject.next())
    ).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Evaluación eliminada correctamente' });
      },
      error: (error) => this.handleError(error)
    });
  }

  // Confirmar eliminación de todas las evaluaciones
  confirmDeleteAll() {
    this.fun.presentConfirm((e) => {
      if (e) {
        this.deleteAll();
      }
    }, 'Confirmar eliminación de todas las evaluaciones');
  }

  getEvaluacionesCompletadas(alumnoId: number): Observable<any> {
    return this.http.get<any>(`http://localhost:3000/evaluaciones/completadas/${alumnoId}`);
  }
  
  // Eliminar todas las evaluaciones
  deleteAll() {
    this.api.delete('evaluaciones').pipe(
      takeUntil(this.deleteSubject),
      tap(() => this.deleteSubject.next())
    ).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Todas las evaluaciones eliminadas correctamente' });
      },
      error: (error) => this.handleError(error)
    });
  }

  // Manejar errores globalmente
  private handleError(error: any): Observable<never> {
    this.messageService.add({ 
      severity: 'error', 
      summary: 'Error', 
      detail: error.error?.message || 'Algo salió mal. Inténtalo de nuevo' 
    });
    return throwError(error);
  }
}
