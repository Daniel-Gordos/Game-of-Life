import { IconButton, makeStyles } from "@material-ui/core";
import { FC } from "react";

const useStyles = makeStyles(theme => ({
  cell: {
    borderRadius: "25%",
    opacity: 0.4,
    transition: 'all 0.3s ease-in-out',
    width: "2rem",
    height: "2rem",
    backgroundColor: theme.palette.grey[700],
    "&:hover": {}
  },
  cellActive: {
    borderRadius: "100%",
    opacity: 1,
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
  return (
    <IconButton
      className={`${classes.cell} ${active && classes.cellActive}`}
      onClick={onClick}
    />
  )
}
export default Cell