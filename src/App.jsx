import { Route, Routes, useLocation } from 'react-router-dom'
import './App.css'
import TopBar from './components/TopBar.jsx'
import Dock from './components/Dock.jsx'
import Inicio from './pages/Inicio.jsx'
import Productos from './pages/Productos.jsx'
import Venta from './pages/Venta.jsx'
import Inventario from './pages/Inventario.jsx'
import Contacto from './pages/Contacto.jsx'

function App() {
  const location = useLocation()
  return (
    <div className="app">
      <div className="hex-bg" aria-hidden="true" />
      <TopBar />
      <main className="stage" key={location.pathname}>
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/venta" element={<Venta />} />
          <Route path="/inventario" element={<Inventario />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="*" element={<Inicio />} />
        </Routes>
      </main>
      <Dock />
    </div>
  )
}

export default App
