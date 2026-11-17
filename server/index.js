import express from 'express'
import cors from 'cors'
import multer from 'multer'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { pool } from './db.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// Las imágenes se guardan en la carpeta public/productos del frontend
const IMG_DIR = path.resolve(__dirname, '../public/productos')
fs.mkdirSync(IMG_DIR, { recursive: true })

const app = express()
app.use(cors())
app.use(express.json())
app.use('/productos', express.static(IMG_DIR))

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => cb(null, /^image\/(jpeg|png|webp)$/.test(file.mimetype)),
})

// "Laptop Acer Nitro V 15" + marca "Acer" -> "AcerNitroV15_Cool.jpg"
function nombreImagen(base, ext) {
  const limpio = String(base)
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9 ]/g, ' ')
    .split(/\s+/).filter(Boolean)
    .map(p => p[0].toUpperCase() + p.slice(1))
    .join('')
    .slice(0, 40)
  return `${limpio || 'Producto'}_Cool${ext}`
}

// Marca + modelo, sin palabras genéricas: "Laptop Acer Nitro V" -> "Acer Nitro V"
const GENERICAS = /^(laptop|impresora|multifuncional|audifonos|audífonos|gamer|celular|teclado|mouse|consola|parlante|bluetooth|kit|de|para|con|y)$/i
function baseImagen(p) {
  const palabras = p.nombre.split(/\s+/).filter(w => !GENERICAS.test(w) && w.toLowerCase() !== p.marca.toLowerCase())
  return [p.marca, ...palabras.slice(0, 2)].join(' ')
}

function guardarImagen(file, base) {
  const ext = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' }[file.mimetype]
  const nombre = nombreImagen(base, ext)
  fs.writeFileSync(path.join(IMG_DIR, nombre), file.buffer)
  return nombre
}

const wrap = fn => (req, res) =>
  fn(req, res).catch(err => {
    console.error(err)
    res.status(err.status || 500).json({ error: err.status ? err.message : 'Error interno del servidor' })
  })

const fail = (status, message) => Object.assign(new Error(message), { status })

function validarProducto(b) {
  const p = {
    nombre: String(b.nombre || '').trim(),
    marca: String(b.marca || '').trim(),
    id_categoria: Number(b.id_categoria),
    descripcion: String(b.descripcion || '').trim() || null,
    precio: Number(b.precio),
    precio_antes: b.precio_antes === '' || b.precio_antes == null ? null : Number(b.precio_antes),
    stock: Number(b.stock),
    stock_minimo: b.stock_minimo === '' || b.stock_minimo == null ? 5 : Number(b.stock_minimo),
    imagen: String(b.imagen || '').trim(),
  }
  if (!p.nombre || !p.marca) throw fail(400, 'Nombre y marca son obligatorios')
  if (!Number.isInteger(p.id_categoria)) throw fail(400, 'Selecciona una categoría')
  if (!(p.precio >= 0)) throw fail(400, 'Precio inválido')
  if (p.precio_antes != null && !(p.precio_antes >= 0)) throw fail(400, 'Precio anterior inválido')
  if (!Number.isInteger(p.stock) || p.stock < 0) throw fail(400, 'Stock inválido')
  if (!Number.isInteger(p.stock_minimo) || p.stock_minimo < 0) throw fail(400, 'Stock mínimo inválido')
  return p
}

const SELECT_PRODUCTO = `
  SELECT p.*, c.nombre AS categoria, c.icono,
         CASE WHEN p.stock = 0 THEN 'agotado'
              WHEN p.stock <= p.stock_minimo THEN 'bajo'
              ELSE 'ok' END AS estado_stock
  FROM productos p JOIN categorias c ON c.id_categoria = p.id_categoria`

// ---------- Categorías ----------
app.get('/api/categorias', wrap(async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM categorias ORDER BY nombre')
  res.json(rows)
}))

// ---------- Productos (CRUD) ----------
app.get('/api/productos', wrap(async (_req, res) => {
  const [rows] = await pool.query(`${SELECT_PRODUCTO} ORDER BY p.id_producto DESC`)
  res.json(rows)
}))

app.get('/api/productos/:id', wrap(async (req, res) => {
  const [rows] = await pool.query(`${SELECT_PRODUCTO} WHERE p.id_producto = ?`, [req.params.id])
  if (!rows.length) throw fail(404, 'Producto no encontrado')
  res.json(rows[0])
}))

app.post('/api/productos', upload.single('archivo'), wrap(async (req, res) => {
  const p = validarProducto(req.body)
  if (req.file) p.imagen = guardarImagen(req.file, baseImagen(p))
  if (!p.imagen) p.imagen = nombreImagen(baseImagen(p), '.jpg')
  const [r] = await pool.query(
    `INSERT INTO productos (nombre, marca, id_categoria, descripcion, precio, precio_antes, stock, stock_minimo, imagen)
     VALUES (?,?,?,?,?,?,?,?,?)`,
    [p.nombre, p.marca, p.id_categoria, p.descripcion, p.precio, p.precio_antes, p.stock, p.stock_minimo, p.imagen])
  const [rows] = await pool.query(`${SELECT_PRODUCTO} WHERE p.id_producto = ?`, [r.insertId])
  res.status(201).json(rows[0])
}))

app.put('/api/productos/:id', upload.single('archivo'), wrap(async (req, res) => {
  const p = validarProducto(req.body)
  if (req.file) p.imagen = guardarImagen(req.file, baseImagen(p))
  const [r] = await pool.query(
    `UPDATE productos SET nombre=?, marca=?, id_categoria=?, descripcion=?, precio=?, precio_antes=?,
            stock=?, stock_minimo=?, imagen=COALESCE(NULLIF(?, ''), imagen)
     WHERE id_producto = ?`,
    [p.nombre, p.marca, p.id_categoria, p.descripcion, p.precio, p.precio_antes, p.stock, p.stock_minimo, p.imagen, req.params.id])
  if (!r.affectedRows) throw fail(404, 'Producto no encontrado')
  const [rows] = await pool.query(`${SELECT_PRODUCTO} WHERE p.id_producto = ?`, [req.params.id])
  res.json(rows[0])
}))

app.patch('/api/productos/:id/stock', wrap(async (req, res) => {
  const delta = Number(req.body.delta)
  if (!Number.isInteger(delta)) throw fail(400, 'Cantidad inválida')
  const [r] = await pool.query(
    'UPDATE productos SET stock = stock + ? WHERE id_producto = ? AND stock + ? >= 0',
    [delta, req.params.id, delta])
  if (!r.affectedRows) throw fail(400, 'El stock no puede quedar negativo')
  const [rows] = await pool.query(`${SELECT_PRODUCTO} WHERE p.id_producto = ?`, [req.params.id])
  res.json(rows[0])
}))

app.delete('/api/productos/:id', wrap(async (req, res) => {
  const [[{ n }]] = await pool.query('SELECT COUNT(*) n FROM detalle_venta WHERE id_producto = ?', [req.params.id])
  if (n > 0) throw fail(409, 'No se puede eliminar: el producto tiene ventas registradas')
  const [r] = await pool.query('DELETE FROM productos WHERE id_producto = ?', [req.params.id])
  if (!r.affectedRows) throw fail(404, 'Producto no encontrado')
  res.status(204).end()
}))

// ---------- Clientes ----------
app.get('/api/clientes/:dni', wrap(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM clientes WHERE dni = ?', [req.params.dni])
  if (!rows.length) throw fail(404, 'Cliente nuevo')
  res.json(rows[0])
}))

// ---------- Ventas ----------
app.get('/api/ventas', wrap(async (_req, res) => {
  const [rows] = await pool.query(`
    SELECT v.id_venta, v.fecha, v.total, c.nombre AS cliente, c.dni,
           SUM(d.cantidad) AS unidades
    FROM ventas v
    JOIN clientes c ON c.id_cliente = v.id_cliente
    JOIN detalle_venta d ON d.id_venta = v.id_venta
    GROUP BY v.id_venta ORDER BY v.id_venta DESC LIMIT 50`)
  res.json(rows)
}))

app.get('/api/ventas/:id', wrap(async (req, res) => {
  const [[venta]] = await pool.query(`
    SELECT v.*, c.nombre AS cliente, c.dni FROM ventas v
    JOIN clientes c ON c.id_cliente = v.id_cliente WHERE v.id_venta = ?`, [req.params.id])
  if (!venta) throw fail(404, 'Venta no encontrada')
  const [items] = await pool.query(`
    SELECT d.*, p.nombre, p.marca, p.imagen FROM detalle_venta d
    JOIN productos p ON p.id_producto = d.id_producto WHERE d.id_venta = ?`, [req.params.id])
  res.json({ ...venta, items })
}))

app.post('/api/ventas', wrap(async (req, res) => {
  const nombre = String(req.body?.cliente?.nombre || '').trim()
  const dni = String(req.body?.cliente?.dni || '').trim()
  const items = Array.isArray(req.body?.items) ? req.body.items : []
  if (!nombre) throw fail(400, 'Ingresa el nombre del cliente')
  if (!/^\d{8}$/.test(dni)) throw fail(400, 'El DNI debe tener 8 dígitos')
  if (!items.length) throw fail(400, 'Agrega al menos un producto')

  // Agrupar cantidades por producto
  const cant = new Map()
  for (const it of items) {
    const id = Number(it.id_producto), q = Number(it.cantidad)
    if (!Number.isInteger(id) || !Number.isInteger(q) || q <= 0) throw fail(400, 'Detalle de venta inválido')
    cant.set(id, (cant.get(id) || 0) + q)
  }

  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    const ids = [...cant.keys()]
    const [prods] = await conn.query(
      'SELECT id_producto, nombre, precio, stock FROM productos WHERE id_producto IN (?) FOR UPDATE', [ids])
    if (prods.length !== ids.length) throw fail(400, 'Algún producto ya no existe')
    for (const p of prods) {
      if (p.stock < cant.get(p.id_producto)) throw fail(409, `Stock insuficiente para "${p.nombre}" (quedan ${p.stock})`)
    }

    await conn.query(
      'INSERT INTO clientes (nombre, dni) VALUES (?, ?) ON DUPLICATE KEY UPDATE nombre = VALUES(nombre)', [nombre, dni])
    const [[cli]] = await conn.query('SELECT id_cliente FROM clientes WHERE dni = ?', [dni])

    const total = prods.reduce((s, p) => s + p.precio * cant.get(p.id_producto), 0)
    const [v] = await conn.query('INSERT INTO ventas (id_cliente, total) VALUES (?, ?)', [cli.id_cliente, total.toFixed(2)])

    for (const p of prods) {
      const q = cant.get(p.id_producto)
      await conn.query(
        'INSERT INTO detalle_venta (id_venta, id_producto, cantidad, precio_unitario, subtotal) VALUES (?,?,?,?,?)',
        [v.insertId, p.id_producto, q, p.precio, (p.precio * q).toFixed(2)])
      await conn.query('UPDATE productos SET stock = stock - ? WHERE id_producto = ?', [q, p.id_producto])
    }
    await conn.commit()
    res.status(201).json({ id_venta: v.insertId, total: Number(total.toFixed(2)) })
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
}))

app.delete('/api/ventas/:id', wrap(async (req, res) => {
  // Anular venta: devuelve el stock
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    const [items] = await conn.query('SELECT id_producto, cantidad FROM detalle_venta WHERE id_venta = ?', [req.params.id])
    for (const it of items) {
      await conn.query('UPDATE productos SET stock = stock + ? WHERE id_producto = ?', [it.cantidad, it.id_producto])
    }
    const [r] = await conn.query('DELETE FROM ventas WHERE id_venta = ?', [req.params.id])
    if (!r.affectedRows) throw fail(404, 'Venta no encontrada')
    await conn.commit()
    res.status(204).end()
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
}))

// ---------- Resumen ----------
app.get('/api/resumen', wrap(async (_req, res) => {
  const [[r]] = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM productos) AS productos,
      (SELECT COALESCE(SUM(stock),0) FROM productos) AS unidades,
      (SELECT COUNT(*) FROM productos WHERE stock > 0 AND stock <= stock_minimo) AS bajo_stock,
      (SELECT COUNT(*) FROM productos WHERE stock = 0) AS agotados,
      (SELECT COUNT(*) FROM ventas) AS ventas,
      (SELECT COALESCE(SUM(total),0) FROM ventas) AS ingresos,
      (SELECT COALESCE(SUM(precio*stock),0) FROM productos) AS valor_inventario`)
  res.json(r)
}))

// ---------- Estadísticas para el panel de inicio ----------
app.get('/api/estadisticas', wrap(async (_req, res) => {
  const [diasRaw] = await pool.query(`
    SELECT DATE(fecha) AS dia, COUNT(*) AS ventas, SUM(total) AS total
    FROM ventas WHERE fecha >= CURDATE() - INTERVAL 6 DAY
    GROUP BY DATE(fecha)`)
  // Rellenar los 7 días aunque no haya ventas
  const porDia = new Map(diasRaw.map(d => [String(d.dia).slice(0, 10), d]))
  const dias = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const r = porDia.get(key)
    dias.push({ dia: key, ventas: r ? Number(r.ventas) : 0, total: r ? Number(r.total) : 0 })
  }
  const [top] = await pool.query(`
    SELECT p.id_producto, p.nombre, p.marca, p.imagen,
           SUM(d.cantidad) AS unidades, SUM(d.subtotal) AS monto
    FROM detalle_venta d JOIN productos p ON p.id_producto = d.id_producto
    GROUP BY p.id_producto ORDER BY unidades DESC, monto DESC LIMIT 5`)
  const [categorias] = await pool.query(`
    SELECT c.id_categoria, c.nombre, c.icono, COUNT(p.id_producto) AS productos, COALESCE(SUM(p.stock),0) AS unidades
    FROM categorias c LEFT JOIN productos p ON p.id_categoria = c.id_categoria
    GROUP BY c.id_categoria ORDER BY unidades DESC`)
  res.json({ dias, top, categorias })
}))

app.use('/api', (_req, res) => res.status(404).json({ error: 'Ruta no encontrada' }))
app.use((err, _req, res, _next) => {
  res.status(400).json({ error: err.code === 'LIMIT_FILE_SIZE' ? 'La imagen supera 5MB' : err.message })
})

const PORT = Number(process.env.PORT || 3001)
app.listen(PORT, () => console.log(`⬡ CoolBox API escuchando en http://localhost:${PORT}`))
