import { Fab, IconButton, makeStyles, Tooltip } from "@material-ui/core"
import { FC, ReactElement } from "react"

const useStyles = makeStyles(theme => ({
  button: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.primary.light,
    pointerEvents: 'auto',
  }
}))

interface ButtonProps {
  size: "small" | "medium" | "large"
  text: string
  onClick: () => void
  active: boolean
  children: ReactElement
}

const ActionButton:FC<ButtonProps> = ({ children, text, onClick, size, active }) => {
  const classes = useStyles()
  return (
    <Tooltip arrow title={text} placement="top">
      <Fab
        size={size}
        onClick={onClick}
        disabled={!active}
        className={classes.button}
      >
        <IconButton size="medium">
          {children}
        </IconButton>
      </Fab>
    </Tooltip>
  )
}
export default ActionButton