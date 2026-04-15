import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

export interface EvaluacionDisponibleDto {
  idMaestro:     string;
  nombreMaestro: string;
  materiaId:     string;
  materia:       string;
  grupo:         string;
}

export interface RespuestaDto {
  preguntaId: number;
  opcionId:   number;
}

export interface CrearEvaluacionDto {
  idMaestro:  string;
  materiaId:  string;
  respuestas: RespuestaDto[];
  comentario?: string;
}

@Injectable({ providedIn: 'root' })
export class EvaluacionService {

  constructor(private api: ApiService) {}

  getDisponibles() {
    return this.api.get<EvaluacionDisponibleDto[]>('/evaluaciones/disponibles');
  }

  crearEvaluacion(dto: CrearEvaluacionDto) {
    return this.api.post<{ id: number }>('/evaluaciones', dto);
  }
}