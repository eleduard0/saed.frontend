import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { lastValueFrom } from 'rxjs';
import { RespuestasService } from 'src/app/services/respuesta.service';
import { AuthService } from 'src/app/services/auth.service';



interface Maestro {
  nombreMaestro: string;
  materia: string;
  grupo: string;
  respuestasCompletadas: boolean;
}

@Component({
  selector: 'app-maestros-alumno',
  templateUrl: './maestros-alumno.component.html',
  styleUrls: ['./maestros-alumno.component.scss']
})
export class MaestrosAlumnoComponent implements OnInit {
  maestros: Maestro[] = [];
  totalProfesores = 0;
  loading = false;

  constructor(
    private messageService: MessageService,
    private respuestasService: RespuestasService,
    private authservice: AuthService
  ) { }

  async ngOnInit() {
    await this.cargarYVerificarMaestros();
  }

  async cargarYVerificarMaestros() {
    this.loading = true;
    const storedMaestros = localStorage.getItem('maestros');
    const maestrosLocales: Maestro[] = storedMaestros ? JSON.parse(storedMaestros) : [];

    if (maestrosLocales.length === 0) {
      this.maestros = [];
      this.messageService.add({
        severity: 'warn',
        summary: 'Aviso',
        detail: 'No hay maestros disponibles'
      });
      this.loading = false;
      return;
    }

    try {
      const nombreAlumno = this.authservice.user.name;
      const { maestrosBloqueados } = await lastValueFrom(
      this.respuestasService.verificarMaestros(nombreAlumno)
      );

      this.maestros = maestrosLocales.map(maestro => ({
        ...maestro,
        respuestasCompletadas: maestrosBloqueados.some(
          nombre => nombre.toLowerCase() === maestro.nombreMaestro.toLowerCase()
        )
      }));

      if (maestrosBloqueados.length > 0) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Evaluaciones existentes',
          detail: `${maestrosBloqueados.length} maestros ya tienen evaluaciones registradas y no pueden ser editadas`
        });
      }

      this.totalProfesores = this.maestros.length;
    } catch (error) {
      this.cargarSoloLocalStorage();
    } finally {
      this.loading = false;
    }
  }
  
  private cargarSoloLocalStorage() {
    const storedMaestros = localStorage.getItem('maestros');
    this.maestros = storedMaestros ? JSON.parse(storedMaestros) : [];
    this.maestros.forEach(m => m.respuestasCompletadas = false);
    this.totalProfesores = this.maestros.length;
  }

}