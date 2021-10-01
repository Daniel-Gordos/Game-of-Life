import { AppBar, IconButton, makeStyles, Menu, MenuItem, Slider, Toolbar, Tooltip, Typography } from "@material-ui/core";
import DehazeIcon from "@material-ui/icons/Dehaze";
import DeleteIcon from "@material-ui/icons/Delete";
import { FC, RefObject, useRef } from "react";

interface Props {
  handleToggleSidebar: () => void
  handleClear: () => void
  canClear: boolean
}

const useStyles = makeStyles(theme => ({
  nav: {
    position: 'sticky',
    top: '0',
    background: 'linear-gradient(43deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%)'
  },
  toolbar: {
    justifyContent: 'space-between',
  },
  title: {
    userSelect: 'none',
    marginLeft: theme.spacing(1),
  }
}))

const Navbar:FC<Props> = ({ handleToggleSidebar, handleClear, canClear }) => {
  const classes = useStyles()
  return (
    <AppBar className={classes.nav}>
      <Toolbar className={classes.toolbar}>

        <IconButton edge="start" onClick={handleToggleSidebar}>
          <DehazeIcon></DehazeIcon>
        </IconButton>
        <Typography variant="h3" component="span" className={classes.title}>
          👾
        </Typography>


        <Tooltip title="Clear" arrow placement="bottom">
          <IconButton
            onClick={handleClear}
            disabled={!canClear}
            edge="end"
          >
            <DeleteIcon></DeleteIcon>
          </IconButton>
        </Tooltip>

      </Toolbar>
    </AppBar>
  )
}
export default Navbar