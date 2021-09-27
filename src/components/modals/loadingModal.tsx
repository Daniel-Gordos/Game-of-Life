import {Dialog, DialogActions, DialogContent, DialogTitle, IconButton, List, ListItem, ListItemSecondaryAction, ListItemText, makeStyles, Menu, MenuItem, Tab, Tabs, TextField, Tooltip, Typography } from '@material-ui/core'
import DoneIcon from '@material-ui/icons/Done'
import DeleteSweepIcon from '@material-ui/icons/DeleteSweep';
import ReorderIcon from '@material-ui/icons/Reorder';
import DeleteIcon from '@material-ui/icons/Delete';
import { Dispatch, FC, FormEvent, useContext, useMemo, useState } from "react"
import { newBoard } from '../../misc/utils';
import { Board, Ordering, Pattern, SavedState } from '../../types';
import { SizeContext } from '../main';
import { maxGridSize, minGridSize } from '../../misc/constants';
import { styled } from '@material-ui/styles';
import { b64DecodeUnicode } from '../../misc/b64';

interface LoadingProps {
  open: boolean
  onClose: () => void
  onLoad: (state:Board, size:number) => void
  patterns: Pattern[]
  setPatterns: Dispatch<React.SetStateAction<Pattern[]>>
}

interface ListItemProps {
  pattern: Pattern,
  handleLoad: () => void
  handleDelete: () => void
}

interface TabProps {
  index: number
  currTab: number
}

const StyledTextField = styled(TextField)({
  '& label.Mui-focused': {
    color: 'white',
  },
  '& .MuiInput-underline:after': {
    borderBottomColor: 'white',
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: 'white',
    },
    '&:hover fieldset': {
      borderColor: 'white',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'white',
    },
  },
})

const useStyles = makeStyles(theme => ({
  dialogTitle: {
    padding: 0,
  },
  tabMenuItem: {
    height: theme.spacing(7.5)
  },
  tabBar: {
    backgroundColor: theme.palette.success.light
  }
}))

const timeFormat = new Intl.DateTimeFormat(
  'en-AU',
  {dateStyle: "short", timeStyle: "short"}
)

const SavedListItem:FC<ListItemProps> = ({ pattern, handleLoad, handleDelete}) => {
  const { name, created, state } = pattern

  const lengthStr = `${state.cells.length} cell${state.cells.length === 1 ? "" : "s"}`
  const timeStr = timeFormat.format(created)
  const dimensions = `${state.size}x${state.size}`
  const subtitle = `${lengthStr} \u00B7 ${dimensions} \u00B7 ${timeStr}`

  return (
    <ListItem key={name} button onClick={handleLoad}>
      <ListItemText
        primary={name}
        secondary={subtitle}
      />
      <ListItemSecondaryAction onClick={handleDelete}>
        <Tooltip title="Delete" arrow>
          <IconButton edge="end">
            <DeleteIcon></DeleteIcon>
          </IconButton>
        </Tooltip>
      </ListItemSecondaryAction>
    </ListItem>
  )
}

const TabPanel:FC<TabProps> = ({ index, currTab, children }) => {
  return (
    <div role="tabpanel" hidden={index !== currTab}>
      {children}
    </div>
  )
}

const sortOptions:Ordering<Pattern>[] = [
  {
    text: 'Alphabetical',
    sorter: (a, b) => a.name.localeCompare(b.name)
  },
  {
    text: 'Newest',
    sorter: (a, b) => b.created - a.created
  },
  {
    text: 'Oldest',
    sorter: (a, b) => a.created - b.created
  },
  {
    text: 'Most cells',
    sorter: (a, b) => b.state.cells.length - a.state.cells.length
  }
]

const validateImport = (s:string) => {

  try {
    const parsed:SavedState = JSON.parse(b64DecodeUnicode(s))

    if (typeof parsed?.size !== 'number')
      return false
    
    if (parsed.size < minGridSize || parsed.size > maxGridSize)
      return false

    if (!(parsed?.cells instanceof Array))
      return false

    if (!parsed.cells.every(tuple =>
      (tuple instanceof Array) &&
      tuple.length === 2 &&
      tuple.every(val =>
        (typeof val === 'number') && 0 <= val && val < parsed.size
    )))
      return false

  } catch(err) {
    return false
  }

  return true
}

const LoadingModal:FC<LoadingProps> = ({ open, onClose, onLoad, patterns, setPatterns }) => {
  const classes = useStyles()
  const [gridSize] = useContext(SizeContext)

  const [tab, setTab] = useState(0)
  const [sortBy, setSortBy] = useState(sortOptions[0])
  const [sortAnchor, setSortAnchor] = useState<Element | null>(null)

  const [errorText, setErrorText] = useState("")
  const [importText, setImportText] = useState("")

  const sorted = useMemo(() =>
    [...patterns].sort(sortBy.sorter),
    [open, patterns, sortBy]
  )

  const load = (state: SavedState) => {
    const newBoard = decodePattern(state)
    onLoad(newBoard, state.size)
  }

  const deleteAll = () => setPatterns([])

  const delPattern = (name:string) => {
    setPatterns(prev => prev.filter(p => p.name !== name))
  }

  const closeSortMenu = () => setSortAnchor(null)

  const sort = (order:Ordering<Pattern>) => {
    closeSortMenu()
    setSortBy(order)
  }

  const decodePattern = (state:SavedState) => {
    const arr = newBoard(state.size)
    for (const [y, x] of state.cells)
      arr[y][x] = true
    return arr
  }

  const importFromText = (e:FormEvent) => {
    e.preventDefault()

    if (!validateImport(importText)) {
      setErrorText('Invalid import string!')
      return
    } 

    setErrorText('')
    load(JSON.parse(b64DecodeUnicode(importText)))
  }

  return(
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
    >
      <DialogTitle className={classes.dialogTitle}>
        <Tabs
          variant="fullWidth"
          value={tab}
          onChange={(e, newVal) => setTab(newVal)}
          TabIndicatorProps={{ className: classes.tabBar }}
        >
          <Tab label="Load" className={classes.tabMenuItem} />
          <Tab label="Import" className={classes.tabMenuItem} />
        </Tabs>
      </DialogTitle>

        <TabPanel index={0} currTab={tab}>
          <DialogContent dividers>
            <List>
            {sorted.map(p =>
              <SavedListItem
                key={p.name}
                pattern={p}
                handleLoad={() => load(p.state)}
                handleDelete={() => delPattern(p.name)}
              />
            )}
            {(sorted.length == 0) &&
              <Typography variant="body1">
                No saved patterns were found
              </Typography>
            }
            </List>
          </DialogContent>

          <DialogActions style={{display: "flex"}}>
            <Tooltip title="Delete all" arrow>
              <IconButton
                style={{marginRight: "auto"}}
                onClick={deleteAll}
                disabled={patterns.length === 0}
              >
                <DeleteSweepIcon></DeleteSweepIcon>
              </IconButton>
            </Tooltip>

            <Tooltip title="Sort" arrow>
              <IconButton
                onClick={e => setSortAnchor(e.currentTarget)}
              >
                <ReorderIcon></ReorderIcon>
              </IconButton>
            </Tooltip>

          </DialogActions>

          <Menu
            open={!!sortAnchor}
            onClose={closeSortMenu}
            anchorEl={sortAnchor}
          >
          {sortOptions.map((sortOption) =>
            <MenuItem
              onClick={() => sort(sortOption)}
              key={sortOption.text}
            >
              {sortOption.text}
            </MenuItem>
          )}
          </Menu>

        </TabPanel>
          
        <TabPanel index={1} currTab={tab}>
          <form onSubmit={importFromText}>
            <DialogContent dividers>
              <StyledTextField
                fullWidth
                label="Import from text"
                placeholder="Paste an exported pattern here..."
                value={importText}
                onChange={e => setImportText(e.target.value)}
                error={!!errorText}
                helperText={errorText}
              />
            </DialogContent>
            
            <DialogActions>

              <Tooltip title="Confirm" arrow>
                <IconButton type="submit" >
                  <DoneIcon></DoneIcon>
                </IconButton>
              </Tooltip>
            
            </DialogActions>
          </form>
        </TabPanel>
          
    </Dialog>
  )
}

export default LoadingModal