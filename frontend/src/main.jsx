import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { ThemeProvider, createGlobalStyle } from 'styled-components'

import App from './App'
import theme from './styles/theme'

const GlobalStyle = createGlobalStyle`
  :root {
    font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    color-scheme: only light;
  }

  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    min-height: 100vh;
    background: radial-gradient(circle at top, #4a1e8b, #120020);
    color: #fff;
  }

  #root {
    min-height: 100vh;
  }
`

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <HashRouter>
        <GlobalStyle />
        <App />
      </HashRouter>
    </ThemeProvider>
  </React.StrictMode>
)
