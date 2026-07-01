import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useRider } from './store'
import type { Player } from './types'

const LS_ME = 'rider.me'
const LS_UNLOCK = 'rider.unlocked'

interface Identity {
  ready: boolean // ya puede usar la app (código ok + identidad o espectador)
  unlocked: boolean
  me: Player | null
  isAdmin: boolean
  isSpectator: boolean
  unlock: (code: string) => boolean
  identify: (playerId: string) => void
  spectate: () => void
  logout: () => void
  /** ¿puede esta persona puntuar este partido? */
  canScore: (playerIds: string[]) => boolean
}

const Ctx = createContext<Identity | null>(null)

export function IdentityProvider({ children }: { children: ReactNode }) {
  const { edition, playersById } = useRider()
  const [meId, setMeId] = useState<string | null>(() => localStorage.getItem(LS_ME))
  const [unlocked, setUnlocked] = useState<boolean>(() => localStorage.getItem(LS_UNLOCK) === '1')
  const [spectator, setSpectator] = useState(false)

  // limpia identidad si el id ya no existe
  useEffect(() => {
    if (meId && playersById.size > 0 && !playersById.get(meId)) {
      setMeId(null)
      localStorage.removeItem(LS_ME)
    }
  }, [meId, playersById])

  const unlock = useCallback(
    (code: string) => {
      const ok = !!edition && code.trim().toUpperCase() === edition.access_code.toUpperCase()
      if (ok) {
        setUnlocked(true)
        localStorage.setItem(LS_UNLOCK, '1')
      }
      return ok
    },
    [edition],
  )

  const identify = useCallback((playerId: string) => {
    setMeId(playerId)
    setSpectator(false)
    localStorage.setItem(LS_ME, playerId)
  }, [])

  const spectate = useCallback(() => setSpectator(true), [])

  const logout = useCallback(() => {
    setMeId(null)
    setSpectator(false)
    localStorage.removeItem(LS_ME)
  }, [])

  const me = meId ? playersById.get(meId) ?? null : null

  const isAdmin = !!me?.is_admin

  const canScore = useCallback(
    (playerIds: string[]) => {
      if (!me) return false
      if (me.is_captain || me.is_admin) return true
      return playerIds.includes(me.id)
    },
    [me],
  )

  const ready = unlocked && (!!me || spectator)

  const value = useMemo<Identity>(
    () => ({ ready, unlocked, me, isAdmin, isSpectator: spectator, unlock, identify, spectate, logout, canScore }),
    [ready, unlocked, me, isAdmin, spectator, unlock, identify, spectate, logout, canScore],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useIdentity() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useIdentity dentro de <IdentityProvider>')
  return v
}
