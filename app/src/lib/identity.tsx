import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useRider } from './store'
import type { Player } from './types'

const LS_ME = 'rider.me'
const LS_UNLOCK = 'rider.unlocked'
const LS_SPECTATOR = 'rider.spectator'

// Acceso a localStorage a prueba de fallos (modo privado / almacenamiento bloqueado
// pueden lanzar excepción; en ese caso degradamos sin romper la app).
const ls = {
  get: (k: string): string | null => {
    try {
      return localStorage.getItem(k)
    } catch {
      return null
    }
  },
  set: (k: string, v: string) => {
    try {
      localStorage.setItem(k, v)
    } catch {
      /* almacenamiento no disponible */
    }
  },
  del: (k: string) => {
    try {
      localStorage.removeItem(k)
    } catch {
      /* almacenamiento no disponible */
    }
  },
}

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
  const [meId, setMeId] = useState<string | null>(() => ls.get(LS_ME))
  const [unlocked, setUnlocked] = useState<boolean>(() => ls.get(LS_UNLOCK) === '1')
  const [spectator, setSpectator] = useState<boolean>(() => ls.get(LS_SPECTATOR) === '1')

  // limpia identidad si el id ya no existe
  useEffect(() => {
    if (meId && playersById.size > 0 && !playersById.get(meId)) {
      setMeId(null)
      ls.del(LS_ME)
    }
  }, [meId, playersById])

  const unlock = useCallback(
    (code: string) => {
      const ok = !!edition && code.trim().toUpperCase() === edition.access_code.toUpperCase()
      if (ok) {
        setUnlocked(true)
        ls.set(LS_UNLOCK, '1')
      }
      return ok
    },
    [edition],
  )

  const identify = useCallback((playerId: string) => {
    setMeId(playerId)
    setSpectator(false)
    ls.set(LS_ME, playerId)
    ls.del(LS_SPECTATOR)
  }, [])

  const spectate = useCallback(() => {
    setSpectator(true)
    ls.set(LS_SPECTATOR, '1')
  }, [])

  const logout = useCallback(() => {
    setMeId(null)
    setSpectator(false)
    ls.del(LS_ME)
    ls.del(LS_SPECTATOR)
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
