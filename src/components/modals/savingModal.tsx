import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Tooltip,
  useMediaQuery,
  Theme,
  Grid,
  Typography
} from '@material-ui/core'
import { styled } from '@material-ui/styles'
import { Dispatch, FC, FormEvent, useContext, useEffect, useState } from 'react'
import { Board, CellList, Pattern } from '../../types'
import { SizeContext } from '../main'
import PublishIcon from '@material-ui/icons/Publish'
import CloseIcon from '@material-ui/icons/Close'
import DoneIcon from '@material-ui/icons/Done'
import { maxNameLen } from '../../misc/constants'

interface SavingProps {
  open: boolean
  onClose: () => void
  cellState: Board
  setPatterns: Dispatch<React.SetStateAction<Pattern[]>>
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

const SavingModal: FC<SavingProps> = ({
  open,
  onClose,
  cellState,
  setPatterns
}) => {
  const [gridSize] = useContext(SizeContext)

  const [name, setName] = useState('')
  const [errorText, setErrorText] = useState('')

  useEffect(() => {
    setName('')
    setErrorText('')
  }, [open])

  const encodePattern = () => {
    const encoded: CellList = []
    cellState.forEach((row, i) =>
      row.forEach((cell, j) => {
        if (cell) encoded.push([i, j])
      })
    )
    return encoded
  }

  const save = (e: FormEvent) => {
    e.preventDefault()
    if (!/[a-z0-9]/i.test(name)) {
      setErrorText('Name must contain at least one alphanumeric character!')
      return
    }
    if (name.length > maxNameLen) {
      setErrorText('Name is too long!')
      return
    }

    const newPattern: Pattern = {
      name: name,
      created: new Date().getTime(),
      state: {
        cells: encodePattern(),
        size: gridSize
      }
    }
    setPatterns(prev => [
      newPattern,
      ...prev.filter(p => p.name != newPattern.name)
    ])
    onClose()
  }

  const exportClipboard = () => {
    const encoded = JSON.stringify({
      cells: encodePattern(),
      size: gridSize
    })
    navigator.clipboard.writeText(
      Buffer.from(encoded, 'utf8').toString('base64')
    )
  }

  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('xs'))
  return (
    <Dialog open={open} onClose={onClose} fullWidth fullScreen={isMobile}>
      <form onSubmit={save}>
        <DialogTitle>
          {isMobile ? (
            <Grid
              container
              direction="row"
              justify="space-between"
              alignItems="center"
            >
              <Typography variant="h6">Save a pattern</Typography>
              <IconButton onClick={onClose}>
                <CloseIcon></CloseIcon>
              </IconButton>
            </Grid>
          ) : (
            'Save a pattern'
          )}
        </DialogTitle>
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
            <IconButton
              onClick={exportClipboard}
              style={{ marginRight: 'auto' }}
            >
              <PublishIcon></PublishIcon>
            </IconButton>
          </Tooltip>

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
export default SavingModal
