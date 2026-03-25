import { Injectable, OnDestroy } from '@angular/core';
import { ApiService } from './api.service';
import { FunctionsService } from './functions.service';
import { Observable, Subject, catchError, takeUntil, tap, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class PreguntasService implements OnDestroy {
  private deleteSubject: Subject<void> = new Subject<void>(); 

  constructor(
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

  save(data: any): Observable<any> {
    return this.api.post('preguntas', data).pipe(
      tap((response) => {
        console.log('Respuesta de la API:', response);
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Pregunta creada correctamente' });
      }),
      catchError((error) => this.handleError(error))
    );
  }
  

  update(id: string, data: any): Observable<any> {
    return this.api.put(`preguntas/${id}`, data).pipe(
      tap(() => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Pregunta actualizada correctamente' });
      }),
      catchError((error) => this.handleError(error))
    );
  }

  getList(nombre: string = ''): Observable<any> {
    const url = nombre ? `preguntas?nombre=${encodeURIComponent(nombre)}` : 'preguntas';
    return this.api.get(url).pipe(
      catchError((error) => this.handleError(error))
    );
  }

  confirmDelete(pregunta: any) {
    this.fun.presentConfirm(
      (e) => {
        if (e) {
          this.delete(pregunta);
        }
      },
      `Confirmar eliminación de la pregunta: ${pregunta.texto}`
    );
  }

  delete(pregunta: any) {
    this.api.delete(`preguntas/${pregunta.id}`).pipe(
      takeUntil(this.deleteSubject),
      tap(() => this.deleteSubject.next())
    ).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Pregunta eliminada correctamente' });
      },
      error: (error) => this.handleError(error)
    });
  }

  confirmDeleteAll() {
    this.fun.presentConfirm(
      (e) => {
        if (e) {
          this.deleteAll();
        }
      },
      'Confirmar eliminación de todas las preguntas'
    );
  }

  deleteAll() {
    this.api.delete('preguntas').pipe(
      takeUntil(this.deleteSubject),
      tap(() => this.deleteSubject.next())
    ).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Todas las preguntas eliminadas correctamente' });
      },
      error: (error) => this.handleError(error)
    });
  }

  private handleError(error: any): Observable<never> {
    this.messageService.add({ 
      severity: 'error', 
      summary: 'Error', 
      detail: error.error?.message || 'Algo salió mal. Inténtalo de nuevo' 
    });
    return throwError(error);
  }
}
