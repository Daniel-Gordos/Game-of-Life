import { Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, makeStyles, Slider, Tooltip, Typography } from "@material-ui/core";
import { FC, useContext, useEffect, useState } from "react";
import { SizeContext } from "../main";
import DoneIcon from '@material-ui/icons/Done';

const useStyles = makeStyles(theme => ({
  sizeBar: {
    color: theme.palette.primary.light
  }
}))

interface SettingsProps {
  open: boolean
  onClose: () => void
  handleGridSize: (size: number) => void
}

const SettingsModal:FC<SettingsProps> = ({ open, onClose, handleGridSize }) => {
  const classes = useStyles()
  const [currGridSize] = useContext(SizeContext)

  const [sliderGridSize, setSliderGridSize] = useState(currGridSize)

  useEffect(() => setSliderGridSize(currGridSize), [open])

  const confirmChanges = () => {

    handleGridSize(sliderGridSize)
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
          min={5}
          max={20}
          valueLabelDisplay="auto"
        />
        {sliderGridSize}

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