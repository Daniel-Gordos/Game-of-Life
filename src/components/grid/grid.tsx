import { Card, makeStyles, Theme } from "@material-ui/core"
import { FC, useContext, useMemo } from "react"
import Cell from "./cell"
import { SizeContext } from "../main"

interface GridStyle {
  scale: number
  gridSize: number
}

const useStyles = makeStyles<Theme, GridStyle>(theme => ({
  grid: {
    display: "grid",
    gridTemplateColumns: props => `repeat(${props.gridSize}, 1fr)`,
    gap: props => theme.spacing(0.5 * props.scale),
    padding: props => theme.spacing(1 * props.scale),
    width: "fit-content",
    margin: "auto",
  }
}))

interface GridProps {
  cells: boolean[][],
  toggleCell: (i:number, j:number) => void
  scale: number
}

const GolGrid:FC<GridProps> = ({ cells, toggleCell, scale }) => {
  const [gridSize] = useContext(SizeContext)
  const styleProps = { scale, gridSize }
  const classes = useStyles(styleProps)
  return (
    <Card className={classes.grid}>
      {cells.map((row, i) =>
        row.map((cell, j) =>
          <Cell
            key={`${i},${j}`}
            active={cell}
            onClick={() => toggleCell(i, j)}
            scale={scale}
          />
      ))}
    </Card>
  )
}
export default GolGrid