import { getSupabaseClient } from './supabaseClient'


export type StockItemRecord = {
  id?: string
  categoria?: string | null
  tipo?: string | null
  linea?: string | null
  color?: string | null
  estado?: string | null
  cantidad?: number | null
  min_stock?: number | null
  unidad?: string | null
  ubicacion?: string | null
  largo?: number | null
  material?: string | null
  last_update?: string | null
}

const TABLE = 'stock'

export async function listStock(): Promise<{ data: StockItemRecord[] | null; error: any }>{
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from(TABLE).select('*').order('last_update', { ascending: false })
  return { data, error }
}

export async function getStockById(id: string): Promise<{ data: StockItemRecord | null; error: any }>{
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single()
  return { data, error }
}

export async function createStockItem(item: Partial<StockItemRecord>): Promise<{ data: StockItemRecord | null; error: any }>{
  const supabase = getSupabaseClient()
  const payload = { ...item, last_update: item.last_update ?? new Date().toISOString().split('T')[0] }
  const { data, error } = await supabase.from(TABLE).insert(payload).select().single()
  return { data, error }
}

export async function updateStockItem(id: string, changes: Partial<StockItemRecord>): Promise<{ data: StockItemRecord | null; error: any }> {
  const supabase = getSupabaseClient()
  const payload = { ...changes, last_update: new Date().toISOString().split('T')[0] }
  const { data, error } = await supabase.from(TABLE).update(payload).eq('id', id).select().single()
  return { data, error }
}

export async function deleteStockItem(id: string): Promise<{ data: null; error: any }>{
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from(TABLE).delete().eq('id', id)
  return { data: null, error }
}
