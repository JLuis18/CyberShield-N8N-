'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface ApiKey {
    id: string
    name: string
    isActive: boolean
    rateLimit: number
    lastUsedAt: string | null
    createdAt: string
    expiresAt: string | null
}

export default function ApiKeysPage() {
    const router = useRouter()
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
    const [loading, setLoading] = useState(true)
    const [creating, setCreating] = useState(false)
    const [showNewKey, setShowNewKey] = useState(false)
    const [newKeyData, setNewKeyData] = useState<{ key: string, name: string } | null>(null)

    const [newKeyName, setNewKeyName] = useState('')
    const [newKeyRateLimit, setNewKeyRateLimit] = useState(100)

    useEffect(() => {
        fetchApiKeys()
    }, [])

    const fetchApiKeys = async () => {
        try {
            const token = localStorage.getItem('token')
            const res = await fetch('/api/api-keys', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (res.ok) {
                const data = await res.json()
                setApiKeys(data.apiKeys)
            }
        } catch (error) {
            console.error('Error fetching API keys:', error)
        } finally {
            setLoading(false)
        }
    }

    const createApiKey = async () => {
        if (!newKeyName.trim()) {
            alert('Por favor ingresa un nombre para la API key')
            return
        }

        setCreating(true)
        try {
            const token = localStorage.getItem('token')
            const res = await fetch('/api/api-keys', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: newKeyName,
                    rateLimit: newKeyRateLimit
                })
            })

            if (res.ok) {
                const data = await res.json()
                setNewKeyData({ key: data.apiKey, name: data.name })
                setShowNewKey(true)
                setNewKeyName('')
                setNewKeyRateLimit(100)
                fetchApiKeys() // Refresh list
            }
        } catch (error) {
            console.error('Error creating API key:', error)
        } finally {
            setCreating(false)
        }
    }

    const revokeApiKey = async (id: string, name: string) => {
        if (!confirm(`¿Estás seguro de revocar la clave "${name}"? Esta acción no se puede deshacer.`)) {
            return
        }

        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`/api/api-keys?id=${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (res.ok) {
                fetchApiKeys() // Refresh list
            }
        } catch (error) {
            console.error('Error revoking API key:', error)
        }
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        alert('API key copiada al portapapeles')
    }

    return (
        <div className="p-4 md:p-8 max-w-[1400px] mx-auto">
            {/* Header */}
            <div className="glass-panel p-4 md:p-6 mb-6 md:mb-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold cyber-gradient mb-2">API Keys</h1>
                        <p className="text-sm md:text-base text-gray-400">Gestiona tus claves de API para integración externa</p>
                    </div>
                    <button
                        onClick={() => router.push('/settings')}
                        className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-all border border-white/10 hover:border-cyan-500/50"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span>Volver a Configuración</span>
                    </button>
                </div>
            </div>

            {/* New Key Modal */}
            {showNewKey && newKeyData && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="glass-panel p-6 max-w-2xl w-full">
                        <h2 className="text-xl font-bold mb-4 text-green-400">✅ API Key Creada</h2>
                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
                            <p className="text-yellow-300 text-sm font-semibold mb-2">⚠️ IMPORTANTE: Guarda esta clave ahora</p>
                            <p className="text-gray-400 text-sm">Esta clave solo se mostrará UNA VEZ. No podrás verla nuevamente.</p>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm text-gray-400 mb-2">Nombre:</label>
                            <p className="text-white font-medium">{newKeyData.name}</p>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm text-gray-400 mb-2">Tu API Key:</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newKeyData.key}
                                    readOnly
                                    className="cyber-input flex-1 font-mono text-sm"
                                />
                                <button
                                    onClick={() => copyToClipboard(newKeyData.key)}
                                    className="cyber-button px-4"
                                >
                                    Copiar
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                setShowNewKey(false)
                                setNewKeyData(null)
                            }}
                            className="cyber-button w-full"
                        >
                            Entendido, he guardado la clave
                        </button>
                    </div>
                </div>
            )}

            {/* Create New Key Form */}
            <div className="glass-panel p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Crear Nueva API Key</h2>
                <div className="grid grid-cols-1 md: grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Nombre de la clave</label>
                        <input
                            type="text"
                            value={newKeyName}
                            onChange={(e) => setNewKeyName(e.target.value)}
                            className="cyber-input w-full"
                            placeholder="Ej: Producción, Desarrollo, etc."
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Rate Limit (req/min)</label>
                        <input
                            type="number"
                            value={newKeyRateLimit}
                            onChange={(e) => setNewKeyRateLimit(parseInt(e.target.value))}
                            className="cyber-input w-full"
                            min="1"
                            max="1000"
                        />
                    </div>
                </div>
                <button
                    onClick={createApiKey}
                    disabled={creating || !newKeyName.trim()}
                    className="cyber-button mt-4 disabled:opacity-50"
                >
                    {creating ? 'Creando...' : 'Crear API Key'}
                </button>
            </div>

            {/* API Keys List */}
            <div className="glass-panel p-6">
                <h2 className="text-xl font-semibold mb-4">Tus API Keys</h2>
                {loading ? (
                    <p className="text-gray-400">Cargando...</p>
                ) : apiKeys.length === 0 ? (
                    <p className="text-gray-400">No tienes API keys. Crea una para comenzar.</p>
                ) : (
                    <div className="space-y-4">
                        {apiKeys.map((key) => (
                            <div key={key.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-semibold text-white">{key.name}</h3>
                                        <p className="text-sm text-gray-400">
                                            Creada: {new Date(key.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => revokeApiKey(key.id, key.name)}
                                        className="text-red-400 hover:text-red-300 text-sm"
                                    >
                                        Revocar
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-400">Estado:</span>
                                        <span className={`ml-2 ${key.isActive ? 'text-green-400' : 'text-red-400'}`}>
                                            {key.isActive ? 'Activa' : 'Inactiva'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">Rate Limit:</span>
                                        <span className="ml-2 text-white">{key.rateLimit}/min</span>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-gray-400">Último uso:</span>
                                        <span className="ml-2 text-white">
                                            {key.lastUsedAt
                                                ? new Date(key.lastUsedAt).toLocaleString()
                                                : 'Nunca'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Documentation */}
            <div className="glass-panel p-6 mt-6">
                <h2 className="text-xl font-semibold mb-4">Documentación de la API</h2>
                <div className="space-y-6 text-sm">
                    {/* URL Endpoint */}
                    <div>
                        <h3 className="font-semibold text-white mb-2">1. Escaneo de URLs</h3>
                        <pre className="bg-black/50 p-3 rounded overflow-x-auto text-xs">
                            <code>{`POST /api/v1/scan/url
Headers:
  Authorization: Bearer YOUR_API_KEY
  Content-Type: application/json

Body:
{
  "url": "https://example.com"
}

Response:
{
  "url": "https://example.com",
  "riskLevel": "low",
  "riskScore": 0,
  "threats": [],
  "analyzed": true,
  "timestamp": "2025-12-03T00:00:00.000Z"
}`}</code>
                        </pre>
                    </div>

                    {/* Email Endpoint */}
                    <div>
                        <h3 className="font-semibold text-white mb-2">2. Escaneo de Emails</h3>
                        <pre className="bg-black/50 p-3 rounded overflow-x-auto text-xs">
                            <code>{`POST /api/v1/scan/email
Headers:
  Authorization: Bearer YOUR_API_KEY
  Content-Type: application/json

Body:
{
  "content": "Urgent! Verify your account now..."
}

Response:
{
  "riskLevel": "high",
  "riskScore": 33,
  "threats": ["Suspicious keyword: urgent", "Suspicious keyword: verify your account"],
  "linkCount": 2,
  "analyzed": true,
  "timestamp": "2025-12-03T00:00:00.000Z"
}`}</code>
                        </pre>
                    </div>

                    {/* Invoice Endpoint */}
                    <div>
                        <h3 className="font-semibold text-white mb-2">3. Escaneo de Facturas</h3>
                        <pre className="bg-black/50 p-3 rounded overflow-x-auto text-xs">
                            <code>{`POST /api/v1/scan/invoice
Headers:
  Authorization: Bearer YOUR_API_KEY
  Content-Type: application/json

Body:
{
  "filename": "factura_2025.pdf",
  "content": "Cambio de cuenta bancaria urgente..."
}

Response:
{
  "filename": "factura_2025.pdf",
  "riskLevel": "high",
  "riskScore": 60,
  "threats": ["Bank account change detected", "Urgency pressure: urgente"],
  "analyzed": true,
  "timestamp": "2025-12-03T00:00:00.000Z"
}`}</code>
                        </pre>
                    </div>

                    {/* Network Endpoint */}
                    <div>
                        <h3 className="font-semibold text-white mb-2">4. Escaneo de Conexiones de Red</h3>
                        <pre className="bg-black/50 p-3 rounded overflow-x-auto text-xs">
                            <code>{`POST /api/v1/scan/network
Headers:
  Authorization: Bearer YOUR_API_KEY
  Content-Type: application/json

Body:
{
  "ipAddress": "192.168.1.1",
  "port": 22,
  "protocol": "TCP"
}

Response:
{
  "ipAddress": "192.168.1.1",
  "port": 22,
  "protocol": "TCP",
  "riskLevel": "high",
  "riskScore": 55,
  "status": "blocked",
  "threats": ["🔒 Private IP address detected", "🚨 Dangerous port: SSH - Remote access"],
  "analyzed": true,
  "timestamp": "2025-12-03T00:00:00.000Z"
}`}</code>
                        </pre>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/30 rounded p-3">
                        <p className="text-blue-300 text-sm">
                            💡 <strong>Rate Limiting:</strong> Todos los endpoints retornan headers:
                            <code className="block mt-1 text-xs">X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset</code>
                        </p>
                    </div>

                    <div className="bg-green-500/10 border border-green-500/30 rounded p-3">
                        <p className="text-green-300 text-sm">
                            ✅ <strong>Base URL:</strong> https://your-cybershield.vercel.app
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
