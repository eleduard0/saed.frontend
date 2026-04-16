import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';

interface ProcesoDto       { id: number; nombre: string; anio: number; periodo: number; activo: boolean; }
interface ResumenMaestroDto { idMaestro: string; nombreMaestro: string; totalEvaluaciones: number; }
interface ReportePreguntaDto {
  preguntaId: number;
  textoPregunta: string;
  promedio: number;
  distribucion: Record<string, number>;
}
interface ReporteMaestroDto {
  idMaestro: string;
  nombreMaestro: string;
  procesoId: number;
  nombreProceso: string;
  totalEvaluaciones: number;
  preguntas: ReportePreguntaDto[];
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

  procesos:  ProcesoDto[]        = [];
  maestros:  ResumenMaestroDto[] = [];
  reporte:   ReporteMaestroDto | null = null;

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
    this.cargarMaestros(this.procesoSeleccionado);
  }

  cargarMaestros(procesoId: number): void {
    this.loadingMaestros = true;
    this.api.get<ResumenMaestroDto[]>(`/evaluaciones/procesos/${procesoId}/maestros`).subscribe({
      next:  (res) => { this.maestros = res; this.loadingMaestros = false; },
      error: ()    => { this.errorMsg = 'Error al cargar maestros.'; this.loadingMaestros = false; }
    });
  }

  verReporte(idMaestro: string): void {
    if (!this.procesoSeleccionado) return;
    this.loadingReporte = true;
    this.reporte        = null;

    this.api.get<ReporteMaestroDto>(
      `/evaluaciones/procesos/${this.procesoSeleccionado}/maestros/${idMaestro}/reporte`
    ).subscribe({
      next:  (res) => { this.reporte = res; this.loadingReporte = false; },
      error: ()    => { this.errorMsg = 'Error al cargar el reporte.'; this.loadingReporte = false; }
    });
  }

  cerrarReporte(): void {
    this.reporte = null;
  }

  get promedioGeneral(): number {
    if (!this.reporte || this.reporte.preguntas.length === 0) return 0;
    const total = this.reporte.preguntas.reduce((s, p) => s + p.promedio, 0);
    return Math.round((total / this.reporte.preguntas.length) * 100) / 100;
  }

  get colorPromedio(): string {
    const p = this.promedioGeneral;
    if (p >= 8)  return '#01907e';
    if (p >= 6)  return '#f59e0b';
    return '#e11d48';
  }

  distribucionEntries(dist: Record<string, number>): { key: string; value: number }[] {
    return Object.entries(dist).map(([key, value]) => ({ key, value }));
  }

  periodoLabel(p: number): string {
    return { 1: 'Sep-Dic', 2: 'Ene-Abr', 3: 'May-Ago' }[p] ?? String(p);
  }

  async exportarPdf(): Promise<void> {
    if (!this.reporte) return;
    this.generandoPdf = true;

    // Importar jsPDF dinámicamente para no agregar peso al bundle principal
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const margen = 15;
    let y = margen;

    // ── Encabezado ──────────────────────────────────────────────────────────
    doc.setFillColor(1, 144, 126);
    doc.rect(0, 0, 210, 28, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('REPORTE DE EVALUACIÓN DOCENTE', 105, 12, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Universidad Tecnológica del Sur de Sonora', 105, 20, { align: 'center' });
    y = 35;

    // ── Datos del maestro ───────────────────────────────────────────────────
    doc.setTextColor(31, 45, 41);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(this.reporte.nombreMaestro, margen, y);
    y += 7;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(69, 83, 79);
    doc.text(`Proceso: ${this.reporte.nombreProceso}`, margen, y);
    doc.text(`Total evaluaciones: ${this.reporte.totalEvaluaciones}`, 130, y);
    y += 5;
    doc.text(`ID Maestro: ${this.reporte.idMaestro}`, margen, y);
    y += 6;

    // ── Promedio general ────────────────────────────────────────────────────
    const pg = this.promedioGeneral;
    const colorR = pg >= 8 ? 1   : pg >= 6 ? 245 : 225;
    const colorG = pg >= 8 ? 144 : pg >= 6 ? 158 :  29;
    const colorB = pg >= 8 ? 126 : pg >= 6 ?  11 :  72;

    doc.setFillColor(colorR, colorG, colorB as number);
    doc.roundedRect(margen, y, 60, 14, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Promedio general: ${pg.toFixed(2)}`, margen + 30, y + 9, { align: 'center' });
    y += 20;

    // ── Tabla de resultados por pregunta ────────────────────────────────────
    doc.setTextColor(31, 45, 41);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Resultados por pregunta', margen, y);
    y += 4;

    const rows = this.reporte.preguntas.map((p, i) => [
      `${i + 1}`,
      p.textoPregunta,
      p.promedio.toFixed(2),
      Object.entries(p.distribucion)
        .map(([k, v]) => `${k}: ${v}`)
        .join(' | ')
    ]);

    autoTable(doc, {
      startY: y,
      head: [['#', 'Pregunta', 'Promedio', 'Distribución']],
      body: rows,
      margin: { left: margen, right: margen },
      styles: { fontSize: 8, cellPadding: 2.5 },
      headStyles: { fillColor: [1, 144, 126], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [230, 246, 243] },
      columnStyles: {
        0: { cellWidth: 8, halign: 'center' },
        1: { cellWidth: 85 },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 57 }
      }
    });

    y = (doc as any).lastAutoTable.finalY + 10;

    // ── Comentarios ─────────────────────────────────────────────────────────
    if (this.reporte.comentarios.length > 0) {
      if (y > 240) { doc.addPage(); y = margen; }

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(31, 45, 41);
      doc.text('Comentarios de alumnos', margen, y);
      y += 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(69, 83, 79);

      this.reporte.comentarios.forEach((comentario, idx) => {
        if (y > 270) { doc.addPage(); y = margen; }
        const lineas = doc.splitTextToSize(`${idx + 1}. ${comentario}`, 180);
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

    doc.save(`reporte_${this.reporte.idMaestro}_${this.reporte.procesoId}.pdf`);
    this.generandoPdf = false;
  }
}