import { Component, OnInit } from '@angular/core';
import { InstrumentosService } from 'src/app/services/instrumento.service';
import { CategoriasService } from 'src/app/services/categoria.service';
import { PreguntasService } from 'src/app/services/pregunta.service';
import { OpcionesService } from 'src/app/services/opciones.service';
import { RespuestasService } from 'src/app/services/respuesta.service';
import { MessageService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

interface Categoria {
  id: string;
  nombre: string;
}

interface Pregunta {
  id: string;
  texto: string;
  tipo: boolean; // true: con opciones, false: abierta
  orden: number;
  categoriaId: string;
  nombreMaestro: string;
  materiaNombre: string;
}

interface Opcion {
  id: string;
  opcion: string;
  nivel: number;
}

interface Respuesta {
  preguntaId: string;
  opcionId?: string; // Para respuestas con opción
  texto?: string;    // Para respuestas abiertas
  // Campos adicionales a enviar al backend:
  alumno?: string;
  NombreMaestro?: string;
  grupo?: string;
  materia?: string;
  momento?: Date;
  idMaestro?: string; // ID del maestro
}

@Component({
  selector: 'app-preguntas',
  templateUrl: './preguntas.component.html',
  styleUrls: ['./preguntas.component.scss'],
})
export class PreguntasComponent implements OnInit {
  categorias: Categoria[] = [];
  preguntas: Pregunta[] = [];
  opciones: Opcion[] = [];
  selectedOption: { [key: string]: string } = {}; // Para respuestas con opción
  selectedText: { [key: string]: string } = {}; // Para respuestas abiertas
  loading: boolean = false;

  // En un escenario real estos datos podrían provenir del sistema de autenticación
  alumnoNombre: string = 'Waos';
  grupo: string = '';

  profesorNombre: string = '';
  materiaNombre: string = '';

  constructor(
    private authService: AuthService, 
    private categoriasService: CategoriasService,
    private preguntasService: PreguntasService,
    private opcionesService: OpcionesService,
    private respuestasService: RespuestasService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.profesorNombre = params['nombreMaestro'];
      this.materiaNombre = params['materia'];
      this.grupo = params['grupo']
      this.alumnoNombre = this.authService.user.name;
      this.cargarDatosProfesor();
      console.log(this.preguntas)
    });
  }

  cargarDatosProfesor(): void {
    // Reinicia las respuestas y preguntas previas
    this.selectedOption = {};
    this.selectedText = {};
    this.preguntas = [];

    // Carga la información necesaria
    this.obtenerCategorias();
    this.obtenerPreguntas();
    this.obtenerOpciones();
    this.cargarRespuestasGuardadas();
    this.filtrarPreguntas();
  }

  filtrarPreguntas(): void {
    // Filtra las preguntas según el profesor y la materia actual
    this.preguntas = this.preguntas.filter(
      (pregunta) =>
        pregunta.nombreMaestro === this.profesorNombre &&
        pregunta.materiaNombre === this.materiaNombre
    );
    
  }

  cargarRespuestasGuardadas(): void {
    const key = `respuestas_${this.profesorNombre}_${this.materiaNombre}`;
    const respuestasGuardadas: Respuesta[] = JSON.parse(localStorage.getItem(key) || '[]');

    respuestasGuardadas.forEach((respuesta) => {
      if (respuesta.opcionId) {
        this.selectedOption[respuesta.preguntaId] = respuesta.opcionId;
      }
      if (respuesta.texto) {
        this.selectedText[respuesta.preguntaId] = respuesta.texto;
      }
    });
  }

  guardarRespuestas(): void {
    const respuestas: Respuesta[] = this.preguntas.map((pregunta) => {
      if (pregunta.tipo) {
        // Pregunta de opción: guarda el id de la opción seleccionada
        return {
          preguntaId: pregunta.id,
          opcionId: this.selectedOption[pregunta.id] || '',
        };
      } else {
        // Pregunta abierta: guarda el texto ingresado
        return {
          preguntaId: pregunta.id,
          texto: this.selectedText[pregunta.id] || '',
        };
      }
    });

    const key = `respuestas_${this.profesorNombre}_${this.materiaNombre}`;
    localStorage.setItem(key, JSON.stringify(respuestas));
  }

enviarRespuestas(): void {
  const key = `respuestas_${this.profesorNombre}_${this.materiaNombre}`;
  let respuestas: Respuesta[] = JSON.parse(localStorage.getItem(key) || '[]');

  if (respuestas.length === 0) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Advertencia',
      detail: 'No hay respuestas para enviar.',
    });
    return;
  }

  // Obtiene el momento actual
  const momento = new Date();

  // Enriquecer cada respuesta con los datos adicionales requeridos
  respuestas = respuestas.map((resp) => ({
    ...resp,
    alumno: this.alumnoNombre,
    NombreMaestro: this.profesorNombre,
    grupo: this.grupo,
    materia: this.materiaNombre,
    momento: momento,
  }));

  this.loading = true;
  this.respuestasService.saveAll(respuestas).subscribe({
    next: () => {
      this.loading = false;
      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Respuestas enviadas correctamente.',
      });
      localStorage.removeItem(key); // Limpia las respuestas locales

      // Marca las respuestas como completadas en el localStorage para que persista entre sesiones
      localStorage.setItem(`respuestas_completadas_${this.profesorNombre}_${this.materiaNombre}`, 'true');

      // Reiniciar las respuestas seleccionadas
      this.selectedOption = {};
      this.selectedText = {};

      this.router.navigate(['/component/maestros-alumno']);
    },
    error: (err) => {
      this.loading = false;
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: err.error?.message || 'Error al enviar las respuestas.',
      });
    },
  });
}


  obtenerCategorias(): void {
    this.categoriasService.getList().subscribe((data) => (this.categorias = data));
  }

  obtenerPreguntas(): void {
    this.preguntasService.getList().subscribe((data) => (this.preguntas = data));
  }

  obtenerOpciones(): void {
    this.opcionesService.getList().subscribe((data) => (this.opciones = data));
  }

  obtenerPreguntasPorCategoria(categoriaId: string): Pregunta[] {
    return this.preguntas.filter((pregunta) => pregunta.categoriaId === categoriaId);
  }

  obtenerPreguntasFalsas(): Pregunta[] {
    return this.preguntas.filter((pregunta) => pregunta.tipo === false);
  }

  // Actualiza la respuesta al seleccionar una opción
  onOptionChange(preguntaId: string, opcionId: string): void {
    this.selectedOption[preguntaId] = opcionId;
    this.guardarRespuestas();
  }

  // Actualiza la respuesta de texto para preguntas abiertas
  onTextChange(preguntaId: string, texto: string): void {
    this.selectedText[preguntaId] = texto;
    this.guardarRespuestas();
  }
  
  salir(){
    this.router.navigate(['/component/maestros-alumno']);
  }
}
