import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, makeStyles, Slider, Switch, Tooltip, Typography } from "@material-ui/core";
import { FC, useContext, useEffect, useState } from "react";
import { SizeContext } from "../main";
import DoneIcon from '@material-ui/icons/Done';
import { maxGridSize, minGridSize, minGridScale, maxGridScale, minRandomize, maxRandomize } from '../../misc/constants';

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
  randomizeChance: number
  handleRandomizeChance: (val: number) => void
  wrapEdges: boolean
  handleWrapEdges: (val: boolean) => void
}

const SettingsModal:FC<SettingsProps> = ({
  open,
  onClose,
  handleGridSize,
  gridScale,
  randomizeChance,
  handleRandomizeChance,
  wrapEdges,
  handleWrapEdges
}) => {

  const classes = useStyles()
  const [currGridSize] = useContext(SizeContext)
  const [currGridScale, setGridScale] = gridScale

  const [sliderGridSize, setSliderGridSize] = useState(currGridSize)
  const [sliderGridScale, setSliderGridScale] = useState(currGridScale)
  const [sliderRandomize, setSliderRandomize] = useState(randomizeChance)
  const [currWrapEdges, setCurrWrapEdges] = useState(wrapEdges)

  useEffect(() => setSliderGridSize(currGridSize), [open])

  const confirmChanges = () => {

    setGridScale(sliderGridScale)
    handleRandomizeChance(sliderRandomize)
    handleWrapEdges(currWrapEdges)

    if (currGridSize != sliderGridSize)
      handleGridSize(sliderGridSize)

    onClose()
  }

  const clearSaved = () => {
    localStorage.clear()
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

        <Typography gutterBottom >Randomize cell chance</Typography>
        <Slider
          className={classes.sizeBar}
          value={sliderRandomize}
          onChange={(_, newVal) => typeof newVal === 'number' && setSliderRandomize(newVal)}
          step={0.05}
          min={minRandomize}
          max={maxRandomize}
          valueLabelDisplay="auto"
        />

        <Typography gutterBottom>Wrap board edges</Typography>
        <Switch
          className={classes.wrapSwitch}
          checked={currWrapEdges}
          onChange={e => setCurrWrapEdges(e.target.checked)}
        />

        <Divider></Divider>

        <Button onClick={clearSaved} style={{ marginTop: '1rem'}}>
          Clear local data
        </Button>

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