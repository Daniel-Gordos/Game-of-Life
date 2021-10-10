import { Fab, IconButton, makeStyles, Tooltip } from "@material-ui/core"
import PauseIcon from "@material-ui/icons/Pause";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import UndoIcon from '@material-ui/icons/Undo';
import RedoIcon from '@material-ui/icons/Redo';
import SkipNextIcon from '@material-ui/icons/SkipNext';
import { FC, ReactElement } from 'react';
import ActionButton from "./actionButton";

const useStyles = makeStyles(theme => ({
  container: {
    position: 'fixed',
    display: 'flex',
    alignItems: 'center',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
    pointerEvents: 'none'
  }
}))

interface Props {
  handlers: {
    togglePlay: () => void
    step: () => void
    undo: () => void
    redo: () => void
  }
  state: {
    playing: boolean
    canUndo: boolean
    canRedo: boolean
  }
}

const FloatingActions:FC<Props> = ({ handlers, state }) => {
  const classes = useStyles()
  return (
    <div className={classes.container}>
      
      <ActionButton
        size="small"
        text="Undo"
        onClick={handlers.undo}
        active={!state.playing && state.canUndo}
      >
        <UndoIcon/>
      </ActionButton>

      <ActionButton
        size="small"
        text="Redo"
        onClick={handlers.redo}
        active={!state.playing && state.canRedo}
      >
        <RedoIcon/>
      </ActionButton>

      <ActionButton
        size="small"
        text="Step"
        onClick={handlers.step}
        active={!state.playing}
      >
        <SkipNextIcon/>
      </ActionButton>

      <ActionButton
        size="large"
        text={state.playing ? "Pause" : "Play"}
        onClick={handlers.togglePlay}
        active={true}>
        {state.playing ? <PauseIcon fontSize="large"/> : <PlayArrowIcon fontSize="large"/>}
      </ActionButton>

    </div>
  )
}
export default FloatingActions