'use client'

export const dynamic = 'force-dynamic'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { usePlanFeatures } from '@/hooks/usePlanFeatures'
import { UsageLimitBanner } from '@/components/UpgradePrompt'
import { useLanguage } from '@/contexts/LanguageContext'

type ScanType = 'url' | 'email' | 'invoice' | 'network'

function ScannerPageContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { canPerformScan, incrementUsage } = usePlanFeatures()
    const { t } = useLanguage()

    const [activeTab, setActiveTab] = useState<ScanType>(
        (searchParams.get('type') as ScanType) || 'url'
    )
    const [scanInput, setScanInput] = useState('')
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [ipAddress, setIpAddress] = useState('')
    const [port, setPort] = useState('')
    const [protocol, setProtocol] = useState('TCP')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0])
        }
    }

    const handleScan = async () => {
        if (activeTab === 'invoice' && !selectedFile) {
            setResult({ error: 'Por favor selecciona un archivo PDF o imagen' })
            return
        }

        if (activeTab === 'network' && (!ipAddress.trim() || !port.trim())) {
            setResult({ error: 'Por favor ingresa IP y puerto' })
            return
        }

        if (activeTab !== 'invoice' && activeTab !== 'network' && !scanInput.trim()) {
            setResult({ error: activeTab === 'url' ? 'URL requerida' : 'Contenido de email requerido' })
            return
        }

        // Validate URL format for URL scanner
        if (activeTab === 'url' && scanInput.trim()) {
            const urlPattern = /^(https?:\/\/)/i
            if (!urlPattern.test(scanInput.trim())) {
                setResult({ error: 'Por favor ingresa una URL válida (debe empezar con http:// o https://)' })
                return
            }
        }


        setLoading(true)
        setResult(null)

        try {
            const token = localStorage.getItem('token')

            // Only check scan limits if user is logged in
            if (token) {
                const scanType = activeTab === 'url' ? 'urlScans' : activeTab === 'email' ? 'emailScans' : activeTab === 'network' ? 'networkScans' : 'invoiceScans'
                if (!canPerformScan(scanType)) {
                    setLoading(false)
                    setResult({
                        error: 'Has alcanzado el límite diario de escaneos. Actualiza tu plan para continuar.',
                        limitReached: true
                    })
                    return
                }
            }
            let endpoint = `/api/scanner/${activeTab}`
            let body

            if (activeTab === 'invoice' && selectedFile) {
                body = JSON.stringify({
                    input: selectedFile.name,
                    fileType: selectedFile.type,
                    fileSize: selectedFile.size
                })
            } else if (activeTab === 'network') {
                body = JSON.stringify({
                    ipAddress,
                    port: parseInt(port),
                    protocol
                })
            } else {
                body = JSON.stringify({ input: scanInput })
            }

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` }),
                },
                body: body,
            })

            const data = await res.json()
            setResult(data)

            // Only increment usage if user is logged in
            if (token) {
                const scanType = activeTab === 'url' ? 'urlScans' : activeTab === 'email' ? 'emailScans' : activeTab === 'network' ? 'networkScans' : 'invoiceScans'
                incrementUsage(scanType)
            }
        } catch (error) {
            setResult({ error: 'Error al realizar el análisis' })
        } finally {
            setLoading(false)
        }
    }

    const getRiskColor = (risk: string) => {
        switch (risk) {
            case 'low': return 'text-green-400'
            case 'medium': return 'text-yellow-400'
            case 'high': return 'text-red-400'
            default: return 'text-gray-400'
        }
    }

    return (
        <div className="p-4 md:p-8 max-w-[1400px] mx-auto">
            {/* Header */}
            <div className="glass-panel p-4 md:p-6 mb-6 md:mb-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold cyber-gradient mb-2">{t.scanner.title}</h1>
                        <p className="text-sm md:text-base" style={{ color: 'var(--text-secondary)' }}>{t.scanner.subtitle}</p>
                    </div>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-all border border-white/10 hover:border-cyan-500/50 text-sm md:text-base w-full sm:w-auto justify-center"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span>{t.common.backToDashboard}</span>
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-4 md:mb-6">
                <button
                    onClick={() => {
                        setActiveTab('url')
                        setSelectedFile(null)
                    }}
                    className={`px-6 py-3 rounded-lg font-medium transition-all ${activeTab === 'url'
                        ? 'cyber-button'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                >
                    {t.scanner.urlTab}
                </button>
                <button
                    onClick={() => {
                        setActiveTab('email')
                        setSelectedFile(null)
                    }}
                    className={`px-6 py-3 rounded-lg font-medium transition-all ${activeTab === 'email'
                        ? 'cyber-button'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                >
                    {t.scanner.emailTab}
                </button>
                <button
                    onClick={() => {
                        setActiveTab('invoice')
                        setScanInput('')
                    }}
                    className={`px-6 py-3 rounded-lg font-medium transition-all ${activeTab === 'invoice'
                        ? 'cyber-button'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                >
                    {t.scanner.invoiceTab}
                </button>
                <button
                    onClick={() => {
                        setActiveTab('network')
                        setScanInput('')
                        setSelectedFile(null)
                    }}
                    className={`px-6 py-3 rounded-lg font-medium transition-all ${activeTab === 'network'
                        ? 'cyber-button'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                >
                    Analizar Conexión
                </button>
            </div>

            {/* Usage Limit Banner */}
            {activeTab === 'url' && (
                <UsageLimitBanner type="urlScans" label={t.scanner.urlScans} />
            )}
            {activeTab === 'email' && (
                <UsageLimitBanner type="emailScans" label={t.scanner.emailScans} />
            )}
            {activeTab === 'invoice' && (
                <UsageLimitBanner type="invoiceScans" label={t.scanner.invoiceScans} />
            )}

            {/* Scanner Input */}
            <div className="glass-panel p-6 mb-6">
                <div className="mb-4">
                    {activeTab === 'network' ? (
                        <>
                            <label className="block text-sm font-medium mb-2">
                                Analizar Conexión de Red
                            </label>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Dirección IP</label>
                                    <input
                                        type="text"
                                        value={ipAddress}
                                        onChange={(e) => setIpAddress(e.target.value)}
                                        className="cyber-input w-full"
                                        placeholder="Ej: 192.168.1.1"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Puerto</label>
                                        <input
                                            type="number"
                                            value={port}
                                            onChange={(e) => setPort(e.target.value)}
                                            className="cyber-input w-full"
                                            placeholder="Ej: 443"
                                            min="1"
                                            max="65535"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Protocolo</label>
                                        <select
                                            value={protocol}
                                            onChange={(e) => setProtocol(e.target.value)}
                                            className="cyber-input w-full"
                                        >
                                            <option value="TCP">TCP</option>
                                            <option value="UDP">UDP</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                                    <p className="text-xs text-blue-300">
                                        💡 <strong>Ejemplos:</strong>
                                    </p>
                                    <ul className="text-xs text-gray-400 mt-1 space-y-1 ml-4">
                                        <li>• 8.8.8.8:53 - Google DNS</li>
                                        <li>• 192.168.1.1:22 - SSH en red privada</li>
                                        <li>• 104.26.0.1:443 - HTTPS</li>
                                    </ul>
                                </div>
                            </div>
                        </>
                    ) : activeTab === 'invoice' ? (
                        <>
                            <label className="block text-sm font-medium mb-2">
                                Subir Factura (PDF o Imagen)
                            </label>
                            <div className="border-2 border-dashed border-white/10 rounded-lg p-8 text-center hover:border-cyan-500/50 transition-all">
                                <input
                                    type="file"
                                    accept=".pdf,.png,.jpg,.jpeg"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="file-upload"
                                />
                                <label htmlFor="file-upload" className="cursor-pointer">
                                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    <p className="text-gray-300 mb-2">
                                        {selectedFile ? selectedFile.name : 'Click para seleccionar archivo'}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Formatos aceptados: PDF, PNG, JPG (Max 10MB)
                                    </p>
                                </label>
                            </div>
                            {selectedFile && (
                                <div className="mt-4 p-4 bg-white/5 rounded-lg">
                                    <p className="text-sm text-gray-400">Archivo seleccionado:</p>
                                    <p className="text-white font-medium">{selectedFile.name}</p>
                                    <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <label className="block text-sm font-medium mb-2">
                                {activeTab === 'url' && 'Ingresa la URL a analizar'}
                                {activeTab === 'email' && 'Ingresa el contenido del email'}
                            </label>
                            <textarea
                                value={scanInput}
                                onChange={(e) => setScanInput(e.target.value)}
                                className="cyber-input w-full min-h-[120px] resize-none"
                                placeholder={
                                    activeTab === 'url' ? t.scanner.placeholder.url :
                                        t.scanner.placeholder.email
                                }
                            />
                        </>
                    )}
                </div>

                <button
                    onClick={handleScan}
                    disabled={loading ||
                        (activeTab === 'network' && (!ipAddress.trim() || !port.trim())) ||
                        (activeTab !== 'invoice' && activeTab !== 'network' && !scanInput.trim()) ||
                        (activeTab === 'invoice' && !selectedFile)
                    }
                    className="cyber-button px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? t.scanner.analyzing : t.scanner.analyze}
                </button>
            </div>

            {/* Results */}
            {result && (
                <div className="glass-panel p-6">
                    <h3 className="text-xl font-semibold mb-4">{t.scanner.results}</h3>

                    {result.error ? (
                        <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-4">
                            {result.error}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                                <span className="text-gray-400">Nivel de Riesgo:</span>
                                <span className={`text-xl font-bold uppercase ${getRiskColor(result.riskLevel)}`}>
                                    {result.riskLevel}
                                </span>
                            </div>

                            {result.threats && result.threats.length > 0 && (
                                <div>
                                    <h4 className="font-semibold mb-2">Amenazas Detectadas:</h4>
                                    <ul className="space-y-2">
                                        {result.threats.map((threat: string, index: number) => (
                                            <li key={index} className="flex items-start gap-2 text-gray-300">
                                                <span className="text-red-400 mt-1">•</span>
                                                {threat}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {result.recommendations && result.recommendations.length > 0 && (
                                <div>
                                    <h4 className="font-semibold mb-2">Recomendaciones:</h4>
                                    <ul className="space-y-2">
                                        {result.recommendations.map((rec: string, index: number) => (
                                            <li key={index} className="flex items-start gap-2 text-gray-300">
                                                <span className="text-cyan-400 mt-1">✓</span>
                                                {rec}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default function ScannerPage() {
    return (
        <Suspense fallback={<div className="p-8">Cargando...</div>}>
            <ScannerPageContent />
        </Suspense>
    )
}
