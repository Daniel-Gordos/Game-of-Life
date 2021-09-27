
export type Board = boolean[][]
export type CellList = number[][]

export interface SavedState {
  cells: CellList,
  size: number
}

export interface Pattern {
  name: string,
  created: number
  state: SavedState
}

export interface Ordering<T> {
  text: string
  sorter: (a:T, b:T) => number
}

export enum ModalState {
  none,
  save,
  load,
  settings
}

export type GridSizeContext = [
  number,
  (size: number) => void
]