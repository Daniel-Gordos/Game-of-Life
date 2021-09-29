import { createTheme, CssBaseline } from '@material-ui/core'
import { ThemeProvider } from '@material-ui/styles'
import { FC } from 'react'
import Main from './components/main'

const theme = createTheme({
  palette: {
    type: "dark",
  }
})

const App:FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline>
        <Main></Main>
      </CssBaseline>
    </ThemeProvider>
  )
}

export default App
