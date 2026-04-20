import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';

interface ProcesoDto         { id: number; nombre: string; anio: number; periodo: number; activo: boolean; }
interface ResumenCalificacion { idMaestro: string; nombreMaestro: string; totalEvaluaciones: number; calificacionGlobal: number; }
interface CalificacionPregunta {
  preguntaId: number;
  textoPregunta: string;
  promedio: number;
  totalRespuestas: number;
  distribucion: Record<string, number>;
}
interface CalificacionMaestro {
  idMaestro: string;
  nombreMaestro: string;
  procesoId: number;
  totalEvaluaciones: number;
  calificacionGlobal: number;
  porPregunta: CalificacionPregunta[];
  comentarios: string[];
}

@Component({
  selector: 'app-maestros-proceso',
  standalone: true,
  templateUrl: './maestros-proceso.component.html',
  styleUrl: './maestros-proceso.component.scss',
  imports: [CommonModule, FormsModule],
})
export class MaestrosProcesoComponent implements OnInit {

  procesos:  ProcesoDto[]          = [];
  maestros:  ResumenCalificacion[] = [];
  reporte:   CalificacionMaestro | null = null;
  nombreProceso = '';

  procesoSeleccionado: number | null = null;
  loading         = false;
  loadingMaestros = false;
  loadingReporte  = false;
  errorMsg        = '';
  generandoPdf    = false;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.cargarProcesos();
  }

  cargarProcesos(): void {
    this.loading = true;
    this.api.get<ProcesoDto[]>('/procesos').subscribe({
      next:  (res) => { this.procesos = res; this.loading = false; },
      error: ()    => { this.errorMsg = 'No se pudieron cargar los procesos.'; this.loading = false; }
    });
  }

  onProcesoChange(): void {
    this.maestros = [];
    this.reporte  = null;
    if (!this.procesoSeleccionado) return;
    const p = this.procesos.find(x => x.id === this.procesoSeleccionado);
    this.nombreProceso = p ? `${p.nombre} · ${this.periodoLabel(p.periodo)} ${p.anio}` : '';
    this.cargarMaestros(this.procesoSeleccionado);
  }

  cargarMaestros(procesoId: number): void {
    this.loadingMaestros = true;
    // Usar el endpoint de calificaciones que ya incluye la calificación global
    this.api.get<ResumenCalificacion[]>(`/calificaciones/procesos/${procesoId}`).subscribe({
      next:  (res) => { this.maestros = res; this.loadingMaestros = false; },
      error: ()    => { this.errorMsg = 'Error al cargar maestros.'; this.loadingMaestros = false; }
    });
  }

  verReporte(idMaestro: string): void {
    if (!this.procesoSeleccionado) return;
    this.loadingReporte = true;
    this.reporte = null;

    this.api.get<CalificacionMaestro>(
      `/calificaciones/procesos/${this.procesoSeleccionado}/maestros/${idMaestro}`
    ).subscribe({
      next:  (res) => { this.reporte = res; this.loadingReporte = false; },
      error: ()    => { this.errorMsg = 'Error al cargar el reporte.'; this.loadingReporte = false; }
    });
  }

  cerrarReporte(): void { this.reporte = null; }

  get colorCalificacion(): string { return this.getColor(this.reporte?.calificacionGlobal ?? 0); }

  getColor(val: number): string {
    if (val >= 4)   return '#01907e';
    if (val >= 3)   return '#f59e0b';
    return '#e11d48';
  }

  // Calificación en escala 0-10 para mostrar al usuario (valor máximo = 5 en escala 1-5)
  get calificacionEscala10(): number {
    return Math.round(((this.reporte?.calificacionGlobal ?? 0) / 5) * 10 * 100) / 100;
  }

  calificacionPreguntaEscala10(promedio: number): number {
    return Math.round((promedio / 5) * 10 * 100) / 100;
  }

  distribucionEntries(dist: Record<string, number>): { key: string; value: number }[] {
    return Object.entries(dist).map(([key, value]) => ({ key, value }));
  }

  periodoLabel(p: number): string {
    return ({ 1: 'Sep-Dic', 2: 'Ene-Abr', 3: 'May-Ago' } as any)[p] ?? String(p);
  }

  async exportarPdf(): Promise<void> {
    if (!this.reporte) return;
    this.generandoPdf = true;

    const { default: jsPDF }     = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc    = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const margen = 15;
    let y        = margen;

    // ── Encabezado ─────────────────────────────────────────────────────────
    doc.setFillColor(1, 144, 126);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('REPORTE DE EVALUACIÓN DOCENTE', 105, 13, { align: 'center' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Universidad Tecnológica del Sur de Sonora', 105, 21, { align: 'center' });
    doc.text(this.nombreProceso, 105, 27, { align: 'center' });
    y = 38;

    // ── Datos del maestro ───────────────────────────────────────────────────
    doc.setTextColor(31, 45, 41);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(this.reporte.nombreMaestro, margen, y);
    y += 7;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(69, 83, 79);
    doc.text(`ID: ${this.reporte.idMaestro}`, margen, y);
    doc.text(`Evaluaciones recibidas: ${this.reporte.totalEvaluaciones}`, 110, y);
    y += 8;

    // ── Calificación global ─────────────────────────────────────────────────
    const calGlobal   = this.reporte.calificacionGlobal;
    const calEscala10 = this.calificacionEscala10;
    const [r, g, b]   = calGlobal >= 4 ? [1, 144, 126] : calGlobal >= 3 ? [245, 158, 11] : [225, 29, 72];

    doc.setFillColor(r, g, b);
    doc.roundedRect(margen, y, 80, 16, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(
      `Calificación: ${calEscala10.toFixed(2)} / 10  (${calGlobal.toFixed(2)} / 5)`,
      margen + 40, y + 10, { align: 'center' }
    );
    y += 22;

    // ── Tabla de resultados por pregunta ────────────────────────────────────
    doc.setTextColor(31, 45, 41);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Resultados por pregunta', margen, y);
    y += 4;

    const rows = this.reporte.porPregunta.map((p, i) => [
      `${i + 1}`,
      p.textoPregunta,
      p.promedio.toFixed(2),
      `${this.calificacionPreguntaEscala10(p.promedio).toFixed(2)}/10`,
      Object.entries(p.distribucion).map(([k, v]) => `${k}:${v}`).join(' | ')
    ]);

    autoTable(doc, {
      startY: y,
      head:   [['#', 'Pregunta', 'Prom.(1-5)', 'Equiv.(10)', 'Distribución']],
      body:   rows,
      margin: { left: margen, right: margen },
      styles: { fontSize: 7.5, cellPadding: 2.5 },
      headStyles: { fillColor: [1, 144, 126], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [230, 246, 243] },
      columnStyles: {
        0: { cellWidth: 8,  halign: 'center' },
        1: { cellWidth: 78 },
        2: { cellWidth: 18, halign: 'center' },
        3: { cellWidth: 18, halign: 'center' },
        4: { cellWidth: 58 }
      }
    });

    y = (doc as any).lastAutoTable.finalY + 10;

    // ── Comentarios ─────────────────────────────────────────────────────────
    if (this.reporte.comentarios.length > 0) {
      if (y > 240) { doc.addPage(); y = margen; }

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(31, 45, 41);
      doc.text(`Comentarios de alumnos (${this.reporte.comentarios.length})`, margen, y);
      y += 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(69, 83, 79);

      this.reporte.comentarios.forEach((c, idx) => {
        if (y > 270) { doc.addPage(); y = margen; }
        const lineas = doc.splitTextToSize(`${idx + 1}. ${c}`, 180);
        doc.text(lineas, margen, y);
        y += lineas.length * 4.5 + 2;
      });
    }

    // ── Pie de página ────────────────────────────────────────────────────────
    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setTextColor(150);
      doc.text(
        `Generado el ${new Date().toLocaleDateString('es-MX')} · Página ${i} de ${totalPages}`,
        105, 292, { align: 'center' }
      );
    }

    doc.save(`reporte_${this.reporte.idMaestro}_proceso${this.reporte.procesoId}.pdf`);
    this.generandoPdf = false;
  }
}