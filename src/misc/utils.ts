import { useState, useEffect, Dispatch, useRef } from 'react'
import { Board } from '../types'

export interface CircularBuffer<T> {
  push: (val: T) => void
  pop: () => T
  clear: () => void
  isEmpty: boolean
  isFull: boolean
}

export const copyArray = <T>(arr: T[]) => arr.map(x => x)

export const newBoard = (gridSize: number): Board =>
  new Array(gridSize).fill(null).map(() => new Array(gridSize).fill(false))

export const copyBoard = (b: Board): Board => b.map(row => copyArray(row))

export const useStorage = <T>(
  name: string,
  initial: T | (() => T),
  store: Storage
): [T, Dispatch<React.SetStateAction<T>>] => {
  const [state, setState] = useState<T>(() => {
    const stored = store.getItem(name)
    if (stored) return JSON.parse(stored)?.val
    // @ts-ignore
    return typeof initial === 'function' ? initial() : initial
  })

  // Save on update
  useEffect(() => {
    store.setItem(name, JSON.stringify({ val: state }))
  }, [state])

  return [state, setState]
}

export const useToggle = (
  initial: boolean | (() => boolean)
): [boolean, (val?: boolean) => void] => {
  const [state, setState] = useState(initial)
  const toggle = (val?: boolean) => {
    if (val === undefined) setState(cur => !cur)
    else setState(val)
  }
  return [state, toggle]
}

export const useCircularBuffer = <T>(size: number): CircularBuffer<T> => {
  const [buf, setBuf] = useState<T[]>([])
  const [head, setHead] = useState(0)
  const [n, setN] = useState(0)

  const push = (val: T) => {
    setBuf(buf => {
      const newBuf = [...buf]
      newBuf[head] = val
      return newBuf
    })
    setHead(head => (head + 1) % size)
    setN(n => (n >= size ? n : n + 1))
  }

  const pop = () => {
    setHead(head => (head - 1 + size) % size)
    setN(n => n - 1)
    return buf[head]
  }

  const clear = () => {
    setBuf([])
    setHead(0)
    setN(0)
  }

  const isEmpty = n === 0
  const isFull = n === size
  return { push, pop, clear, isEmpty, isFull }
}

type HistorySetter<S> = S | ((prevState: S) => S)

export interface HistoryState<S> {
  history: S[]
  position: number
  capacity: number
  back: () => void
  forward: () => void
  canGoBack: boolean
  canGoForward: boolean
  reset: (val: S | (() => S)) => void
}

type HistoryReturn<S> = [S, (val: HistorySetter<S>) => void, HistoryState<S>]

export const useStateHistory = <S>(
  initial: S | (() => S),
  capacity: number
): HistoryReturn<S> => {
  const pos = useRef(0)
  const [state, setInnerState] = useState(initial)
  const histArray = useRef<S[]>([state])

  const setState = (val: HistorySetter<S>) => {
    // @ts-ignore
    const newVal: S = typeof val === 'function' ? val(state) : val

    if (histArray.current[pos.current] !== newVal) {
      histArray.current.splice(pos.current + 1)
      histArray.current.push(newVal)

      if (histArray.current.length > capacity) {
        histArray.current.shift()
      }
      pos.current = histArray.current.length - 1
    }

    setInnerState(newVal)
  }

  const canGoBack = pos.current > 0 && capacity > 1
  const canGoForward = pos.current < histArray.current.length - 1

  const back = () => {
    if (!canGoBack) return

    pos.current--
    setInnerState(histArray.current[pos.current])
  }

  const forward = () => {
    if (!canGoForward) return
    pos.current++
    setInnerState(histArray.current[pos.current])
  }

  const reset = (val: S | (() => S)) => {
    // @ts-ignore
    const newVal: S = typeof val === 'function' ? val(state) : val
    histArray.current = [newVal]
    pos.current = 0
    setInnerState(newVal)
  }

  const position = pos.current
  const history = histArray.current
  const actions = {
    position,
    back,
    forward,
    canGoBack,
    canGoForward,
    capacity,
    history,
    reset
  }
  return [state, setState, actions]
}
