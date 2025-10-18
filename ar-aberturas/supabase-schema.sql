-- Esquema de base de datos para el sistema de gestión de stock de aberturas
-- Compatible con Supabase/PostgreSQL

-- Tabla de categorías principales
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de subcategorías
CREATE TABLE subcategories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(category_id, name)
);

-- Tabla de proveedores
CREATE TABLE suppliers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  contact_person VARCHAR(100),
  email VARCHAR(100),
  phone VARCHAR(20),
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de ubicaciones de almacén
CREATE TABLE locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla principal de stock
CREATE TABLE stock_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  subcategory_id UUID REFERENCES subcategories(id) ON DELETE SET NULL,
  material VARCHAR(20) NOT NULL CHECK (material IN ('aluminio', 'pvc')),
  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  unit VARCHAR(20) NOT NULL,
  min_stock INTEGER NOT NULL DEFAULT 0 CHECK (min_stock >= 0),
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  
  -- Campos específicos para perfiles
  length_mm INTEGER,
  width_mm INTEGER,
  thickness_mm DECIMAL(4,2),
  color VARCHAR(50),
  finish VARCHAR(50),
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  product_code VARCHAR(50),
  unit_price DECIMAL(10,2),
  expiration_date DATE,
  notes TEXT,
  
  -- Metadatos
  last_update TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Índices para búsquedas frecuentes
  CONSTRAINT unique_product_code UNIQUE(product_code)
);

-- Tabla de movimientos de stock (historial)
CREATE TABLE stock_movements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stock_item_id UUID REFERENCES stock_items(id) ON DELETE CASCADE,
  movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('entrada', 'salida', 'ajuste')),
  quantity INTEGER NOT NULL,
  reason VARCHAR(200),
  reference VARCHAR(100), -- Número de factura, orden de compra, etc.
  user_id UUID, -- Referencia a usuario que hizo el movimiento
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de alertas de stock bajo
CREATE TABLE stock_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stock_item_id UUID REFERENCES stock_items(id) ON DELETE CASCADE,
  alert_type VARCHAR(20) NOT NULL CHECK (alert_type IN ('low_stock', 'out_of_stock', 'expiring')),
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID, -- Referencia a usuario que resolvió la alerta
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar datos iniciales
INSERT INTO categories (name, description) VALUES
('Perfiles', 'Perfiles de aluminio y PVC para marcos y estructuras'),
('Vidrios', 'Diferentes tipos y espesores de vidrio'),
('Herrajes', 'Manijas, bisagras, cerraduras y otros herrajes'),
('Accesorios', 'Sellos, tornillos, anclajes y otros accesorios');

INSERT INTO subcategories (category_id, name) VALUES
-- Perfiles de Aluminio
((SELECT id FROM categories WHERE name = 'Perfiles'), 'Marco'),
((SELECT id FROM categories WHERE name = 'Perfiles'), 'Travesaño'),
((SELECT id FROM categories WHERE name = 'Perfiles'), 'Montante'),
((SELECT id FROM categories WHERE name = 'Perfiles'), 'Jamba'),
((SELECT id FROM categories WHERE name = 'Perfiles'), 'Dintel'),
-- Vidrios
((SELECT id FROM categories WHERE name = 'Vidrios'), 'Simple'),
((SELECT id FROM categories WHERE name = 'Vidrios'), 'DVH'),
((SELECT id FROM categories WHERE name = 'Vidrios'), 'TVH'),
((SELECT id FROM categories WHERE name = 'Vidrios'), 'Laminado'),
((SELECT id FROM categories WHERE name = 'Vidrios'), 'Templado'),
-- Herrajes
((SELECT id FROM categories WHERE name = 'Herrajes'), 'Manijas'),
((SELECT id FROM categories WHERE name = 'Herrajes'), 'Bisagras'),
((SELECT id FROM categories WHERE name = 'Herrajes'), 'Cerraduras'),
-- Accesorios
((SELECT id FROM categories WHERE name = 'Accesorios'), 'Sellos'),
((SELECT id FROM categories WHERE name = 'Accesorios'), 'Tornillos'),
((SELECT id FROM categories WHERE name = 'Accesorios'), 'Otros');

INSERT INTO locations (name, description) VALUES
('Depósito A', 'Almacén principal - Perfiles y estructuras'),
('Depósito B', 'Almacén secundario - Vidrios y materiales frágiles'),
('Depósito C', 'Almacén de accesorios y herrajes');

INSERT INTO suppliers (name, contact_person, email, phone) VALUES
('Aluminios del Sur', 'Juan Pérez', 'ventas@aluminiosdelsur.com', '+54 351 123-4567'),
('PVC Solutions', 'María González', 'info@pvcsolutions.com', '+54 351 234-5678'),
('Vidrios Premium', 'Roberto Silva', 'comercial@vidriospremium.com', '+54 351 345-6789');

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subcategories_updated_at BEFORE UPDATE ON subcategories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stock_items_updated_at BEFORE UPDATE ON stock_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para crear alertas automáticas de stock bajo
CREATE OR REPLACE FUNCTION check_low_stock()
RETURNS TRIGGER AS $$
BEGIN
    -- Crear alerta si el stock está por debajo del mínimo
    IF NEW.quantity <= NEW.min_stock THEN
        INSERT INTO stock_alerts (stock_item_id, alert_type)
        VALUES (NEW.id, 
                CASE 
                    WHEN NEW.quantity = 0 THEN 'out_of_stock'
                    ELSE 'low_stock'
                END);
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para alertas de stock bajo
CREATE TRIGGER check_low_stock_trigger AFTER UPDATE ON stock_items
    FOR EACH ROW EXECUTE FUNCTION check_low_stock();

-- Vista para obtener información completa de stock con joins
CREATE VIEW stock_items_full AS
SELECT 
    si.id,
    si.name,
    si.material,
    si.quantity,
    si.unit,
    si.min_stock,
    si.length_mm,
    si.width_mm,
    si.thickness_mm,
    si.color,
    si.finish,
    si.product_code,
    si.unit_price,
    si.expiration_date,
    si.notes,
    si.last_update,
    si.created_at,
    si.updated_at,
    c.name as category_name,
    sc.name as subcategory_name,
    s.name as supplier_name,
    l.name as location_name,
    CASE 
        WHEN si.quantity = 0 THEN 'Sin stock'
        WHEN si.quantity <= si.min_stock THEN 'Stock bajo'
        ELSE 'Stock normal'
    END as stock_status
FROM stock_items si
LEFT JOIN categories c ON si.category_id = c.id
LEFT JOIN subcategories sc ON si.subcategory_id = sc.id
LEFT JOIN suppliers s ON si.supplier_id = s.id
LEFT JOIN locations l ON si.location_id = l.id;

-- Índices para mejorar el rendimiento
CREATE INDEX idx_stock_items_material ON stock_items(material);
CREATE INDEX idx_stock_items_category ON stock_items(category_id);
CREATE INDEX idx_stock_items_location ON stock_items(location_id);
CREATE INDEX idx_stock_items_supplier ON stock_items(supplier_id);
CREATE INDEX idx_stock_items_product_code ON stock_items(product_code);
CREATE INDEX idx_stock_movements_item_id ON stock_movements(stock_item_id);
CREATE INDEX idx_stock_movements_created_at ON stock_movements(created_at);
CREATE INDEX idx_stock_alerts_item_id ON stock_alerts(stock_item_id);
CREATE INDEX idx_stock_alerts_resolved ON stock_alerts(is_resolved);

-- Políticas de seguridad RLS (Row Level Security)
ALTER TABLE stock_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_alerts ENABLE ROW LEVEL SECURITY;

-- Política básica: permitir todas las operaciones para usuarios autenticados
-- (Esto se puede ajustar según los roles de usuario)
CREATE POLICY "Allow all operations for authenticated users" ON stock_items
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON stock_movements
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON stock_alerts
    FOR ALL USING (auth.role() = 'authenticated');
