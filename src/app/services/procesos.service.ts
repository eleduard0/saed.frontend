import { Injectable, OnDestroy } from '@angular/core';
import { ApiService } from './api.service';
import { FunctionsService } from './functions.service';
import { Observable, Subject, catchError, takeUntil, tap, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class ProcesosService implements OnDestroy {
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
    return this.api.post('procesos', data).pipe(
      tap(() => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Proceso creado correctamente' });
      }),
      catchError((error) => this.handleError(error))
    );
  }

  update(id: string, data: any): Observable<any> {
    return this.api.put(`procesos/${id}`, data).pipe(
      tap(() => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Proceso actualizado correctamente' });
      }),
      catchError((error) => this.handleError(error))
    );
  }

  getList(nombre: string = ''): Observable<any> {
    const url = nombre ? `procesos?nombre=${encodeURIComponent(nombre)}` : 'procesos';
    return this.api.get(url).pipe(
      catchError((error) => this.handleError(error))
    );
  }

  confirmDelete(proceso: any) {
    this.fun.presentConfirm((e) => {
      if (e) {
        this.delete(proceso.id);
      }
    }, `Confirmar eliminación del proceso: ${proceso.nombre}`);
  }

  delete(id: string) {
    this.api.delete(`procesos/${id}`).pipe(
      takeUntil(this.deleteSubject),
      tap(() => this.deleteSubject.next())
    ).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Proceso eliminado correctamente' });
      },
      error: (error) => this.handleError(error)
    });
  }

  confirmDeleteAll() {
    this.fun.presentConfirm((e) => {
      if (e) {
        this.deleteAll();
      }
    }, 'Confirmar eliminación de todos los procesos');
  }

  deleteAll() {
    this.api.delete('procesos').pipe(
      takeUntil(this.deleteSubject),
      tap(() => this.deleteSubject.next())
    ).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Todos los procesos eliminados correctamente' });
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