import { Grid, IconButton, makeStyles, Tooltip } from "@material-ui/core"
import SkipNextIcon from '@material-ui/icons/SkipNext';
import PauseIcon from '@material-ui/icons/Pause';
import { FC } from "react";
import PlayArrowIcon from '@material-ui/icons/PlayArrow';

const useStyles = makeStyles(theme => ({
  actionBar: {
    marginTop: theme.spacing(0.5),
    marginBottom: theme.spacing(0.5)
  }
}))

interface BottomBarProps {
  playing: boolean
  handleTick: () => void
  handleTogglePlaying: () => void
}

const BottomBar:FC<BottomBarProps> = ({ playing, handleTick, handleTogglePlaying }) => {
  const classes = useStyles()
  return (
    <Grid container justifyContent="center" className={classes.actionBar}>
      <Tooltip title="Step" arrow placement="bottom">
        <IconButton
          onClick={handleTick}
          disabled={playing}
        >
          <SkipNextIcon></SkipNextIcon>
        </IconButton>
      </Tooltip>
      <Tooltip title={playing ? "Pause" : "Play"} arrow>
        <IconButton onClick={handleTogglePlaying}>
          {playing ? <PauseIcon/> : <PlayArrowIcon/>}
        </IconButton>
      </Tooltip>
    </Grid>
  )
}
export default BottomBar