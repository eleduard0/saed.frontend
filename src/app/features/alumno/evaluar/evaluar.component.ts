import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import {
  EvaluacionService,
  EvaluacionDisponibleDto,
  RespuestaDto
} from 'src/app/core/services/evaluacion.service';

interface Opcion {
  id:    number;
  texto: string;
  valor: number;
}

interface Pregunta {
  id:      number;
  texto:   string;
  tipo:    string;
  orden:   number;
  opciones: Opcion[];
}

interface Categoria {
  id:        number;
  nombre:    string;
  orden:     number;
  preguntas: Pregunta[];
}

interface Instrumento {
  id:         number;
  nombre:     string;
  categorias: Categoria[];
}

@Component({
  selector: 'app-evaluar',
  standalone: true,
  templateUrl: './evaluar.component.html',
  styleUrl: './evaluar.component.scss',
  imports: [CommonModule, RouterModule, FormsModule],
})
export class EvaluarComponent implements OnInit {

  evaluacion: EvaluacionDisponibleDto | null = null;
  instrumento: Instrumento | null = null;

  // Map: preguntaId → opcionId seleccionada
  respuestas: Map<number, number> = new Map();
  // Map: preguntaId → texto libre (preguntas abiertas)
  respuestasAbiertas: Record<number, string> = {};
  comentario = '';

  loading   = false;
  guardando = false;
  errorMsg  = '';
  enviado   = false;
  evaluacionId: number | null = null;

  constructor(
    private router: Router,
    private api: ApiService,
    private evaluacionService: EvaluacionService
  ) {
    // Recibir datos del maestro/materia desde el state de navegación
    const nav = this.router.getCurrentNavigation();
    this.evaluacion = nav?.extras?.state?.['evaluacion'] ?? null;
  }

  ngOnInit(): void {
    if (!this.evaluacion) {
      // Si no hay datos en el state (recarga de página), volver al inicio
      this.router.navigate(['/inicio-alumno']);
      return;
    }
    this.cargarInstrumento();
  }

  cargarInstrumento(): void {
    this.loading  = true;
    this.errorMsg = '';

    // El instrumento viene del proceso activo
    this.api.get<any>('/procesos/activo').subscribe({
      next: (proceso) => {
        if (!proceso?.instrumentoId) {
          this.errorMsg = 'No hay instrumento asignado al proceso activo.';
          this.loading  = false;
          return;
        }
        this.api.get<Instrumento>(`/instrumentos/${proceso.instrumentoId}`).subscribe({
          next: (inst) => {
            this.instrumento = inst;
            this.loading     = false;
          },
          error: () => {
            this.errorMsg = 'No se pudo cargar el instrumento de evaluación.';
            this.loading  = false;
          }
        });
      },
      error: () => {
        this.errorMsg = 'No hay proceso activo.';
        this.loading  = false;
      }
    });
  }

  seleccionar(preguntaId: number, opcionId: number): void {
    this.respuestas.set(preguntaId, opcionId);
  }

  opcionSeleccionada(preguntaId: number, opcionId: number): boolean {
    return this.respuestas.get(preguntaId) === opcionId;
  }

  get totalPreguntas(): number {
    return this.instrumento?.categorias
      .flatMap(c => c.preguntas)
      .filter(p => p.tipo === 'Cerrada').length ?? 0;
  }

  get totalRespondidas(): number {
    return this.respuestas.size;
  }

  get progreso(): number {
    if (this.totalPreguntas === 0) return 0;
    return Math.round((this.totalRespondidas / this.totalPreguntas) * 100);
  }

  get formularioCompleto(): boolean {
    return this.totalRespondidas >= this.totalPreguntas;
  }

  enviar(): void {
    if (!this.formularioCompleto || !this.evaluacion) return;

    this.guardando = true;
    this.errorMsg  = '';

    const respuestasDto: RespuestaDto[] = Array.from(this.respuestas.entries()).map(
      ([preguntaId, opcionId]) => ({ preguntaId, opcionId })
    );

    this.evaluacionService.crearEvaluacion({
      idMaestro:  this.evaluacion.idMaestro,
      materiaId:  this.evaluacion.materiaId,
      respuestas: respuestasDto,
      comentario: this.comentario.trim() || undefined,
    }).subscribe({
      next: (res) => {
        this.guardando     = false;
        this.enviado       = true;
        this.evaluacionId  = res.id;
      },
      error: (err) => {
        this.guardando = false;
        this.errorMsg  = err?.error?.message ?? 'Error al enviar la evaluación.';
      },
    });
  }

  volver(): void {
    this.router.navigate(['/inicio-alumno']);
  }
}