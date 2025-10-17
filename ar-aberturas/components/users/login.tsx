"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/components/provider/auth-provider'
import { FaWindowMaximize, FaUser, FaLock } from 'react-icons/fa'

export default function LoginPage() {
  const { signIn, user, loading } = useAuth()
  const router = useRouter()
  const [usuario, setUsuario] = useState('')
  const [contraseña, setContraseña] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Redirect to dashboard after auth state resolved
  React.useEffect(() => {
    if (user) {
      router.push('/')
    }
  }, [user, router])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await signIn(usuario, contraseña)
      router.push('/')
    } catch (err: any) {
      setError(err?.message || 'Error al iniciar sesión')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="w-full max-w-md p-8 rounded-2xl bg-gray-800/70 backdrop-blur-md shadow-2xl border border-gray-700/50 relative overflow-hidden">
        {/* Glass pane effect */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full filter blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-blue-400/10 rounded-full filter blur-3xl"></div>
        
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-600/20 rounded-full">
              <FaWindowMaximize className="w-10 h-10 text-blue-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white">AR Aberturas</h1>
        </div>
        
        {/* Login Form */}
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="text-gray-400" />
              </div>
              <Input 
                value={usuario} 
                onChange={(e) => setUsuario(e.target.value)} 
                type="text" 
                placeholder="Usuario" 
                className="pl-10 bg-gray-700/50 text-white border-gray-600 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/70 transition-all duration-200 placeholder-gray-400"
              />
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="text-gray-400" />
              </div>
              <Input 
                value={contraseña} 
                onChange={(e) => setContraseña(e.target.value)} 
                type="password" 
                placeholder="Contraseña" 
                className="pl-10 bg-gray-700/50 text-white border-gray-600 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/70 transition-all duration-200 placeholder-gray-400"
              />
            </div>
          </div>
          
          {error && (
            <div className="p-3 bg-red-900/30 text-red-300 text-sm rounded-lg border border-red-800/50">
              {error}
            </div>
          )}
          
          <Button 
            type="submit" 
            disabled={loading} 
            className="w-full py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
          >
            {loading ? 'Iniciando sesión...' : 'Acceder al sistema'}
          </Button>
        </form>
        
        <div className="mt-6 text-center text-sm text-gray-400">
          <p>Sistema de gestión para AR Aberturas</p>
        </div>
      </div>
    </div>
  )
}