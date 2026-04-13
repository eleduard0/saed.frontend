import { Pregunta } from './pregunta.model'

export interface Categoria {
  id?: number
  /** ID temporal para trackBy antes de persistir en BD */
  _tempId?: string
  titulo: string
  orden: number
  preguntas: Pregunta[]
}