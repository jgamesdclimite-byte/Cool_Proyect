async function request(url, options = {}) {
  let res
  try {
    res = await fetch(`/api${url}`, options)
  } catch {
    throw new Error('No se pudo conectar con el servidor (¿está corriendo server/?)')
  }
  if (res.status === 204) return null
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `Error ${res.status}`)
  return data
}

const json = (method, body) => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})

export const api = {
  get: url => request(url),
  post: (url, body) => request(url, json('POST', body)),
  patch: (url, body) => request(url, json('PATCH', body)),
  del: url => request(url, { method: 'DELETE' }),
  form: (url, method, formData) => request(url, { method, body: formData }),
}

export const soles = n =>
  'S/ ' + Number(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export const descuento = p =>
  p.precio_antes && p.precio_antes > p.precio ? Math.round((1 - p.precio / p.precio_antes) * 100) : 0

export const ESTADOS = {
  ok: { label: 'En stock', cls: 'ok' },
  bajo: { label: 'Bajo stock', cls: 'bajo' },
  agotado: { label: 'Agotado', cls: 'agotado' },
}
