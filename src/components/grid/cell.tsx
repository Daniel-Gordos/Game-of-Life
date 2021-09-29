import { IconButton, makeStyles, Theme } from "@material-ui/core";
import { FC } from "react";

interface CellStyle {
  scale: number
}

const useStyles = makeStyles<Theme, CellStyle>(theme => ({
  cell: {
    borderRadius: "25%",
    opacity: 0.4,
    transition: 'all 0.3s ease-in-out',
    width: props => `${2 * props.scale}rem`,
    height: props => `${2 * props.scale}rem`,
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
  active?: boolean
  onClick: () => void
  scale: number
}

const Cell:FC<CellProps> = ({ active, onClick, scale }) => {
  const classes =  useStyles({ scale })
  return (
    <IconButton
      className={`${classes.cell} ${active && classes.cellActive}`}
      onClick={onClick}
    />
  )
}
export default Cell