import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class ResultadosService {
  constructor(private api: ApiService) {}

  // getMaestrosPorCarreraYPeriodo(carrera: string, anio: number, periodo: string): Observable<any[]> {
  //   const token = localStorage.getItem('token');
  //   if (!token) {
  //     return throwError(() => new Error('Token no encontrado'));
  //   }

  //   const body = {
  //     sp: 'Bus_MaestrosXcarreraXanioXperiodo_Linea',
  //     parametros: [carrera, anio, periodo],
  //   };

  //   // ✅ Usa ApiService.post__ y pasa el token
  //   //return this.api.post__('api/buscar', body);
  // }
}
