import { Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, makeStyles, Slider, Switch, Tooltip, Typography } from "@material-ui/core";
import { FC, useContext, useEffect, useState } from "react";
import { SizeContext } from "../main";
import DoneIcon from '@material-ui/icons/Done';
import { maxGridSize, minGridSize, minGridScale, maxGridScale } from '../../misc/constants';

const useStyles = makeStyles(theme => ({
  sizeBar: {
    color: theme.palette.primary.light
  },
  wrapSwitch: {
    color: theme.palette.primary.light
  }
}))

interface SettingsProps {
  open: boolean
  onClose: () => void
  handleGridSize: (size: number) => void
  gridScale: [number, ((scale: number) => void)]
}

const SettingsModal:FC<SettingsProps> = ({ open, onClose, handleGridSize, gridScale }) => {
  const classes = useStyles()
  const [currGridSize] = useContext(SizeContext)
  const [currGridScale, setGridScale] = gridScale

  const [sliderGridSize, setSliderGridSize] = useState(currGridSize)
  const [sliderGridScale, setSliderGridScale] = useState(currGridScale)

  useEffect(() => setSliderGridSize(currGridSize), [open])

  const confirmChanges = () => {

    setGridScale(sliderGridScale)

    if (currGridSize != sliderGridSize)
      handleGridSize(sliderGridSize)
    
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
    >

      <DialogTitle>
        Settings
      </DialogTitle>

      <DialogContent dividers>

        <Typography gutterBottom >Grid size</Typography>
        <Slider
          className={classes.sizeBar}
          value={sliderGridSize}
          onChange={(_, newVal) => typeof newVal === 'number' && setSliderGridSize(newVal)}
          step={1}
          min={minGridSize}
          max={maxGridSize}
          valueLabelDisplay="auto"
        />

        <Typography gutterBottom >Zoom level</Typography>
        <Slider
          className={classes.sizeBar}
          value={sliderGridScale}
          onChange={(_, newVal) => typeof newVal === 'number' && setSliderGridScale(newVal)}
          step={0.1}
          min={minGridScale}
          max={maxGridScale}
          valueLabelDisplay="auto"
        />

        <Typography gutterBottom>Wrap board edges</Typography>
        <Switch className={classes.wrapSwitch}></Switch>

      </DialogContent>

      <DialogActions>

        <Tooltip title="Save changes" arrow>
          <IconButton onClick={confirmChanges}>
            <DoneIcon></DoneIcon>
          </IconButton>
        </Tooltip>

      </DialogActions>

    </Dialog>
  )
}
export default SettingsModal