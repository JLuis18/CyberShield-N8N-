'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Scan {
    id: string
    type: 'url' | 'email' | 'invoice' | 'network'
    input: string
    riskLevel: 'low' | 'medium' | 'high'
    riskScore: number
    threats: string[]
    status?: string
    protocol?: string
    scannedAt: string
    // Email specific fields
    emailContent?: string
    emailSubject?: string
    emailSender?: string
}

export default function HistoryPage() {
    const router = useRouter()
    const [scans, setScans] = useState<Scan[]>([])
    const [loading, setLoading] = useState(true)
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    // Filters
    const [typeFilter, setTypeFilter] = useState('')
    const [riskFilter, setRiskFilter] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')

    // Selected scan for details
    const [selectedScan, setSelectedScan] = useState<Scan | null>(null)

    useEffect(() => {
        fetchHistory()
    }, [page, typeFilter, riskFilter, searchQuery, startDate, endDate])

    const fetchHistory = async () => {
        setLoading(true)
        try {
            const token = localStorage.getItem('token')
            if (!token) {
                router.push('/login')
                return
            }

            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20'
            })

            if (typeFilter) params.append('type', typeFilter)
            if (riskFilter) params.append('riskLevel', riskFilter)
            if (searchQuery) params.append('search', searchQuery)
            if (startDate) params.append('startDate', startDate)
            if (endDate) params.append('endDate', endDate)

            const res = await fetch(`/api/history?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (res.ok) {
                const data = await res.json()
                setScans(data.scans)
                setTotal(data.total)
                setTotalPages(data.totalPages)
            }
        } catch (error) {
            console.error('Error fetching history:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleExport = async (format: 'csv' | 'json') => {
        try {
            const token = localStorage.getItem('token')
            const params = new URLSearchParams({ export: format })

            if (typeFilter) params.append('type', typeFilter)
            if (riskFilter) params.append('riskLevel', riskFilter)
            if (searchQuery) params.append('search', searchQuery)
            if (startDate) params.append('startDate', startDate)
            if (endDate) params.append('endDate', endDate)

            const res = await fetch(`/api/history?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}!`
                }
            })

            if (res.ok) {
                const blob = await res.blob()
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `scan-history-${Date.now()}.${format}`
                document.body.appendChild(a)
                a.click()
                window.URL.revokeObjectURL(url)
                document.body.removeChild(a)
            }
        } catch (error) {
            console.error('Export error:', error)
        }
    }

    const getRiskColor = (level: string) => {
        switch (level) {
            case 'high': return 'text-red-400 bg-red-500/10'
            case 'medium': return 'text-yellow-400 bg-yellow-500/10'
            case 'low': return 'text-green-400 bg-green-500/10'
            default: return 'text-gray-400 bg-gray-500/10'
        }
    }

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'url': return '🔗'
            case 'email': return '📧'
            case 'invoice': return '📄'
            case 'network': return '🌐'
            default: return '📋'
        }
    }

    const getTypeLabel = (type: string) => {
        const labels: any = {
            'url': 'URL',
            'email': 'Email',
            'invoice': 'Factura',
            'network': 'Red'
        }
        return labels[type] || type
    }

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Historial de Escaneos</h1>
                    <p className="text-gray-400">Auditoría completa de todos tus escaneos de seguridad</p>
                </div>

                {/* Filters */}
                <div className="glass-panel p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {/* Type Filter */}
                        <select
                            value={typeFilter}
                            onChange={(e) => { setTypeFilter(e.target.value); setPage(1) }}
                            className="bg-white/5 border border-white/10 rounded px-3 py-2 text-white"
                        >
                            <option value="">Todos los tipos</option>
                            <option value="url">🔗 URL</option>
                            <option value="email">📧 Email</option>
                            <option value="invoice">📄 Factura</option>
                            <option value="network">🌐 Red</option>
                        </select>

                        {/* Risk Filter */}
                        <select
                            value={riskFilter}
                            onChange={(e) => { setRiskFilter(e.target.value); setPage(1) }}
                            className="bg-white/5 border border-white/10 rounded px-3 py-2 text-white"
                        >
                            <option value="">Todos los riesgos</option>
                            <option value="high">🔴 Alto</option>
                            <option value="medium">🟡 Medio</option>
                            <option value="low">🟢 Bajo</option>
                        </select>

                        {/* Search */}
                        <input
                            type="text"
                            placeholder="Buscar..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setPage(1) }}
                            className="bg-white/5 border border-white/10 rounded px-3 py-2 text-white"
                        />

                        {/* Date Range */}
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => { setStartDate(e.target.value); setPage(1) }}
                            className="bg-white/5 border border-white/10 rounded px-3 py-2 text-white"
                        />
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => { setEndDate(e.target.value); setPage(1) }}
                            className="bg-white/5 border border-white/10 rounded px-3 py-2 text-white"
                        />
                    </div>

                    {/* Export Buttons */}
                    <div className="flex gap-2 mt-4">
                        <button
                            onClick={() => handleExport('csv')}
                            className="cyber-button-secondary px-4 py-2 text-sm"
                        >
                            📥 Exportar CSV
                        </button>
                        <button
                            onClick={() => handleExport('json')}
                            className="cyber-button-secondary px-4 py-2 text-sm"
                        >
                            📥 Exportar JSON
                        </button>
                    </div>
                </div>

                {/* Results Count */}
                <div className="mb-4 text-gray-400 text-sm">
                    Mostrando {scans.length} de {total} escaneos
                </div>

                {/* Table */}
                <div className="glass-panel overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center text-gray-400">
                            Cargando historial...
                        </div>
                    ) : scans.length === 0 ? (
                        <div className="p-12 text-center text-gray-400">
                            No se encontraron escaneos
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-white/5">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Tipo</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Input</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Riesgo</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Score</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Fecha</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {scans.map((scan) => (
                                        <tr key={scan.id} className="hover:bg-white/5 cursor-pointer transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span>{getTypeIcon(scan.type)}</span>
                                                    <span className="text-sm">{getTypeLabel(scan.type)}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-white truncate max-w-md">
                                                    {scan.input}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(scan.riskLevel)}`}>
                                                    {scan.riskLevel.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-white">
                                                {scan.riskScore}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-400">
                                                {new Date(scan.scannedAt).toLocaleString('es-ES')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => setSelectedScan(scan)}
                                                    className="text-cyan-400 hover:text-cyan-300 text-sm"
                                                >
                                                    Ver detalles
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-6 flex justify-center gap-2">
                        <button
                            onClick={() => setPage(Math.max(1, page - 1))}
                            disabled={page === 1}
                            className="cyber-button-secondary px-4 py-2 disabled:opacity-50"
                        >
                            Anterior
                        </button>
                        <span className="px-4 py-2 text-white">
                            Página {page} de {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(Math.min(totalPages, page + 1))}
                            disabled={page === totalPages}
                            className="cyber-button-secondary px-4 py-2 disabled:opacity-50"
                        >
                            Siguiente
                        </button>
                    </div>
                )}

                {/* Detail Modal */}
                {selectedScan && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedScan(null)}>
                        <div className="glass-panel p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-xl font-bold">Detalles del Escaneo</h2>
                                <button onClick={() => setSelectedScan(null)} className="text-gray-400 hover:text-white">
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm text-gray-400">Tipo</label>
                                    <p className="text-white">{getTypeIcon(selectedScan.type)} {getTypeLabel(selectedScan.type)}</p>
                                </div>

                                <div>
                                    <label className="text-sm text-gray-400">Input</label>
                                    <p className="text-white break-all">{selectedScan.input}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-gray-400">Nivel de Riesgo</label>
                                        <p className={`inline-block px-2 py-1 rounded text-xs font-medium ${getRiskColor(selectedScan.riskLevel)}`}>
                                            {selectedScan.riskLevel.toUpperCase()}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-400">Risk Score</label>
                                        <p className="text-white">{selectedScan.riskScore}</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm text-gray-400">Fecha de Escaneo</label>
                                    <p className="text-white">{new Date(selectedScan.scannedAt).toLocaleString('es-ES')}</p>
                                </div>

                                {selectedScan.threats && selectedScan.threats.length > 0 && (
                                    <div>
                                        <label className="text-sm text-gray-400">Amenazas Detectadas</label>
                                        <ul className="list-disc list-inside text-white space-y-1 mt-2">
                                            {selectedScan.threats.map((threat, idx) => (
                                                <li key={idx}>{threat}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Email Content Section */}
                                {selectedScan.type === 'email' && (
                                    <>
                                        {selectedScan.emailSender && (
                                            <div>
                                                <label className="text-sm text-gray-400">📧 Remitente</label>
                                                <p className="text-white break-all">{selectedScan.emailSender}</p>
                                            </div>
                                        )}

                                        {selectedScan.emailSubject && (
                                            <div>
                                                <label className="text-sm text-gray-400">📋 Asunto</label>
                                                <p className="text-white">{selectedScan.emailSubject}</p>
                                            </div>
                                        )}

                                        {selectedScan.emailContent && (
                                            <div>
                                                <label className="text-sm text-gray-400">📝 Contenido del Correo</label>
                                                <div className="mt-2 p-4 bg-white/5 border border-white/10 rounded-lg">
                                                    <p className="text-white whitespace-pre-wrap text-sm">{selectedScan.emailContent}</p>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}

                                {selectedScan.status && (
                                    <div>
                                        <label className="text-sm text-gray-400">Estado</label>
                                        <p className="text-white capitalize">
                                            {selectedScan.status === 'deleted' ? 'Eliminado' :
                                                selectedScan.status === 'blocked' ? 'Bloqueado' :
                                                    selectedScan.status === 'monitoring' ? 'Monitoreando' :
                                                        selectedScan.status === 'analyzed' ? 'Analizado' :
                                                            selectedScan.status}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
