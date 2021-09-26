
export const gridSize = 10

export type Board = boolean[][]
export type CellList = number[][]

export interface Pattern {
  name: string,
  created: number
  cells: CellList
}
