import {
  Avatar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
  makeStyles,
  Menu,
  MenuItem,
  Tab,
  Tabs,
  TextField,
  Theme,
  Tooltip,
  Typography,
  useMediaQuery
} from '@material-ui/core'
import DoneIcon from '@material-ui/icons/Done'
import DeleteSweepIcon from '@material-ui/icons/DeleteSweep'
import CloseIcon from '@material-ui/icons/Close'
import ReorderIcon from '@material-ui/icons/Reorder'
import DeleteIcon from '@material-ui/icons/Delete'
import { Dispatch, FC, FormEvent, useMemo, useState } from 'react'
import { newBoard, useToggle } from '../../misc/utils'
import { Board, Ordering, Pattern, SavedState } from '../../types'
import { maxGridSize, minGridSize, sortOptions } from '../../misc/constants'
import { styled } from '@material-ui/styles'
import { useDebounce } from 'react-use'

interface LoadingProps {
  open: boolean
  onClose: () => void
  onLoad: (state: Board, size: number) => void
  patterns: Pattern[]
  setPatterns: Dispatch<React.SetStateAction<Pattern[]>>
}

interface ListItemProps {
  pattern: Pattern
  handleLoad: () => void
  handleDelete: () => void
}

interface LoadTabProps {
  active: boolean
  patterns: Pattern[]
  setPatterns: Dispatch<React.SetStateAction<Pattern[]>>
  load: (state: SavedState) => void
}

interface ImportTabProps {
  active: boolean
  load: (state: SavedState) => void
}

const StyledTextField = styled(TextField)({
  '& label.Mui-focused': {
    color: 'white'
  },
  '& .MuiInput-underline:after': {
    borderBottomColor: 'white'
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: 'white'
    },
    '&:hover fieldset': {
      borderColor: 'white'
    },
    '&.Mui-focused fieldset': {
      borderColor: 'white'
    }
  }
})

const useStyles = makeStyles(theme => ({
  dialog: {
    overflowY: 'hidden'
  },
  dialogTitle: {
    padding: 0
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

const timeFormat = new Intl.DateTimeFormat('en-AU', {
  dateStyle: 'short',
  timeStyle: 'short'
})

const SavedListItem: FC<ListItemProps> = ({
  pattern,
  handleLoad,
  handleDelete
}) => {
  const { name, created, state } = pattern

  const lengthStr = `${state.cells.length} cell${
    state.cells.length === 1 ? '' : 's'
  }`
  const timeStr = timeFormat.format(created)
  const dimensions = `${state.size}x${state.size}`
  const subtitle = `${lengthStr} \u00B7 ${dimensions} \u00B7 ${timeStr}`

  const showAvatar = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  return (
    <ListItem button onClick={handleLoad}>
      {showAvatar && (
        <ListItemAvatar>
          <Avatar
            src={`https://avatars.dicebear.com/api/jdenticon/${encodeURIComponent(
              name
            )}.svg?hues=100`}
          />
        </ListItemAvatar>
      )}

      <ListItemText primary={name} secondary={subtitle} />
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

const LoadTab: FC<LoadTabProps> = ({ active, patterns, setPatterns, load }) => {
  const classes = useStyles()

  const [sortBy, setSortBy] = useState(sortOptions[0])
  const [sortAnchor, setSortAnchor] = useState<HTMLElement | null>(null)
  const [searchText, setSearchText] = useState('')

  const [debouncedSearch, setDebouncedSearch] = useState('')

  const deletePattern = (name: string) =>
    setPatterns(patterns => patterns.filter(p => p.name !== name))

  const deleteAll = () => setPatterns([])

  const sort = (order: Ordering<Pattern>) => {
    setSortAnchor(null)
    setSortBy(order)
  }

  useDebounce(() => setDebouncedSearch(searchText), 250, [searchText])

  const sorted = useMemo(() => {
    return [...patterns]
      .filter(p =>
        p.name.toLowerCase().includes(debouncedSearch.trim().toLowerCase())
      )
      .sort(sortBy.sorter)
  }, [active, patterns, sortBy, debouncedSearch])

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
          {sorted.map(p => (
            <SavedListItem
              key={p.name}
              pattern={p}
              handleLoad={() => load(p.state)}
              handleDelete={() => deletePattern(p.name)}
            />
          ))}
          {sorted.length == 0 && (
            <Typography variant="body1">
              No saved patterns were found
            </Typography>
          )}
        </List>
      </DialogContent>

      <DialogActions style={{ display: 'flex' }}>
        <Tooltip title="Delete all" arrow>
          <IconButton
            style={{ marginRight: 'auto' }}
            onClick={deleteAll}
            disabled={patterns.length === 0}
          >
            <DeleteSweepIcon></DeleteSweepIcon>
          </IconButton>
        </Tooltip>

        <Tooltip title="Sort" arrow>
          <IconButton onClick={e => setSortAnchor(e.currentTarget)}>
            <ReorderIcon></ReorderIcon>
          </IconButton>
        </Tooltip>
      </DialogActions>

      <Menu
        open={!!sortAnchor}
        onClose={() => setSortAnchor(null)}
        anchorEl={sortAnchor}
      >
        {sortOptions.map(sortOption => (
          <MenuItem onClick={() => sort(sortOption)} key={sortOption.text}>
            {sortOption.text}
          </MenuItem>
        ))}
      </Menu>
    </div>
  )
}

const ImportTab: FC<ImportTabProps> = ({ active, load }) => {
  const [errorText, setErrorText] = useState('')
  const [importText, setImportText] = useState('')

  const importFromText = (e: FormEvent) => {
    e.preventDefault()

    if (!validateImport(importText)) {
      setErrorText('Invalid import string!')
      return
    }

    setErrorText('')
    load(JSON.parse(Buffer.from(importText, 'base64').toString('utf8')))
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
            <IconButton type="submit">
              <DoneIcon></DoneIcon>
            </IconButton>
          </Tooltip>
        </DialogActions>
      </form>
    </div>
  )
}

const validateImport = (s: string) => {
  try {
    const parsed: SavedState = JSON.parse(
      Buffer.from(s, 'base64').toString('utf8')
    )

    if (typeof parsed?.size !== 'number') return false

    if (parsed.size < minGridSize || parsed.size > maxGridSize) return false

    if (!(parsed?.cells instanceof Array)) return false

    if (
      !parsed.cells.every(
        tuple =>
          tuple instanceof Array &&
          tuple.length === 2 &&
          tuple.every(
            val => typeof val === 'number' && 0 <= val && val < parsed.size
          )
      )
    )
      return false
  } catch (err) {
    return false
  }

  return true
}

const LoadingModal: FC<LoadingProps> = ({
  open,
  onClose,
  onLoad,
  patterns,
  setPatterns
}) => {
  const classes = useStyles()

  const [tab, setTab] = useState(0)

  const decodePattern = (state: SavedState) => {
    const arr = newBoard(state.size)
    for (const [y, x] of state.cells) arr[y][x] = true
    return arr
  }

  const load = (state: SavedState) => {
    const newBoard = decodePattern(state)
    onLoad(newBoard, state.size)
  }

  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('xs'))
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      style={{ overflow: 'none' }}
      className={classes.dialog}
      fullScreen={isMobile}
    >
      <DialogTitle className={classes.dialogTitle}>
        {isMobile && (
          <Grid
            style={{ padding: '1rem' }}
            container
            direction="row"
            justify="space-between"
            alignItems="center"
          >
            <Typography variant="h6">Restore a pattern</Typography>
            <IconButton onClick={onClose}>
              <CloseIcon></CloseIcon>
            </IconButton>
          </Grid>
        )}
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

      <ImportTab active={tab === 1} load={load} />
    </Dialog>
  )
}

export default LoadingModal
