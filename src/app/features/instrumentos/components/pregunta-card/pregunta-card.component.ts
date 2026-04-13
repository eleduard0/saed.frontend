import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { DragDropModule } from '@angular/cdk/drag-drop'

import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatSelectModule } from '@angular/material/select'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatTooltipModule } from '@angular/material/tooltip'

import { Pregunta } from '../../models/pregunta.model'
import { Opcion } from '../../models/opcion.model'
import { TipoPregunta, TIPO_PREGUNTA_OPTIONS } from '../../models/enums'
import { TempIdService } from '../../../../core/services/temp-id.service'

@Component({
  selector: 'app-pregunta-card',
  standalone: true,
  imports: [
    FormsModule,
    DragDropModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './pregunta-card.component.html',
  styleUrl:    './pregunta-card.component.scss'
})
export class PreguntaCardComponent implements OnInit {

  @Input() pregunta!: Pregunta
  @Output() eliminar = new EventEmitter<void>()

  // Exponer enums y opciones al template
  TipoPregunta = TipoPregunta
  tipoPreguntaOptions = TIPO_PREGUNTA_OPTIONS

  constructor(private tempId: TempIdService) {}

  ngOnInit(): void {
    // Asegurar arreglo de opciones para el template.
    if (!this.pregunta.opciones) {
      this.pregunta.opciones = []
    }
  }

  /** Llamado cuando el usuario cambia el tipo de pregunta */
  onTipoCambiado(): void {
    if (this.pregunta.tipo === TipoPregunta.Abierta) {
      // Limpiar opciones al cambiar a Abierta para no enviar basura al backend
      this.pregunta.opciones = []
    }
  }

  // Agregar opcion con id temporal y valor consecutivo.
  agregarOpcion(): void {
    const nueva: Opcion = {
      _tempId: this.tempId.generate(),
      texto:   'Nueva opción',
valor: this.pregunta.opciones.length > 0
  ? Math.max(...this.pregunta.opciones.map(o => o.valor)) + 1
  : 1
    }
    this.pregunta.opciones.push(nueva)
  }

  // Eliminar opcion y reenumerar valores.
  eliminarOpcion(index: number): void {
    this.pregunta.opciones.splice(index, 1)
    // Re-numerar valores
    this.pregunta.opciones.forEach((op, i) => (op.valor = i + 1))
  }

  // trackBy para estabilidad del DOM.
  trackOpcion(_index: number, op: Opcion): string {
    return op._tempId ?? String(op.id ?? _index)
  }
}
