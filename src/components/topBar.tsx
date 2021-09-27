import { Grid, IconButton, makeStyles, Tooltip } from '@material-ui/core';
import { FC } from "react"
import { HistoryState } from '../utils';
import UndoIcon from '@material-ui/icons/Undo';
import RedoIcon from '@material-ui/icons/Redo';
import ClearIcon from '@material-ui/icons/Clear';
import SaveIcon from '@material-ui/icons/Save';
import RestorePageIcon from '@material-ui/icons/RestorePage';
import { Board } from '../types';

const useStyles = makeStyles(theme => ({
  actionBar: {
    marginTop: theme.spacing(0.5),
    marginBottom: theme.spacing(0.5)
  }
}))

interface TopBarProps {
  handlers: {
    handleSaving: () => void
    handleLoading: () => void
    handleClear: () => void
  }
  state: {
    playing: boolean
    anyActive: boolean
  }
  actions: HistoryState<Board>
}

const TopBar:FC<TopBarProps> = ({ handlers, state, actions }) => {
  const classes = useStyles()
  return (
    <Grid container justifyContent="center" className={classes.actionBar}>
    
      <Tooltip title="Undo" arrow placement="top">
        <IconButton
          onClick={actions.back}
          disabled={state.playing || !actions.canGoBack}
        >
          <UndoIcon></UndoIcon>
        </IconButton>
      </Tooltip>

      <Tooltip title="Redo" arrow placement="top">
        <IconButton
          onClick={actions.forward}
          disabled={state.playing || !actions.canGoForward}
          >
          <RedoIcon></RedoIcon>
        </IconButton>
      </Tooltip>

      <Tooltip title="Clear" arrow placement="top">
        <IconButton
          onClick={handlers.handleClear}
          disabled={state.playing || !state.anyActive}
          >
          <ClearIcon></ClearIcon>
        </IconButton>
      </Tooltip>

      <Tooltip title="Save" arrow placement="top">
        <IconButton
          onClick={handlers.handleSaving}
          disabled={state.playing}
        >
          <SaveIcon/>
        </IconButton>
      </Tooltip>

      <Tooltip title="Load" arrow placement="top">
      <IconButton
        onClick={handlers.handleLoading}
        disabled={state.playing}
      >
        <RestorePageIcon/>
      </IconButton>
      </Tooltip>

    </Grid>
  )
}
export default TopBar