
//////////////////////// Grid ////////////////////////

import { Pattern } from "../types"

export const defaultGridSize = 10
export const minGridSize = 4
export const maxGridSize = 30

export const defaultGridScale = 1
export const minGridScale = 0.5
export const maxGridScale = 5

export const defaultRandomize = 0.5
export const minRandomize = 0.05
export const maxRandomize = 0.95

export const defaultWrapEdges = true

/////////////////// Default Patterns //////////////////

export const defaultPatterns:Pattern[] = [
  {
    name: "Glider",
    created: 0,
    state: {
      size: 10,
      cells: [[3,4],[4,5],[5,3],[5,4],[5,5]]
    }
  },
  {
    name: "Blinker",
    created: 0,
    state: {
      size: 6,
      cells: [[2,2],[2,3],[2,4],[3,1],[3,2],[3,3]]
    }
  },
  {
    name: "Spaceship",
    created: 0,
    state: {
      size: 10,
      cells: [[3,4],[3,5],[4,2],[4,3],[4,5],[4,6],[5,2],[5,3],[5,4],[5,5],[6,3],[6,4]]
    }
  },
  {
    name: "Big boi",
    created: 0,
    state: {
      size: 15,
      cells: [[6,8],[6,9],[7,6],[7,11],[8,12],[9,6],[9,12],[10,7],[10,8],[10,9],[10,10],[10,11],[10,12]]
    }
  },
  {
    name: "Tower",
    created: 0,
    state: {
      size: 20,
      cells: [[1,8],[1,9],[1,10],[2,8],[2,9],[2,10],[3,9],[4,9],[5,9],[6,8],[6,10],[9,8],[9,10],[10,9],[11,9],[12,9],[13,8],[13,9],[13,10],[14,8],[14,9],[14,10]]
    }
  },
  {
    name: "Pulsar",
    created: 0,
    state: {
      size: 17,
      cells: [[2,4],[2,5],[2,11],[2,12],[3,5],[3,6],[3,10],[3,11],[4,2],[4,5],[4,7],[4,9],[4,11],[4,14],[5,2],[5,3],[5,4],[5,6],[5,7],[5,9],[5,10],[5,12],[5,13],[5,14],[6,3],[6,5],[6,7],[6,9],[6,11],[6,13],[7,4],[7,5],[7,6],[7,10],[7,11],[7,12],[9,4],[9,5],[9,6],[9,10],[9,11],[9,12],[10,3],[10,5],[10,7],[10,9],[10,11],[10,13],[11,2],[11,3],[11,4],[11,6],[11,7],[11,9],[11,10],[11,12],[11,13],[11,14],[12,2],[12,5],[12,7],[12,9],[12,11],[12,14],[13,5],[13,6],[13,10],[13,11],[14,4],[14,5],[14,11],[14,12]]
    }
  },
]

//////////////////////// Other ///////////////////////

export const historySize = 50

export const tickIntervalMs = 250

export const maxNameLen = 64