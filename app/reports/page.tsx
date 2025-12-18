'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format, subMonths } from 'date-fns'

export default function ReportsPage() {
    const router = useRouter()
    const [generating, setGenerating] = useState(false)
    const [reportData, setReportData] = useState<any>(null)

    // Form state
    const [reportType, setReportType] = useState('monthly')
    const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'))
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')

    const handleGenerateReport = async () => {
        setGenerating(true)
        setReportData(null)

        try {
            const token = localStorage.getItem('token')
            if (!token) {
                router.push('/login')
                return
            }

            const body: any = { type: reportType }

            if (reportType === 'monthly') {
                body.period = selectedMonth
            } else {
                body.startDate = startDate
                body.endDate = endDate
            }

            const res = await fetch('/api/reports', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            })

            if (res.ok) {
                const data = await res.json()
                setReportData(data)
            } else {
                alert('Error al generar reporte')
            }
        } catch (error) {
            console.error('Report generation error:', error)
            alert('Error al generar reporte')
        } finally {
            setGenerating(false)
        }
    }

    const handlePrint = () => {
        window.print()
    }

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 print:hidden">
                    <h1 className="text-3xl font-bold mb-2">Reportes de Seguridad</h1>
                    <p className="text-gray-400">Genera reportes detallados de tu actividad de seguridad</p>
                </div>

                {/* Generator Form */}
                <div className="glass-panel p-6 mb-6 print:hidden">
                    <h2 className="text-xl font-semibold mb-4">Generar Nuevo Reporte</h2>

                    <div className="space-y-4">
                        {/* Report Type */}
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Tipo de Reporte</label>
                            <select
                                value={reportType}
                                onChange={(e) => setReportType(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white"
                            >
                                <option value="monthly">Mensual</option>
                                <option value="custom">Rango Personalizado</option>
                            </select>
                        </div>

                        {reportType === 'monthly' ? (
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Mes</label>
                                <input
                                    type="month"
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white"
                                />
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Fecha Inicio</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Fecha Fin</label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white"
                                    />
                                </div>
                            </div>
                        )}

                        <button
                            onClick={handleGenerateReport}
                            disabled={generating}
                            className="cyber-button px-6 py-3 disabled:opacity-50"
                        >
                            {generating ? 'Generando...' : '📊 Generar Reporte'}
                        </button>
                    </div>
                </div>

                {/* Report Display */}
                {reportData && (
                    <>
                        <div className="glass-panel p-8 mb-6">
                            {/* Report Header */}
                            <div className="border-b border-white/10 pb-6 mb-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h1 className="text-3xl font-bold mb-2">Reporte de Seguridad</h1>
                                        <p className="text-gray-400">{reportData.stats.period}</p>
                                        <p className="text-sm text-gray-500 mt-1">{reportData.userName} ({reportData.userEmail})</p>
                                    </div>
                                    <div className="text-right print:hidden">
                                        <button
                                            onClick={handlePrint}
                                            className="cyber-button-secondary px-4 py-2 text-sm"
                                        >
                                            🖨️ Imprimir/Guardar PDF
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Executive Summary */}
                            <div className="mb-8">
                                <h2 className="text-2xl font-semibold mb-4">Resumen Ejecutivo</h2>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                                        <p className="text-sm text-gray-400">Total Escaneos</p>
                                        <p className="text-3xl font-bold text-blue-400">{reportData.stats.totalScans}</p>
                                    </div>
                                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                                        <p className="text-sm text-gray-400">Amenazas Detectadas</p>
                                        <p className="text-3xl font-bold text-red-400">{reportData.stats.totalThreats}</p>
                                    </div>
                                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                                        <p className="text-sm text-gray-400">Riesgo Alto</p>
                                        <p className="text-3xl font-bold text-yellow-400">{reportData.stats.highRiskThreats}</p>
                                    </div>
                                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                                        <p className="text-sm text-gray-400">Bloqueadas</p>
                                        <p className="text-3xl font-bold text-green-400">{reportData.stats.blockedThreats}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Threat Distribution */}
                            <div className="mb-8">
                                <h2 className="text-2xl font-semibold mb-4">Distribución de Amenazas</h2>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-white/5 rounded-lg p-4">
                                        <p className="text-sm text-gray-400">Por Severidad</p>
                                        <div className="mt-2 space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-red-400">Alto</span>
                                                <span className="font-bold">{reportData.stats.highRiskThreats}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-yellow-400">Medio</span>
                                                <span className="font-bold">{reportData.stats.mediumRiskThreats}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-green-400">Bajo</span>
                                                <span className="font-bold">{reportData.stats.lowRiskThreats}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white/5 rounded-lg p-4">
                                        <p className="text-sm text-gray-400">Por Tipo</p>
                                        <div className="mt-2 space-y-2">
                                            <div className="flex justify-between">
                                                <span>🔗 URLs</span>
                                                <span className="font-bold">{reportData.stats.urlThreats}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>📧 Emails</span>
                                                <span className="font-bold">{reportData.stats.emailThreats}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>📄 Facturas</span>
                                                <span className="font-bold">{reportData.stats.invoiceThreats}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white/5 rounded-lg p-4">
                                        <p className="text-sm text-gray-400">Red</p>
                                        <div className="mt-2 space-y-2">
                                            <div className="flex justify-between">
                                                <span>Total Escaneos</span>
                                                <span className="font-bold">{reportData.stats.networkScans}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-red-400">Bloqueadas</span>
                                                <span className="font-bold">{reportData.stats.blockedConnections}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Top Threats */}
                            {reportData.stats.topThreats.length > 0 && (
                                <div className="mb-8">
                                    <h2 className="text-2xl font-semibold mb-4">Top 10 Amenazas Críticas</h2>
                                    <div className="bg-white/5 rounded-lg overflow-hidden">
                                        <table className="w-full">
                                            <thead className="bg-white/5">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs text-gray-400">Tipo</th>
                                                    <th className="px-4 py-3 text-left text-xs text-gray-400">Origen</th>
                                                    <th className="px-4 py-3 text-left text-xs text-gray-400">Descripción</th>
                                                    <th className="px-4 py-3 text-left text-xs text-gray-400">Fecha</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {reportData.stats.topThreats.map((threat: any, idx: number) => (
                                                    <tr key={idx} className="border-t border-white/5">
                                                        <td className="px-4 py-3 text-sm">{threat.type}</td>
                                                        <td className="px-4 py-3 text-sm truncate max-w-xs">{threat.origin}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-400">{threat.description.substring(0, 50)}...</td>
                                                        <td className="px-4 py-3 text-sm text-gray-400">
                                                            {new Date(threat.date).toLocaleDateString('es-ES')}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Recommendations */}
                            <div>
                                <h2 className="text-2xl font-semibold mb-4">Recomendaciones</h2>
                                <div className="space-y-3">
                                    {reportData.stats.highRiskThreats > 10 && (
                                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                                            <p className="font-medium text-red-400">⚠️ Alto Número de Amenazas Críticas</p>
                                            <p className="text-sm text-gray-400 mt-1">
                                                Se detectaron {reportData.stats.highRiskThreats} amenazas de alto riesgo.
                                                Considera aumentar la frecuencia de escaneos y capacitar al equipo.
                                            </p>
                                        </div>
                                    )}
                                    {reportData.stats.totalScans < 50 && (
                                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                                            <p className="font-medium text-yellow-400">💡 Aumentar Frecuencia de Escaneos</p>
                                            <p className="text-sm text-gray-400 mt-1">
                                                Solo se realizaron {reportData.stats.totalScans} escaneos este período.
                                                Recomendamos escanear contenido sospechoso proactivamente.
                                            </p>
                                        </div>
                                    )}
                                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                                        <p className="font-medium text-green-400">✅ Continuar Buenas Prácticas</p>
                                        <p className="text-sm text-gray-400 mt-1">
                                            Mantener la protección activa y revisar regularmente el historial de amenazas.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="mt-8 pt-6 border-t border-white/10 text-center text-sm text-gray-500">
                                <p>Reporte generado por CyberShield el {new Date().toLocaleDateString('es-ES')}</p>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    body {
                        background: white;
                        color: black;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    )
}
