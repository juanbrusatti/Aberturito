"use client"

import { useState } from "react"
import { StockAddDialog } from "../../utils/stock/stock-add-dialog"
import { StockStats } from "../../utils/stock/stock-stats"
import { StockLowAlert } from "../../utils/stock/stock-low-alert"
import { StockFilters } from "../../utils/stock/stock-filters"
import { StockTable } from "../../utils/stock/stock-table"

type StockItem = {
  id: string
  categoria: string
  tipo: string
  linea: string
  color: string
  estado: "nuevo" | "Con Detalles" | "Dañado"
  cantidad: number
  ubicacion: string
  largo: number
  material: "aluminio" | "pvc" | "silicona"
  lastUpdate: string
}


// Esto se deberia borrar y hacer una funcion en db.ts para traer la lista de stock
const initialStock: StockItem[] = [
  // Stock de Aluminio
  {
    id: "1",
    categoria: "Perfiles",
    tipo: "6034",
    linea: "Linea modena",
    color: "blanco alvar",
    estado: "nuevo",
    cantidad: 145,
    ubicacion: "Depósito A",
    largo: 6000,
    material: "aluminio",
    lastUpdate: "2025-03-10",
  },
  {
    id: "2",
    categoria: "Perfiles",
    tipo: "6035",
    linea: "linea modena 2",
    color: "negro exa",
    estado: "Con Detalles",
    cantidad: 28,
    ubicacion: "Depósito B",
    largo: 3000,
    material: "aluminio",
    lastUpdate: "2025-03-09",
  },
  {
    id: "3",
    categoria: "Perfiles",
    tipo: "6036",
    linea: "Linea modena",
    color: "blanco exa",
    estado: "nuevo",
    cantidad: 89,
    ubicacion: "Depósito A",
    largo: 6000,
    material: "aluminio",
    lastUpdate: "2025-03-10",
  },
  // Stock de PVC
  {
    id: "4",
    categoria: "Perfiles",
    tipo: "6037",
    linea: "linea modena 2",
    color: "blanco alvar",
    estado: "nuevo",
    cantidad: 98,
    ubicacion: "Depósito A",
    largo: 6000,
    material: "pvc",
    lastUpdate: "2025-03-10",
  },
  {
    id: "5",
    categoria: "Perfiles",
    tipo: "6038",
    linea: "Linea modena",
    color: "negro alvar",
    estado: "Dañado",
    cantidad: 35,
    ubicacion: "Depósito B",
    largo: 3000,
    material: "pvc",
    lastUpdate: "2025-03-09",
  },
  // Stock de Silicona
  {
    id: "6",
    categoria: "Accesorios",
    tipo: "SIL-001",
    linea: "Silicona Premium",
    color: "Transparente",
    estado: "nuevo",
    cantidad: 25,
    ubicacion: "Depósito C",
    largo: 300,
    material: "silicona",
    lastUpdate: "2025-03-10",
  },
  {
    id: "7",
    categoria: "Accesorios",
    tipo: "SIL-002",
    linea: "Silicona Premium",
    color: "Blanco",
    estado: "nuevo",
    cantidad: 18,
    ubicacion: "Depósito C",
    largo: 300,
    material: "silicona",
    lastUpdate: "2025-03-09",
  },
]

interface StockManagementProps {
  materialType?: "aluminio" | "pvc" | "silicona" | "all"
}

export function StockManagement({ materialType = "all" }: StockManagementProps) {
  const [stock, setStock] = useState<StockItem[]>(initialStock)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Perfiles")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const filteredStock = stock.filter((item) => {
    const matchesSearch = item.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.linea.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.color.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "Perfiles" || item.categoria === selectedCategory
    const matchesMaterial = materialType === "all" || item.material === materialType
    return matchesSearch && matchesCategory && matchesMaterial
  })

  const lowStockItems = stock.filter((item) => item.cantidad < 10) // Cambiar a un valor fijo por ahora
  const totalItems = stock.reduce((sum, item) => sum + item.cantidad, 0)

  // Títulos dinámicos según el tipo de material
  const getTitle = () => {
    switch (materialType) {
      case "aluminio":
        return "Stock de Aluminio"
      case "pvc":
        return "Stock de PVC"
      case "silicona":
        return "Stock de Silicona"
      default:
        return "Gestión de Stock"
    }
  }

  const getDescription = () => {
    switch (materialType) {
      case "aluminio":
        return "Control de inventario de productos de aluminio"
      case "pvc":
        return "Control de inventario de productos de PVC"
      case "silicona":
        return "Control de inventario de siliconas y selladores"
      default:
        return "Control de inventario y materiales"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground text-balance">{getTitle()}</h2>
          <p className="text-muted-foreground mt-1">{getDescription()}</p>
        </div>
        {/* form for new item */}
        <div className="flex gap-2">
          <StockAddDialog
            open={isAddDialogOpen}
            onOpenChange={setIsAddDialogOpen}
            onSave={(newItem) => {
              setStock([...stock, { ...newItem, id: Date.now().toString() }])
              setIsAddDialogOpen(false)
            }}
            materialType={materialType === "all" ? "aluminio" : materialType}
          />
        </div>
      </div>

      { /* stats */}
      <StockStats 
        totalItems={totalItems}
        categoriesCount={5} // Número fijo de tipos por ahora
        lowStockCount={lowStockItems.length}
      />

      { /* stock alert */}
      <StockLowAlert lowStockItems={lowStockItems} />

      { /* filters */}
      <StockFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      { /* main table */}
      <StockTable
        filteredStock={filteredStock}
        onEdit={(id) => {/* implement edit logic */}}
        onDelete={(id) => setStock(stock.filter(item => item.id !== id))}
      />
    </div>
  )
}

export type { StockItem }
