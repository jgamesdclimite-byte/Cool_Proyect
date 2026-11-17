# Coolbox · Tecnología & Electrónica — CRUD

Sistema de gestión para una tienda Coolbox: productos (CRUD), punto de venta,
inventario con alertas de stock e información de contacto.

- **Frontend:** React 19 + Vite (`src/`, archivos `.jsx`, `index.html`)
- **Backend:** Node + Express + mysql2 (`server/`)
- **Base de datos:** MySQL / MariaDB → `CoolBoxBD` (`database/CoolBoxBD.sql`)

## 1. Base de datos

En phpMyAdmin (XAMPP) importa `database/CoolBoxBD.sql`, o por consola:

```bash
mysql -u root < database/CoolBoxBD.sql
```

> El script **borra y recrea** las tablas de `CoolBoxBD` con los datos iniciales.

Tablas: `categorias`, `productos`, `clientes`, `ventas`, `detalle_venta`.

## 2. Backend (puerto 3001)

```bash
cd server
npm install
cp .env.example .env   # ajusta usuario/clave de MySQL si hace falta
npm start
```

## 3. Frontend (puerto 5173)

```bash
npm install
npm run dev
```

Abre http://localhost:5173 — Vite redirige `/api` al backend.

## Imágenes de productos

Van en `public/productos/` con el formato **`MarcaModelo_Cool.ext`**.
Si falta una imagen, la tarjeta muestra un placeholder con el nombre de archivo esperado.
Al crear o editar un producto puedes subir la imagen y se guarda automáticamente con ese formato.

Archivos que espera la base de datos inicial:

- AcerNitro_Cool.jpg
- LenovoIdeaPad_Cool.jpg
- HPVictus_Cool.jpg
- EpsonL3250_Cool.jpg
- EpsonL4260_Cool.jpg
- BrotherDCPT730_Cool.jpg
- RazerBlackShark_Cool.jpg
- LogitechG335_Cool.jpg
- RedragonKumara_Cool.jpg
- LogitechG502_Cool.jpg
- PS5Slim_Cool.jpg
- JBLCharge5_Cool.jpg
- SonyWH1000XM5_Cool.jpg
- AirPodsPro2_Cool.jpg
- GalaxyA55_Cool.jpg
- RedmiNote13Pro_Cool.jpg
- iPad10_Cool.jpg
- EchoDot5_Cool.jpg
- StarlinkMini_Cool.jpg
- KingstonNV2_Cool.jpg
- XtechMochila_Cool.jpg

## Pantallas

| Ruta | Qué hace |
|---|---|
| `/` | Inicio: hero de marca, métricas en vivo, categorías y ofertas |
| `/productos` | CRUD: crear, editar (panel lateral), eliminar, buscar y filtrar |
| `/venta` | Punto de venta: agrega productos, nombre + DNI del cliente, boleta imprimible, historial y anulación |
| `/inventario` | Stock por producto; **bajo stock** y **agotado** resaltados en rojo; ajuste rápido ± |
| `/contacto` | Mapa, horario, web y redes (editar en `src/data/tienda.js`) |

## API

| Método | Ruta |
|---|---|
| GET | `/api/productos`, `/api/productos/:id`, `/api/categorias`, `/api/resumen` |
| POST / PUT / DELETE | `/api/productos[/:id]` (multipart, campo `archivo` para imagen) |
| PATCH | `/api/productos/:id/stock` `{ delta }` |
| GET | `/api/clientes/:dni` |
| GET / POST | `/api/ventas` `{ cliente: { nombre, dni }, items: [{ id_producto, cantidad }] }` |
| GET / DELETE | `/api/ventas/:id` (DELETE anula y devuelve stock) |
