import { Card, makeStyles } from "@material-ui/core"
import { FC, useContext, useMemo } from "react"
import Cell from "./cell"
import { SizeContext } from "../main"

const useStyles = makeStyles(theme => ({
  grid: {
    display: "grid",
    gap: theme.spacing(0.5),
    padding: theme.spacing(1),
    width: "fit-content",
    margin: "auto"
  }
}))

interface GridProps {
  cells: boolean[][],
  toggleCell: (i:number, j:number) => void
}

const GolGrid:FC<GridProps> = ({ cells, toggleCell }) => {
  const classes = useStyles()
  const [gridSize] = useContext(SizeContext)
  const gridTemplateColumns = useMemo(() => `repeat(${gridSize}, 1fr)`, [gridSize])
  return (
    <Card className={classes.grid} style={{ gridTemplateColumns }}>
      {cells.map((row, i) =>
        row.map((cell, j) =>
          <Cell
            key={`${i},${j}`}
            active={cell}
            onClick={() => toggleCell(i, j)}
          />
      ))}
    </Card>
  )
}
export default GolGrid