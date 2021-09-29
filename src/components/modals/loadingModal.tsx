import {Avatar, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, List, ListItem, ListItemAvatar, ListItemSecondaryAction, ListItemText, makeStyles, Menu, MenuItem, Tab, Tabs, TextField, Tooltip, Typography } from '@material-ui/core'
import DoneIcon from '@material-ui/icons/Done'
import DeleteSweepIcon from '@material-ui/icons/DeleteSweep';
import ReorderIcon from '@material-ui/icons/Reorder';
import DeleteIcon from '@material-ui/icons/Delete';
import { Dispatch, FC, FormEvent, useContext, useMemo, useRef, useState } from "react"
import { newBoard, useToggle } from '../../misc/utils';
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

interface LoadTabProps {
  active: boolean
  patterns: Pattern[]
  setPatterns: Dispatch<React.SetStateAction<Pattern[]>>
  load: (state:SavedState) => void
}

interface ImportTabProps {
  active: boolean
  load: (state:SavedState) => void
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
  dialog: {
    overflowY: 'hidden',
  },
  dialogTitle: {
    padding: 0,
  },
  tabMenuItem: {
    height: theme.spacing(7.5)
  },
  tabBar: {
    backgroundColor: theme.palette.success.light
  },
  loadingTab: {
    overflowY: 'hidden'
  },
  savedList: {
    overflowY: 'scroll',
    maxHeight: '50vh'
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
      <ListItemAvatar>
        <Avatar src={`https://avatars.dicebear.com/api/jdenticon/${encodeURIComponent(name)}.svg?hues=100`}/>
      </ListItemAvatar>
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

const sortOptions:Ordering<Pattern>[] = [
  {
    text: 'Newest',
    sorter: (a, b) => b.created - a.created
  },
  {
    text: 'Oldest',
    sorter: (a, b) => a.created - b.created
  },
  {
    text: 'Alphabetical',
    sorter: (a, b) => a.name.localeCompare(b.name)
  },
  {
    text: 'Most cells',
    sorter: (a, b) => b.state.cells.length - a.state.cells.length
  }
]

const LoadTab:FC<LoadTabProps> = ({ active, patterns, setPatterns, load }) => {
  const classes = useStyles()

  const [sortBy, setSortBy] = useState(sortOptions[0])
  const [sortAnchor, setSortAnchor] = useState<HTMLElement | null>(null)
  const [searchText, setSearchText] = useState("")
  
  const deletePattern = (name: string) =>
  setPatterns(patterns => patterns.filter(p => p.name !== name))
  
  const deleteAll = () => setPatterns([])
  
  const sort = (order:Ordering<Pattern>) => {
    setSortAnchor(null)
    setSortBy(order)
  }
  
    const sorted = useMemo(() => {
      const searchRegex = new RegExp(searchText, 'i')
      return [...patterns]
        .filter(p => searchRegex.test(p.name))
        .sort(sortBy.sorter)
    }, [active, patterns, sortBy, searchText])

  return (
    <div role="tabpanel" hidden={!active} className={classes.loadingTab}>
      <DialogContent dividers>
        <StyledTextField
          autoFocus
          variant="standard"
          color="secondary"
          placeholder="Search patterns..."
          label="Search"
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
        />
        <List className={classes.savedList}>
        {sorted.map(p =>
          <SavedListItem
            key={p.name}
            pattern={p}
            handleLoad={() => load(p.state)}
            handleDelete={() => deletePattern(p.name)}
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
        onClose={() => setSortAnchor(null)}
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

    </div>
  )
}

const ImportTab:FC<ImportTabProps> = ({ active, load }) => {
  
  const [errorText, setErrorText] = useState("")
  const [importText, setImportText] = useState("")

  const importFromText = (e:FormEvent) => {
    e.preventDefault()

    if (!validateImport(importText)) {
      setErrorText('Invalid import string!')
      return
    } 

    setErrorText('')
    load(JSON.parse(b64DecodeUnicode(importText)))
  }

  return (
    <div role="tabpanel" hidden={!active}>
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
    </div>
  )
}

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

  const [tab, setTab] = useState(0)

  const decodePattern = (state:SavedState) => {
    const arr = newBoard(state.size)
    for (const [y, x] of state.cells)
      arr[y][x] = true
    return arr
  }

  const load = (state: SavedState) => {
    const newBoard = decodePattern(state)
    onLoad(newBoard, state.size)
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      style={{overflow: 'none'}}
      className={classes.dialog}
    >
      <DialogTitle className={classes.dialogTitle}>
        <Tabs
          variant="fullWidth"
          value={tab}
          onChange={(_, newVal) => setTab(newVal)}
          TabIndicatorProps={{ className: classes.tabBar }}
        >
          <Tab label="Load" className={classes.tabMenuItem} />
          <Tab label="Import" className={classes.tabMenuItem} />
        </Tabs>
      </DialogTitle>
        
        <LoadTab
          active={tab === 0}
          patterns={patterns}
          setPatterns={setPatterns}
          load={load}
        />

        <ImportTab
          active={tab === 1}
          load={load}
        />    
          
    </Dialog>
  )
}

export default LoadingModal