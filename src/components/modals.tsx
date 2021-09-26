import {Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, List, ListItem, ListItemSecondaryAction, ListItemText, makeStyles, Menu, MenuItem, TextField, Tooltip } from '@material-ui/core'
import DoneIcon from '@material-ui/icons/Done'
import DeleteSweepIcon from '@material-ui/icons/DeleteSweep';
import ReorderIcon from '@material-ui/icons/Reorder';
import DeleteIcon from '@material-ui/icons/Delete';
import { Dispatch, FC, FormEvent, useEffect, useMemo, useState } from "react"
import { newBoard } from '../utils';
import { styled } from '@material-ui/styles';
import { Board, CellList, Pattern } from '../types';

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

type Ordering = "alp" | "asc" | "desc"

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

const maxNameLen = 64

function encodePattern(cells:Board) {
  const encoded:CellList = []
  cells.forEach((row, i) =>
    row.forEach((cell, j) => {
      if (cell)
        encoded.push([i, j])
    })
  )
  return encoded
}

function decodePattern(cells:CellList) {
  const arr = newBoard()
  for (const [y, x] of cells)
    arr[y][x] = true
  return arr
}

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
    setPatterns(prev => [ newPattern, ...prev.filter(p => p.name !== newPattern.name)])
    onClose()
  }

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
        <DialogActions>
          <Tooltip title="Confirm" arrow>
            <IconButton type="submit">
              <DoneIcon></DoneIcon>
            </IconButton>
          </Tooltip>
        </DialogActions>
      </form>
    </Dialog>
  )
}

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

const timeFormat = new Intl.DateTimeFormat(
  'en-AU',
  {dateStyle: "short", timeStyle: "short"}
)

const LoadingModal:FC<LoadingProps> = ({ open, onClose, onLoad, patterns, setPatterns }) => {

  const [sortBy, setSortBy] = useState<Ordering>("desc")
  const [sortAnchor, setSortAnchor] = useState<Element | null>(null)

  const sorter = useMemo(() => {
    switch (sortBy) {
      case "alp":
        return (a:Pattern, b:Pattern) => a.name.localeCompare(b.name)
      case "asc":
        return (a:Pattern, b:Pattern) => a.created - b.created
      case "desc":
        return (a:Pattern, b:Pattern) => b.created - a.created
    }
  }, [sortBy])

  const sorted = useMemo(() =>
    [...patterns].sort(sorter),
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

  const sort = (order:Ordering) => {
    closeSortMenu()
    setSortBy(order)
  }

  return(
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
    >
      <DialogTitle>
        <Grid container direction="row" justifyContent="space-between" alignItems="center">
          Load a pattern
          <Tooltip title="Sort" arrow>
            <IconButton
              size="small"
              onClick={e => setSortAnchor(e.currentTarget)}
            >
              <ReorderIcon></ReorderIcon>
            </IconButton>
          </Tooltip>
        </Grid>
        <Menu
            open={!!sortAnchor}
            onClose={closeSortMenu}
            anchorEl={sortAnchor}
          >
            <MenuItem onClick={() => sort('alp')}>Alphabetical</MenuItem>
            <MenuItem onClick={() => sort('desc')}>Newest</MenuItem>
            <MenuItem onClick={() => sort('asc')}>Oldest</MenuItem>
          </Menu>
      </DialogTitle>
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
          "No saved patterns were found"
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

      </DialogActions>
    </Dialog>
  )
}

export { SavingModal, LoadingModal }