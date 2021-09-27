
export const gridSize = 10

export type Board = boolean[][]
export type CellList = number[][]

export interface Pattern {
  name: string,
  created: number
  cells: CellList
}

export interface Ordering<T> {
  text: string
  sorter: (a:T, b:T) => number
}

export enum ModalState {
  none,
  save,
  load
}