import { IconButton, makeStyles } from "@material-ui/core";
import { FC } from "react";

const useStyles = makeStyles(theme => ({
  cell: {
    borderRadius: "15%",
    width: "2rem",
    height: "2rem",
    backgroundColor: theme.palette.grey[700],
    "&:hover": {}
  },
  cellActive: {
    borderRadius: "15%",
    width: "2rem",
    height: "2rem",
    backgroundColor: theme.palette.success.light,
    "&:hover": {
      backgroundColor: theme.palette.primary.light
    }
  }
}))

interface CellProps {
  active?: boolean,
  onClick: () => void
}

const Cell:FC<CellProps> = ({ active, onClick }) => {
  const classes = useStyles()
  return <IconButton
    className={active ? classes.cellActive : classes.cell}
    onClick={onClick}
    >
  </IconButton>
}
export default Cell