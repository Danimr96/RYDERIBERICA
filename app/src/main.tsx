import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import { RiderProvider } from './lib/store'
import { IdentityProvider } from './lib/identity'
import App from './App'
import Home from './pages/Home'
import Matches from './pages/Matches'
import MatchEntry from './pages/MatchEntry'
import Teams from './pages/Teams'
import PlayerPage from './pages/PlayerPage'
import Draw from './pages/Draw'
import Palmares from './pages/Palmares'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'partidos', element: <Matches /> },
      { path: 'partido/:id', element: <MatchEntry /> },
      { path: 'equipos', element: <Teams /> },
      { path: 'jugador/:id', element: <PlayerPage /> },
      { path: 'sorteo', element: <Draw /> },
      { path: 'palmares', element: <Palmares /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RiderProvider>
      <IdentityProvider>
        <RouterProvider router={router} />
      </IdentityProvider>
    </RiderProvider>
  </StrictMode>,
)
