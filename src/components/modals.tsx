import {Dialog, DialogActions, DialogContent, DialogTitle, IconButton, List, ListItem, ListItemSecondaryAction, ListItemText, makeStyles, Menu, MenuItem, Tab, Tabs, TextField, Tooltip, Typography } from '@material-ui/core'
import DoneIcon from '@material-ui/icons/Done'
import DeleteSweepIcon from '@material-ui/icons/DeleteSweep';
import PublishIcon from '@material-ui/icons/Publish';
import ReorderIcon from '@material-ui/icons/Reorder';
import DeleteIcon from '@material-ui/icons/Delete';
import { Dispatch, FC, FormEvent, useEffect, useMemo, useState } from "react"
import { encodePattern, decodePattern } from '../utils';
import { styled } from '@material-ui/styles';
import { Board, CellList, gridSize, Ordering, Pattern } from '../types';

interface SavingProps {
  open: boolean
  onClose: () => void
  cellState: Board
  setPatterns: Dispatch<React.SetStateAction<Pattern[]>>
}

interface LoadingProps {
  open: boolean
  onClose: () => void
  onLoad: (state:Board) => void
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
});

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

const maxNameLen = 64

const SavingModal:FC<SavingProps> = ({ open, onClose, cellState, setPatterns }) => {
  const [name, setName] = useState('')
  const [errorText, setErrorText] = useState('')

  useEffect(() => {
    setName('')
    setErrorText('')
  }, [open])

  const save = (e:FormEvent) => {
    e.preventDefault()
    if (!/[a-z0-9]/i.test(name)) {
      setErrorText('Name must contain at least one alphanumeric character!')
      return
    }
    if (name.length > maxNameLen) {
      setErrorText('Name is too long!')
      return
    }

    const newPattern = {
      name: name,
      created: new Date().getTime(),
      cells: encodePattern(cellState)
    }
    setPatterns(prev =>
      [ newPattern, ...prev.filter(p => p.name != newPattern.name) ])
    onClose()
  }

  const exportClipboard = () =>
    navigator.clipboard.writeText(JSON.stringify(encodePattern(cellState)))

  return(
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
    >
      <form onSubmit={save}>
        <DialogTitle>Save pattern</DialogTitle>
        <DialogContent dividers>
          <StyledTextField
            fullWidth
            label="Name"
            placeholder="Enter a name for the pattern..."
            value={name}
            onChange={e => setName(e.target.value)}
            error={!!errorText}
            helperText={errorText}
            autoFocus={true}
          />
        </DialogContent>
        <DialogActions style={{ display: 'flex' }}> 

         <Tooltip title="Export to clipboard" arrow>
            <IconButton onClick={exportClipboard} style={{ marginRight: 'auto' }}>
              <PublishIcon></PublishIcon>
            </IconButton>
          </Tooltip>

          <Tooltip title="Confirm" arrow>
            <IconButton type="submit" >
              <DoneIcon></DoneIcon>
            </IconButton>
          </Tooltip>
        </DialogActions>
      </form>
    </Dialog>
  )
}

const timeFormat = new Intl.DateTimeFormat(
  'en-AU',
  {dateStyle: "short", timeStyle: "short"}
)

const SavedListItem:FC<ListItemProps> = ({ pattern, handleLoad, handleDelete}) => (
  <ListItem key={pattern.name} button onClick={handleLoad}>
    <ListItemText
      primary={pattern.name}
      secondary={`${pattern.cells.length} cell${pattern.cells.length == 1 ? "" : "s"}, ${timeFormat.format(pattern.created)}`}
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

const TabPanel:FC<TabProps> = ({ index, currTab, children }) => {
  return (
    <div role="tabpanel" hidden={index !== currTab}>
      {children}
    </div>
  )
}

const validateImport = (s:string) => {

  let valid = true
    if (!/^\[((\[\d+,\d+\],)*(\[\d+,\d+\]))?\]$/.test(s))
      valid = false
    if (Array.from(s.matchAll(/\d+/g))
      .some(m => {
        const val = parseInt(m[0])
        return val < 0 || val >= gridSize
      })
    )
      valid = false
  
  return valid
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
    sorter: (a, b) => b.cells.length - a.cells.length
  }
]

const LoadingModal:FC<LoadingProps> = ({ open, onClose, onLoad, patterns, setPatterns }) => {
  const classes = useStyles()

  const [tab, setTab] = useState(0)
  const [sortBy, setSortBy] = useState(sortOptions[0])
  const [sortAnchor, setSortAnchor] = useState<Element | null>(null)

  const [errorText, setErrorText] = useState("")
  const [importText, setImportText] = useState("")

  const sorted = useMemo(() =>
    [...patterns].sort(sortBy.sorter),
    [open, patterns, sortBy]
  )

  const load = (cells:CellList) => {
    const newCells = decodePattern(cells)
    onLoad(newCells)
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

  const importFromText = (e:FormEvent) => {
    e.preventDefault()

    if (!validateImport(importText)) {
      setErrorText('Invalid import string!')
      return
    } 

    setErrorText('')
    onLoad(decodePattern(JSON.parse(importText)))
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
                handleLoad={() => load(p.cells)}
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

export { SavingModal, LoadingModal }