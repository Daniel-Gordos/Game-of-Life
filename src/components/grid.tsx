import { Card, makeStyles } from "@material-ui/core"
import { FC } from "react"
import Cell from "./cell"


const useStyles = makeStyles(theme => ({
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(10, 1fr)",
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
  return (
    <Card className={classes.grid}>
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