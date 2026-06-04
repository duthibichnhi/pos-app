import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Simulation from './Simulation.jsx'

const isDemo = new URLSearchParams(window.location.search).has('demo')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isDemo ? <Simulation /> : <App />}
  </StrictMode>,
)
