import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ProcesoService } from 'src/app/core/services/proceso.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  standalone: true,
  imports: [CommonModule, RouterModule],
})
export class DashboardComponent implements OnInit {

  procesoActivo: any = null;
  loading = false;

  constructor(private procesoService: ProcesoService) {}

  ngOnInit(): void {
    this.getActivo();
  }

  getActivo(): void {
    this.loading = true;
    this.procesoService.getActivo().subscribe({
      next:  (res) => { this.procesoActivo = res; this.loading = false; },
      error: ()    => { this.procesoActivo = null; this.loading = false; },
    });
  }

  cerrarProceso(id: number): void {
    if (!confirm('¿Cerrar el proceso activo?')) return;
    this.procesoService.cerrar(id).subscribe(() => this.getActivo());
  }

  periodoLabel(periodo: number): string {
    const labels: Record<number, string> = {
      1: 'Septiembre - Diciembre',
      2: 'Enero - Abril',
      3: 'Mayo - Agosto',
    };
    return labels[periodo] ?? String(periodo);
  }
}