import { makeStyles } from "@material-ui/core";
import LoopIcon  from "@material-ui/icons/Loop";
import { FC } from "react";
import ActionButton from "./actionButton";

const useStyles = makeStyles(theme => ({
  container: {
    position: 'fixed',
    display: 'flex',
    alignItems: 'center',
    bottom: theme.spacing(2),
    left: theme.spacing(2),
    pointerEvents: 'none'
  }
}))

interface Props {
  handleRandomize: () => void
  playing: boolean
}

const FloatingBoardActions:FC<Props> = ({ handleRandomize, playing }) => {
  const classes = useStyles()
  return (
    <div className={classes.container}>

      <ActionButton
      text="Randomize"
      onClick={handleRandomize}
      size="large"
      active={!playing}
      >
        <LoopIcon/>
      </ActionButton>

    </div>
  )
}
export default FloatingBoardActions