import { useEffect, useMemo } from "react";
import GolGrid from "./grid";
import { LoadingModal, SavingModal } from "./modals";
import { copyBoard, newBoard, useToggle, useStorage, useStateHistory } from '../utils';
import { useInterval } from 'react-use';
import TopBar from './topBar';
import BottomBar from './bottomBar';
import { Board, gridSize, Pattern } from "../types";

const historySize = 50
const tickIntervalMs = 250

function nextCellState(alive:boolean, n:number) {
  if (alive)
    return (n === 2 || n === 3)
  return n === 3
}

function countNeighbours(cells:Board, i:number, j:number) {

  const above = (i > 0) ? i - 1 : gridSize - 1
  const below = (i < gridSize - 1) ? i + 1 : 0
  const left = (j > 0) ? j - 1 : gridSize - 1
  const right = (j < gridSize - 1) ? j + 1 : 0

  let count = 0;
  const cols = [left, j, right]

  cols.forEach(x => {if (cells[above][x]) count++})
  cols.forEach(x => {if (cells[below][x]) count++})
  if (cells[i][left]) count++
  if (cells[i][right]) count++

  return count
}

function Main() {

  const [playing, togglePlaying] = useToggle(false)
  const [patterns, setPatterns] = useStorage<Pattern[]>('golSaved', [], "local")

  const [savingOpen, toggleSaving] = useToggle(false)
  const [loadingOpen, toggleLoading] = useToggle(false)

  const [cells, setCells, cellActions] = useStateHistory<Board>(newBoard, historySize)

  const anyActive = useMemo(() => cells.some(row => row.some(x => x)), [cells])

  useEffect(() => {
    if (!anyActive)
      togglePlaying(false)
  }, [anyActive])

  const resetAll = () => {
    cellActions.reset(newBoard)
    togglePlaying(false)
    toggleSaving(false)
    toggleLoading(false)
  }

  useEffect(() => {
    if (savingOpen || loadingOpen)
      togglePlaying(false)
  }, [savingOpen, loadingOpen])

  const clickCell = (i:number, j:number) => {
    setCells(prevCells => {
      const newCells = copyBoard(prevCells)
      newCells[i][j] = !newCells[i][j]
      return newCells
    })
  }

  const redo = () => cellActions.forward()
  const undo = () => cellActions.back()

  const clear = () => {
    togglePlaying(false)
    setCells(newBoard())
  }

  const tick = () =>
    setCells(cells =>
      cells.map((row, i) =>
        row.map((cell, j) => nextCellState(cell, countNeighbours(cells, i, j))
    )))

  const loadState = (newState:Board) => {
    resetAll()
    cellActions.reset(newState)
  }

  useInterval(tick, (playing) ? tickIntervalMs : null)

  return (
    <>
      <TopBar
        handlers={{
          handleUndo: undo,
          handleRedo: redo,
          handleSaving: toggleSaving,
          handleLoading: toggleLoading,
          handleClear: clear
        }}
        actions={cellActions}
        state={{ playing, anyActive }}
      />

      <GolGrid
        cells={cells}
        toggleCell={clickCell}
      />

      <BottomBar
        handleTick={tick}
        handleTogglePlaying={() => togglePlaying()}
        playing={playing}
      />

      <SavingModal
        open={savingOpen}
        onClose={() => toggleSaving()}
        cellState={cells}
        setPatterns={setPatterns}
      />
      <LoadingModal
        open={loadingOpen}
        onClose={() => toggleLoading()}
        onLoad={loadState}
        patterns={patterns}
        setPatterns={setPatterns}
      />

    </>
  )
}
export default Main