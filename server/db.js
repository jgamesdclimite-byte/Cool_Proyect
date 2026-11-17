import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Lee server/.env sin importar desde qué carpeta se ejecute
dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '.env') })

export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'CoolBoxBD',
  waitForConnections: true,
  connectionLimit: 10,
  decimalNumbers: true,
  dateStrings: true,
})
