import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from 'src/app/shared/sidebar/sidebar.component'; // ajusta ruta
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-full',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent],
  template: `
    <div class="layout-wrapper" [class.layout-alumno]="esAlumno">

      <!-- Sidebar solo para Admin -->
      <app-sidebar *ngIf="!esAlumno"></app-sidebar>

      <!-- Contenido principal -->
      <main class="layout-content" [class.content-sin-sidebar]="esAlumno">
        <router-outlet></router-outlet>
      </main>

    </div>
  `,
  styles: [`
    .layout-wrapper {
      display: flex;
      min-height: 100vh;
      background: #e6f6f3;
    }

    .layout-content {
      flex: 1;
      margin-left: 240px;   /* ancho del sidebar */
      min-height: 100vh;
      background: #f8fffe;
    }

    /* Alumno: sin sidebar, ocupa todo el ancho */
    .content-sin-sidebar {
      margin-left: 0;
      background: #e6f6f3;
    }
  `]
})
export class FullComponent implements OnInit {

  esAlumno = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const sesion = this.authService.getSesion();
    this.esAlumno = sesion?.rol === 'Alumno';
  }
}