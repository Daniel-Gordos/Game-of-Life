import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import GolGrid from "./grid/grid";
import { copyBoard, newBoard, useToggle, useStorage, useStateHistory } from '../misc/utils';
import { useInterval } from 'react-use';
import { Board, Pattern, ModalState, GridSizeContext } from '../types';
import { defaultGridSize, historySize, tickIntervalMs, defaultGridScale, defaultRandomize, defaultWrapEdges } from '../misc/constants';
import SavingModal from "./modals/savingModal";
import LoadingModal from "./modals/loadingModal";
import SettingsModal from './modals/settingsModal';
import { makeStyles } from "@material-ui/core";
import Undo from "@material-ui/icons/Undo";
import Navbar from "./interface/navbar";
import Sidebar from "./interface/sidebar";
import FloatingActions from "./interface/floatingActions";
import FloatingBoardActions from "./interface/floatingBoardActions";

const useStyles = makeStyles(theme => ({
  gridContainer: {
    overflow: 'auto',
    padding: theme.spacing(1),
  }
}))

function nextCellState(alive:boolean, n:number) {
  if (alive)
    return (n === 2 || n === 3)
  return n === 3
}

function countNeighboursWrap(cells:Board, gridSize:number, i:number, j:number) {

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

function countNeighboursNoWrap(cells:Board, gridSize:number, i:number, j:number) {

  const above = (i > 0)
  const below = (i < gridSize - 1)
  const left = (j > 0)
  const right = (j < gridSize - 1)

  const cols:number[] = []
  if (left) cols.push(j-1)
  cols.push(j)
  if (right) cols.push(j+1)
  
  let count = 0;

  if (above)
    cols.forEach(x => {if (cells[i-1][x]) count++})
  if (below)
    cols.forEach(x => {if (cells[i+1][x]) count++})
  if (left)
    if (cells[i][j-1]) count++
  if (right)
    if (cells[i][j+1]) count++

  return count
}

export const SizeContext = createContext({} as GridSizeContext)

function Main() {
  const classes = useStyles()

  // Settings
  const [gridSize, setGridSize] = useStorage('golSize', defaultGridSize, localStorage)
  const [gridScale, setGridScale] = useStorage('golScale', defaultGridScale, localStorage)
  const [randomizeChance, setRandomizeChance] = useStorage('golRandomizeChance', defaultRandomize, localStorage)
  const [wrapEdges, setWrapEdges] = useStorage('golWrapEdges', defaultWrapEdges, localStorage)

  // Game state
  const [playing, togglePlaying] = useToggle(false)
  const [patterns, setPatterns] = useStorage<Pattern[]>('golSaved', [], localStorage)
  const [modalState, setModalState] = useState(ModalState.none)
  const [cells, setCells, cellActions] = useStateHistory(
    () => newBoard(gridSize), 
    historySize
  )

  // Stop if no cells alive
  const anyActive = useMemo(() => cells.some(row => row.some(x => x)), [cells])
  useEffect(() => {
    if (!anyActive)
      togglePlaying(false)
  }, [anyActive])

  // Stop if no change from previous step
  useEffect(() => {
    if (!playing || cellActions.position === 0)
      return
    const prevCells = cellActions.history[cellActions.position -1]
    for (let i = 0; i < gridSize; i++)
      for (let j = 0; j < gridSize; j++)
        if (cells[i][j] !== prevCells[i][j])
          return
    togglePlaying(false)
  }, [cells])

  // Stop if modal opened
  useEffect(() => {
    if (modalState !== ModalState.none)
      togglePlaying(false)
  }, [modalState])

  const countNeighbours = useMemo(() => {
    if (wrapEdges)
      return countNeighboursWrap
    else
      return countNeighboursNoWrap
  }, [wrapEdges])

  const toggleModal = (state:ModalState) =>
    setModalState(s => (s === state) ? ModalState.none : state)

  const resetAll = () => {
    cellActions.reset(() => newBoard(gridSize))
    togglePlaying(false)
    setModalState(ModalState.none)
  }

  const changeGridSize = (size:number) => {
    resetAll()
    setGridSize(size)
    cellActions.reset(() => newBoard(size))
  }

  const loadState = (newState:Board, size:number) => {
    resetAll()
    setGridSize(size)
    cellActions.reset(newState)
  }

  const clickCell = (i:number, j:number) =>
    setCells(cells => {
      const newCells = copyBoard(cells)
      newCells[i][j] = !newCells[i][j]
      return newCells
    })

  const clear = () => {
    togglePlaying(false)
    setCells(newBoard(gridSize))
  }


  const tick = () =>
    setCells(cells =>
      cells.map((row, i) =>
        row.map((cell, j) => nextCellState(cell, countNeighbours(cells, gridSize, i, j))
    )))
  
  const randomize = () =>
  setCells(cells =>
    cells.map((row, i) =>
      row.map((cell, j) => Boolean(Math.random() < randomizeChance)
  )))

    useInterval(tick, (playing) ? tickIntervalMs : null)

  return (
    <SizeContext.Provider value={[gridSize, changeGridSize]}>

      <Navbar
        handleToggleSidebar={() => toggleModal(ModalState.sidebar)}
        handleClear={clear}
        canClear={!playing && anyActive}
      />

      <Sidebar
        open={modalState === ModalState.sidebar}
        onOpen={() => toggleModal(ModalState.sidebar)}
        onClose={() => toggleModal(ModalState.sidebar)}
        handlers={{
          onClickInfo: () => null,
          onClickSave: () => toggleModal(ModalState.save),
          onClickLoad: () => toggleModal(ModalState.load),
          onClickSettings: () => toggleModal(ModalState.settings),
        }}
      />

      <div className={classes.gridContainer}>
        <GolGrid
          cells={cells}
          toggleCell={clickCell}
          scale={gridScale}
        />
      </div>
      
      <FloatingActions
        handlers={{
          togglePlay: () => togglePlaying(),
          step: tick,
          undo: cellActions.back,
          redo: cellActions.forward
        }}
        state={{
          playing: playing,
          canUndo: cellActions.canGoBack,
          canRedo: cellActions.canGoForward
        }}
      />

      <FloatingBoardActions
        playing={playing}
        handleRandomize={randomize}
      />

      <SavingModal
        open={modalState === ModalState.save}
        onClose={() => toggleModal(ModalState.save)}
        cellState={cells}
        setPatterns={setPatterns}
      />
      <LoadingModal
        open={modalState === ModalState.load}
        onClose={() => toggleModal(ModalState.load)}
        onLoad={loadState}
        patterns={patterns}
        setPatterns={setPatterns}
      />
      <SettingsModal
        open={modalState === ModalState.settings}
        onClose={() => setModalState(ModalState.none)}
        handleGridSize={changeGridSize}
        gridScale={[gridScale, setGridScale]}
        randomizeChance={randomizeChance}
        handleRandomizeChance={(val:number) => setRandomizeChance(val)}
        wrapEdges={wrapEdges}
        handleWrapEdges={(val:boolean) => setWrapEdges(val)}
      />
    </SizeContext.Provider>
  )
}
export default Main