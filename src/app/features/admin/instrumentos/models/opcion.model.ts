export interface Opcion {
  id?: number
  /** ID temporal para trackBy antes de persistir en BD */
  _tempId?: string
  texto: string
  valor: number
}