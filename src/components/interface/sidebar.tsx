import { Drawer, Divider, List, ListItem, ListItemAvatar, ListItemIcon, ListItemText, MenuItem, MenuList, SwipeableDrawer } from "@material-ui/core"
import DehazeIcon from "@material-ui/icons/Dehaze"
import { Component, FC, ReactElement } from "react"
import SettingsIcon from '@material-ui/icons/Settings';
import InfoIcon from "@material-ui/icons/Info";
import SaveIcon from '@material-ui/icons/Save';
import RestorePageIcon from '@material-ui/icons/RestorePage';


interface SidebarProps {
  open: boolean
  onOpen: () => void
  onClose: () => void
  handlers: {
    onClickSettings: () => void
    onClickInfo: () => void
    onClickSave: () => void
    onClickLoad: () => void
  }
  
}

interface ItemProps {
  onClick: () => void
  heading: string
  subhead?: string
  icon: ReactElement
}

const SidebarItem:FC<ItemProps> = ({ heading, subhead, icon, onClick }) => {
  return (
    <MenuItem onClick={onClick}>
      <ListItemIcon>{icon}</ListItemIcon>
        <ListItemText primary={heading} secondary={subhead}>
      </ListItemText>
    </MenuItem>
  )
}

const Sidebar:FC<SidebarProps> = ({ open, onOpen, onClose, handlers }) => {

  return (
    <SwipeableDrawer
      open={open}
      onOpen={onOpen}
      onClose={onClose}
    >
      <MenuList>
    
        <SidebarItem
          heading="About"
          icon={<InfoIcon/>}
          onClick={handlers.onClickInfo}
        />
        
        <Divider></Divider>

        
        <SidebarItem
          heading="Save"
          subhead="Save locally or export as a string"
          icon={<SaveIcon/>}
          onClick={handlers.onClickSave}
        />

        <SidebarItem
          heading="Load"
          subhead="Restore from a save or import from string"
          icon={<RestorePageIcon/>}
          onClick={handlers.onClickLoad}
        />

        <SidebarItem
          heading="Settings"
          icon={<SettingsIcon/>}
          onClick={handlers.onClickSettings}
        />

    
      </MenuList>
    </SwipeableDrawer>
  )
}
export default Sidebar