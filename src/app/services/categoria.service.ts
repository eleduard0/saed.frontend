import { Injectable, OnDestroy } from '@angular/core';
import { ApiService } from './api.service';
import { FunctionsService } from './functions.service';
import { Observable, Subject, catchError, takeUntil, tap, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class CategoriasService implements OnDestroy {
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
    return this.api.post('categorias', data).pipe(
      tap(() => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Categoría creada correctamente' });
      }),
      catchError((error) => this.handleError(error))
    );
  }

  update(id: string, data: any): Observable<any> {
    return this.api.put(`categorias/${id}`, data).pipe(
      tap(() => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Categoría actualizada correctamente' });
      }),
      catchError((error) => this.handleError(error))
    );
  }

  getList(nombre: string = ''): Observable<any> {
    const url = nombre ? `categorias?nombre=${encodeURIComponent(nombre)}` : 'categorias';
    return this.api.get(url).pipe(
      catchError((error) => this.handleError(error))
    );
  }

  confirmDelete(categoria: any) {
    this.fun.presentConfirm((e) => {
      if (e) {
        this.delete(categoria);
      }
    }, `Confirmar eliminación de la categoría: ${categoria.nombre}`);
  }

  delete(categoria: any) {
    this.api.delete(`categorias/${categoria.id}`).pipe(
      takeUntil(this.deleteSubject),
      tap(() => this.deleteSubject.next())
    ).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Categoría eliminada correctamente' });
      },
      error: (error) => this.handleError(error)
    });
  }

  confirmDeleteAll() {
    this.fun.presentConfirm((e) => {
      if (e) {
        this.deleteAll();
      }
    }, 'Confirmar eliminación de todas las categorías');
  }

  deleteAll() {
    this.api.delete('categorias').pipe(
      takeUntil(this.deleteSubject),
      tap(() => this.deleteSubject.next())
    ).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Todas las categorías eliminadas correctamente' });
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
