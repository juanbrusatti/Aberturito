"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DynamicSelect } from "./dynamic-select"
import { StockItem } from "../../components/business/stock-management"
import { tipos, lineas, colores, estados, ubicaciones, categorias } from "@/constants/categories"
import { useState } from "react"

interface StockAddDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (item: Omit<StockItem, 'id'>) => void
  materialType?: "aluminio" | "pvc" | "silicona"
}

export function StockAddDialog({ open, onOpenChange, onSave, materialType = "aluminio" }: StockAddDialogProps) {
  const [categoria, setCategoria] = useState("")
  const [tipo, setTipo] = useState("")
  const [linea, setLinea] = useState("")
  const [color, setColor] = useState("")
  const [estado, setEstado] = useState<"nuevo" | "Con Detalles" | "Dañado">("nuevo")
  const [cantidad, setCantidad] = useState(0)
  const [ubicacion, setUbicacion] = useState("")
  const [largo, setLargo] = useState(0)

  // Estados para las opciones dinámicas
  const [categoriasOptions, setCategoriasOptions] = useState(categorias)
  const [tiposOptions, setTiposOptions] = useState(tipos)
  const [lineasOptions, setLineasOptions] = useState(lineas)
  const [coloresOptions, setColoresOptions] = useState(colores)
  const [ubicacionesOptions, setUbicacionesOptions] = useState(ubicaciones)

  const handleAddItem = () => {
    // Validar campos obligatorios
    if (!categoria || !tipo || !linea || !color || !ubicacion || cantidad <= 0 || largo <= 0) {
      alert("Por favor complete todos los campos obligatorios")
      return
    }

    onSave({ 
      categoria,
      tipo,
      linea,
      color,
      estado,
      cantidad,
      ubicacion,
      largo,
      material: materialType,
      lastUpdate: new Date().toISOString().split('T')[0]
    })
    
    // Resetear formulario
    setCategoria("")
    setTipo("")
    setLinea("")
    setColor("")
    setEstado("nuevo")
    setCantidad(0)
    setUbicacion("")
    setLargo(0)
    
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Agregar Item
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-foreground">Agregar nuevo item</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Ingrese los datos del nuevo material o producto
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 py-4 pr-2 -mr-2">
          <div className="grid gap-4">
            <DynamicSelect
              label="Categoría"
              value={categoria}
              onValueChange={setCategoria}
              options={categoriasOptions}
              onAddOption={(newOption) => setCategoriasOptions([...categoriasOptions, newOption])}
              placeholder="Seleccionar categoría"
            />

            <DynamicSelect
              label="Tipo"
              value={tipo}
              onValueChange={setTipo}
              options={tiposOptions}
              onAddOption={(newOption) => setTiposOptions([...tiposOptions, newOption])}
              placeholder="Seleccionar tipo"
            />

          <DynamicSelect
            label="Línea"
            value={linea}
            onValueChange={setLinea}
            options={lineasOptions}
            onAddOption={(newOption) => setLineasOptions([...lineasOptions, newOption])}
            placeholder="Seleccionar línea"
          />

          <DynamicSelect
            label="Color"
            value={color}
            onValueChange={setColor}
            options={coloresOptions}
            onAddOption={(newOption) => setColoresOptions([...coloresOptions, newOption])}
            placeholder="Seleccionar color"
          />

          <div className="grid gap-2 mb-2">
            <Label htmlFor="estado" className="text-foreground">
              Estado
            </Label>
            <Select value={estado} onValueChange={(value: "nuevo" | "Con Detalles" | "Dañado") => setEstado(value)}>
              <SelectTrigger className="bg-background w-full">
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px] overflow-y-auto">
                {estados.map((est) => (
                  <SelectItem key={est} value={est}>
                    {est}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="cantidad" className="text-foreground">
              Cantidad *
            </Label>
            <Input
              id="cantidad"
              type="number"
              placeholder="0"
              className="bg-background"
              value={cantidad || ""}
              onChange={(e) => setCantidad(Number(e.target.value))}
              required
            />
          </div>

          <DynamicSelect
            label="Ubicación"
            value={ubicacion}
            onValueChange={setUbicacion}
            options={ubicacionesOptions}
            onAddOption={(newOption) => setUbicacionesOptions([...ubicacionesOptions, newOption])}
            placeholder="Seleccionar ubicación"
          />

          <div className="grid gap-2">
            <Label htmlFor="largo" className="text-foreground">
              Largo (mm) *
            </Label>
            <Input
              id="largo"
              type="number"
              placeholder="0"
              className="bg-background"
              value={largo || ""}
              onChange={(e) => setLargo(Number(e.target.value))}
              required
            />
          </div>
          </div>
        </div>
        <DialogFooter className="flex-shrink-0 pt-4 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button onClick={handleAddItem} className="w-full sm:w-auto">
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}