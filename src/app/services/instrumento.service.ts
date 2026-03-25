import { Injectable, OnDestroy } from '@angular/core';
import { ApiService } from './api.service';
import { FunctionsService } from './functions.service';
import { Observable, Subject, catchError, takeUntil, tap, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class InstrumentosService implements OnDestroy {
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
    return this.api.post('instrumentos', data).pipe(
      tap(() => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Instrumento creado correctamente' });
      }),
      catchError((error) => this.handleError(error))
    );
  }

  update(id: string, data: any): Observable<any> {
    return this.api.put(`instrumentos/${id}`, data).pipe(
      tap(() => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Instrumento actualizado correctamente' });
      }),
      catchError((error) => this.handleError(error))
    );
  }

  getList(nombre: string = ''): Observable<any> {
    const url = nombre ? `instrumentos?nombre=${encodeURIComponent(nombre)}` : 'instrumentos';
    return this.api.get(url).pipe(
      catchError((error) => this.handleError(error))
    );
  }

  confirmDelete(instrumento: any) {
    this.fun.presentConfirm((e) => {
      if (e) {
        this.delete(instrumento.id);
      }
    }, `Confirmar eliminación del instrumento: ${instrumento.nombre}`);
  }

  delete(id: string) {
    this.api.delete(`instrumentos/${id}`).pipe(
      takeUntil(this.deleteSubject),
      tap(() => this.deleteSubject.next())
    ).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Instrumento eliminado correctamente' });
      },
      error: (error) => this.handleError(error)
    });
  }

  confirmDeleteAll() {
    this.fun.presentConfirm((e) => {
      if (e) {
        this.deleteAll();
      }
    }, 'Confirmar eliminación de todos los instrumentos');
  }

  deleteAll() {
    this.api.delete('instrumentos').pipe(
      takeUntil(this.deleteSubject),
      tap(() => this.deleteSubject.next())
    ).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Todos los instrumentos eliminados correctamente' });
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
