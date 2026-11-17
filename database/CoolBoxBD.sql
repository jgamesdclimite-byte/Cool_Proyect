-- =========================================================
--  CoolBoxBD  ·  Tecnología & Electrónica
--  Script de creación + datos iniciales (MySQL / MariaDB)
-- =========================================================
CREATE DATABASE IF NOT EXISTS CoolBoxBD
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE CoolBoxBD;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS detalle_venta;
DROP TABLE IF EXISTS ventas;
DROP TABLE IF EXISTS clientes;
DROP TABLE IF EXISTS productos;
DROP TABLE IF EXISTS categorias;
SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------
CREATE TABLE categorias (
  id_categoria INT AUTO_INCREMENT PRIMARY KEY,
  nombre       VARCHAR(60) NOT NULL UNIQUE,
  icono        VARCHAR(10) NOT NULL DEFAULT '⬡'
) ENGINE=InnoDB;

CREATE TABLE productos (
  id_producto   INT AUTO_INCREMENT PRIMARY KEY,
  nombre        VARCHAR(120)  NOT NULL,
  marca         VARCHAR(60)   NOT NULL,
  id_categoria  INT           NOT NULL,
  descripcion   VARCHAR(400)  NULL,
  precio        DECIMAL(10,2) NOT NULL CHECK (precio >= 0),
  precio_antes  DECIMAL(10,2) NULL,
  stock         INT           NOT NULL DEFAULT 0 CHECK (stock >= 0),
  stock_minimo  INT           NOT NULL DEFAULT 5,
  imagen        VARCHAR(150)  NOT NULL,
  creado_en     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_prod_cat FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria)
) ENGINE=InnoDB;

CREATE TABLE clientes (
  id_cliente INT AUTO_INCREMENT PRIMARY KEY,
  nombre     VARCHAR(120) NOT NULL,
  dni        CHAR(8)      NOT NULL UNIQUE,
  creado_en  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE ventas (
  id_venta   INT AUTO_INCREMENT PRIMARY KEY,
  id_cliente INT           NOT NULL,
  fecha      DATETIME      DEFAULT CURRENT_TIMESTAMP,
  total      DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_venta_cli FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente)
) ENGINE=InnoDB;

CREATE TABLE detalle_venta (
  id_detalle      INT AUTO_INCREMENT PRIMARY KEY,
  id_venta        INT           NOT NULL,
  id_producto     INT           NOT NULL,
  cantidad        INT           NOT NULL CHECK (cantidad > 0),
  precio_unitario DECIMAL(10,2) NOT NULL,
  subtotal        DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_det_venta FOREIGN KEY (id_venta)    REFERENCES ventas(id_venta) ON DELETE CASCADE,
  CONSTRAINT fk_det_prod  FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
INSERT INTO categorias (nombre, icono) VALUES
 ('Laptops','💻'), ('Impresoras','🖨'), ('Gamer','🎮'), ('Audio','🎧'),
 ('Celulares','📱'), ('Tablets','📲'), ('Smart Home','🏠'), ('Accesorios de cómputo','⌨');

-- Imágenes: colocar los archivos en  public/productos/<imagen>
INSERT INTO productos (nombre, marca, id_categoria, descripcion, precio, precio_antes, stock, stock_minimo, imagen) VALUES
 ('Laptop Acer Nitro V 15 i5 RTX 4050',      'Acer',     1, 'Intel Core i5-13420H, 16GB RAM, 512GB SSD, RTX 4050 6GB, pantalla 15.6" FHD 144Hz.', 3899.00, 4499.00, 12, 4, 'AcerNitro_Cool.jpg'),
 ('Laptop Lenovo IdeaPad Slim 3 Ryzen 7',    'Lenovo',   1, 'AMD Ryzen 7 7730U, 16GB RAM, 512GB SSD, 15.6" FHD IPS.',                             2499.00, 2899.00,  3, 4, 'LenovoIdeaPad_Cool.jpg'),
 ('Laptop HP Victus 15 Ryzen 5 RTX 3050',    'HP',       1, 'AMD Ryzen 5 7535HS, 8GB RAM, 512GB SSD, RTX 3050, 15.6" 144Hz.',                     3199.00, 3599.00,  7, 3, 'HPVictus_Cool.jpg'),
 ('Impresora Multifuncional EcoTank L3250',  'Epson',    2, 'Imprime, copia y escanea. Wi-Fi, sistema de tinta continua original.',               699.90,  799.00, 18, 5, 'EpsonL3250_Cool.jpg'),
 ('Impresora Multifuncional EcoTank L4260',  'Epson',    2, 'Impresión dúplex automática, Wi-Fi Direct, tanques de tinta.',                       799.90,  899.00,  9, 4, 'EpsonL4260_Cool.jpg'),
 ('Impresora Multifuncional DCP-T730DW',     'Brother',  2, 'Tinta continua, dúplex, ADF de 20 hojas y Wi-Fi.',                                   829.90,  949.00,  2, 4, 'BrotherDCPT730_Cool.jpg'),
 ('Audífonos Gamer BlackShark V2 X',         'Razer',    3, 'Sonido envolvente 7.1, micrófono cardioide, drivers TriForce 50mm.',                 249.00,  329.00, 15, 5, 'RazerBlackShark_Cool.jpg'),
 ('Audífonos Gamer G335',                    'Logitech', 3, 'Livianos (240g), conexión 3.5mm, micrófono abatible.',                               229.00,  279.00,  0, 5, 'LogitechG335_Cool.jpg'),
 ('Teclado Mecánico Kumara K552 RGB',        'Redragon', 3, 'Switches Outemu Red, TKL, iluminación RGB, estructura metálica.',                    159.00,  199.00, 22, 6, 'RedragonKumara_Cool.jpg'),
 ('Mouse Gamer G502 HERO',                   'Logitech', 3, 'Sensor HERO 25K, 11 botones programables, pesos ajustables.',                       199.00,  259.00,  4, 5, 'LogitechG502_Cool.jpg'),
 ('Consola PlayStation 5 Slim',              'Sony',     3, 'Edición estándar 1TB, mando DualSense incluido.',                                   2499.00, 2799.00,  6, 3, 'PS5Slim_Cool.jpg'),
 ('Parlante Bluetooth Charge 5',             'JBL',      4, 'Resistente al agua IP67, 20h de batería, powerbank integrado.',                      699.90,  799.00, 11, 4, 'JBLCharge5_Cool.jpg'),
 ('Audífonos WH-1000XM5',                    'Sony',     4, 'Cancelación de ruido líder, 30h de batería, carga rápida.',                         1499.00, 1799.00,  1, 3, 'SonyWH1000XM5_Cool.jpg'),
 ('AirPods Pro (2da generación) USB-C',      'Apple',    4, 'Cancelación activa de ruido, audio espacial, estuche MagSafe.',                      1199.00, 1399.00,  8, 3, 'AirPodsPro2_Cool.jpg'),
 ('Celular Galaxy A55 5G 256GB',             'Samsung',  5, 'Pantalla Super AMOLED 6.6" 120Hz, cámara 50MP, 8GB RAM.',                           1599.00, 1899.00, 14, 5, 'GalaxyA55_Cool.jpg'),
 ('Celular Redmi Note 13 Pro 256GB',         'Xiaomi',   5, 'Cámara 200MP, AMOLED 120Hz, carga turbo 67W.',                                     1299.00, 1499.00,  3, 5, 'RedmiNote13Pro_Cool.jpg'),
 ('iPad 10.9" Wi-Fi 64GB',                   'Apple',    6, 'Chip A14 Bionic, pantalla Liquid Retina, USB-C.',                                  1599.00, 1899.00,  5, 3, 'iPad10_Cool.jpg'),
 ('Echo Dot 5ta generación',                 'Amazon',   7, 'Parlante inteligente con Alexa, sonido mejorado, sensor de temperatura.',            319.00,  369.00, 20, 6, 'EchoDot5_Cool.jpg'),
 ('Kit Starlink Mini',                       'Starlink', 7, 'Antena compacta de internet satelital con Wi-Fi integrado.',                       1499.00, NULL,     2, 3, 'StarlinkMini_Cool.jpg'),
 ('SSD NVMe NV2 1TB',                        'Kingston', 8, 'PCIe 4.0 NVMe, hasta 3500 MB/s de lectura.',                                       279.00,  329.00, 25, 8, 'KingstonNV2_Cool.jpg'),
 ('Mochila para Laptop 15.6" Groove',        'Xtech',    8, 'Compartimento acolchado, resistente al agua, puerto USB.',                          129.00,  159.00,  6, 6, 'XtechMochila_Cool.jpg');

INSERT INTO clientes (nombre, dni) VALUES
 ('Cliente de prueba', '12345678');

INSERT INTO ventas (id_cliente, total) VALUES (1, 948.90);
INSERT INTO detalle_venta (id_venta, id_producto, cantidad, precio_unitario, subtotal) VALUES
 (1, 4, 1, 699.90, 699.90),
 (1, 7, 1, 249.00, 249.00);
