import { useCallback, useEffect, useState } from 'react'
import { api } from '../api.js'

// Carga productos y categorías desde CoolBoxBD
export default function useCatalogo() {
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const recargar = useCallback(async () => {
    try {
      const [p, c] = await Promise.all([api.get('/productos'), api.get('/categorias')])
      setProductos(p)
      setCategorias(c)
      setError('')
    } catch (e) {
      setError(e.message)
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    recargar()
  }, [recargar])

  return { productos, setProductos, categorias, cargando, error, recargar }
}
