import { Injectable, OnDestroy } from '@angular/core';
import { ApiService } from './api.service';
import { FunctionsService } from './functions.service';
import { Observable, Subject, catchError, takeUntil, tap, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class OpcionesService implements OnDestroy {
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
    return this.api.post('opciones', data).pipe(
      tap(() => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Opción creada correctamente' });
      }),
      catchError((error) => this.handleError(error))
    );
  }

  update(id: string, data: any): Observable<any> {
    return this.api.put(`opciones/${id}`, data).pipe(
      tap(() => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Opción actualizada correctamente' });
      }),
      catchError((error) => this.handleError(error))
    );
  }

  getList(nombre: string = ''): Observable<any> {
    const url = nombre ? `opciones?nombre=${encodeURIComponent(nombre)}` : 'opciones';
    return this.api.get(url).pipe(
      catchError((error) => this.handleError(error))
    );
  }

  confirmDelete(opcion: any) {
    this.fun.presentConfirm((e) => {
      if (e) {
        this.delete(opcion.id);
      }
    }, `Confirmar eliminación de la opción: ${opcion.opcion}`);
  }

  delete(id: string) {
    this.api.delete(`opciones/${id}`).pipe(
      takeUntil(this.deleteSubject),
      tap(() => this.deleteSubject.next())
    ).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Opción eliminada correctamente' });
      },
      error: (error) => this.handleError(error)
    });
  }

  confirmDeleteAll() {
    this.fun.presentConfirm((e) => {
      if (e) {
        this.deleteAll();
      }
    }, 'Confirmar eliminación de todas las opciones');
  }

  deleteAll() {
    this.api.delete('opciones').pipe(
      takeUntil(this.deleteSubject),
      tap(() => this.deleteSubject.next())
    ).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Todas las opciones eliminadas correctamente' });
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
