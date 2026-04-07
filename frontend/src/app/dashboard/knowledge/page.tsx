/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { Search, Plus, Bot, Sparkles, UploadCloud, Link as LinkIcon, FileText, Database, X, ShoppingBag, ImageIcon, Loader2, Globe, Tag, ShieldCheck, TrendingUp, Cpu, Zap, Command, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { getKnowledgeStats, addProductAction, getProductsAction } from '@/app/actions/knowledge'
import { Input } from '@/components/ui/input'

type TabValue = 'text' | 'web' | 'pdf' | 'catalog';

export default function KnowledgeBasePage() {
    const [activeTab, setActiveTab] = useState<TabValue>('text')
    const [selectedBot, setSelectedBot] = useState<string>('all')
    const [stats, setStats] = useState({ textDocs: 0, webDocs: 0, products: 0, totalVectors: 0 })

    const fetchStats = useCallback(async () => {
        const res = await getKnowledgeStats(selectedBot)
        if (res.success) {
            setStats({
                textDocs: res.textDocs || 0,
                webDocs: res.webDocs || 0,
                products: res.products || 0,
                totalVectors: res.totalVectors || 0
            })
        }
    }, [selectedBot])

    useEffect(() => {
        fetchStats()
    }, [fetchStats])

    return (
        <div className="flex flex-col h-full bg-[#f8fafc] dark:bg-[#020617] relative">
            <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

            <header className="h-20 border-b border-slate-200 dark:border-white/5 bg-white/70 dark:bg-[#020617]/70 backdrop-blur-2xl flex items-center justify-between px-8 sticky top-0 z-50">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-slate-900 dark:bg-white rounded-2xl shadow-xl flex items-center justify-center text-white dark:text-slate-900">
                            <Database className="w-5 h-5 text-indigo-500" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">Cerebro RAG</h1>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                <Sparkles className="w-2 h-2 text-indigo-400" /> Bóveda de Vectores 768d
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden lg:flex items-center gap-2 px-4 py-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full mr-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                        <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Base de Datos Saludable</span>
                    </div>
                    <select
                        aria-label="Seleccionar Bot"
                        title="Seleccionar Bot"
                        className="h-10 bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 focus:outline-none"
                        value={selectedBot}
                        onChange={(e) => setSelectedBot(e.target.value)}
                    >
                        <option value="all">Global</option>
                        <option value="current">Bot Activo</option>
                    </select>
                    <Button size="sm" className="bg-indigo-600 text-white rounded-xl px-4 font-bold text-[10px] uppercase h-10 gap-2">
                        <Sparkles className="w-3 h-3" /> Re-Entrenar
                    </Button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto w-full max-w-[1600px] mx-auto p-6 lg:p-10 space-y-8 relative z-10">

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    {/* Left Column: Form Section */}
                    <div className="xl:col-span-8 space-y-8">
                        {/* Tab Selector Capsule */}
                        <div className="bg-white dark:bg-white/5 p-1.5 rounded-[28px] border border-slate-200 dark:border-white/10 shadow-lg flex gap-1">
                            <TabButton active={activeTab === 'text'} onClick={() => setActiveTab('text')} icon={<FileText className="w-3.5 h-3.5" />} label="Texto" />
                            <TabButton active={activeTab === 'web'} onClick={() => setActiveTab('web')} icon={<Globe className="w-3.5 h-3.5" />} label="Scraper" />
                            <TabButton active={activeTab === 'pdf'} onClick={() => setActiveTab('pdf')} icon={<UploadCloud className="w-3.5 h-3.5" />} label="PDF" />
                            <TabButton active={activeTab === 'catalog'} onClick={() => setActiveTab('catalog')} icon={<ShoppingBag className="w-3.5 h-3.5" />} label="Catálogo" />
                        </div>

                        {/* Active Form Surface */}
                        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[40px] p-8 lg:p-12 shadow-2xl min-h-[500px] transition-all relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full pointer-events-none" />

                            {activeTab === 'text' && <TextIngestForm selectedBot={selectedBot} onRefresh={fetchStats} />}
                            {activeTab === 'web' && <WebScraperForm selectedBot={selectedBot} onRefresh={fetchStats} />}
                            {activeTab === 'pdf' && <PdfUploadForm selectedBot={selectedBot} onRefresh={fetchStats} />}
                            {activeTab === 'catalog' && <CatalogProductForm selectedBot={selectedBot} onRefresh={fetchStats} />}
                        </div>
                    </div>

                    {/* Right Column: Intelligence Stats */}
                    <div className="xl:col-span-4 space-y-8">
                        <div className="bg-slate-900 rounded-[40px] p-8 text-white relative overflow-hidden shadow-2xl group">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 blur-[60px] rounded-full pointer-events-none" />

                            <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                                <Zap className="w-4 h-4" /> Diagnóstico Vectorial
                            </h3>

                            <div className="space-y-6 relative z-10">
                                <MetricItem label="Documentos Base" value={stats.textDocs.toString()} icon={<FileText className="w-4 h-4 text-slate-500" />} />
                                <MetricItem label="Páginas Scraped" value={stats.webDocs.toString()} icon={<Globe className="w-4 h-4 text-slate-500" />} />
                                <MetricItem label="Productos Visuales" value={stats.products.toString()} icon={<ShoppingBag className="w-4 h-4 text-slate-500" />} />
                                <div className="pt-6 border-t border-white/5">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Carga total</p>
                                            <h4 className="text-3xl font-black text-indigo-400 tracking-tighter">{stats.totalVectors} <span className="text-xs text-slate-600 font-bold uppercase ml-1">Vectores</span></h4>
                                        </div>
                                        <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center border border-white/10">
                                            <TrendingUp className="w-6 h-6 text-indigo-400" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity Mini-Card */}
                        <div className="bg-white dark:bg-white/5 rounded-[40px] border border-slate-200 dark:border-white/10 p-8 shadow-sm">
                            <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                <Clock className="w-3 h-3" /> Ingestas Recientes
                            </h3>
                            {stats.totalVectors === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 opacity-40 grayscale">
                                    <Database className="w-10 h-10 mb-4" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">Sin Data</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <ActivityRow label="Reglas de Negocio" time="2 min ago" />
                                    <ActivityRow label="Catálogo de Hamburguesas" time="15 min ago" />
                                    <ActivityRow label="Web Scrape: FAQ" time="1h ago" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

function TabButton({ active, icon, label, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className={`flex-1 flex items-center justify-center gap-2.5 py-3 px-6 rounded-[22px] transition-all duration-300 ${active
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl'
                : 'bg-transparent text-slate-500 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
        >
            <span className={active ? 'scale-110' : 'opacity-50'}>{icon}</span>
            <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
        </button>
    )
}

function MetricItem({ label, value, icon }: any) {
    return (
        <div className="flex items-center justify-between bg-white/5 border border-white/5 p-4 rounded-3xl group hover:bg-white/10 transition-all">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center border border-white/5">
                    {icon}
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
            </div>
            <span className="text-xl font-black text-white tracking-tighter">{value}</span>
        </div>
    )
}

function ActivityRow({ label, time }: any) {
    return (
        <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-white/5 last:border-0 group cursor-pointer">
            <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-indigo-500 transition-colors truncate max-w-[120px]">{label}</span>
            </div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{time}</span>
        </div>
    )
}

function TextIngestForm({ selectedBot, onRefresh }: any) {
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [loading, setLoading] = useState(false)

    const handleIngest = async () => {
        if (!title.trim() || !content.trim()) return toast.error('Completar campos.')
        setLoading(true)
        try {
            const res = await fetch('/api/ingest', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, content, type: 'text', botId: selectedBot }) })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            toast.success(`Capturado: ${data.chunksProcessed} vectores creados.`)
            setTitle(''); setContent(''); if (onRefresh) onRefresh()
        } catch (err: any) { toast.error(err.message) } finally { setLoading(false) }
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2">Título de Referencia</label>
                    <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ej: Protocolo de Entregas 2026" className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 h-14 rounded-2xl px-6 font-bold text-sm" />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2">Conocimiento Puro</label>
                    <textarea value={content} onChange={e => setContent(e.target.value)} rows={6} placeholder="Pega aquí el muro de texto para el entrenamiento..." className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 active:outline-none focus:outline-none transition-all resize-none" />
                </div>
            </div>
            <Button onClick={handleIngest} disabled={loading} className="w-full lg:w-max bg-indigo-600 dark:bg-white text-white dark:text-slate-900 h-14 px-12 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-3" /> : <Zap className="w-4 h-4 mr-3" />}
                {loading ? 'Sincronizando...' : 'Inyectar Conocimiento'}
            </Button>
        </div>
    )
}

function WebScraperForm({ selectedBot, onRefresh }: any) {
    const [url, setUrl] = useState('')
    const [loading, setLoading] = useState(false)

    const handleScrape = async () => {
        if (!url.startsWith('http')) return toast.error('URL Inválida')
        setLoading(true)
        try {
            const res = await fetch('/api/ingest', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: url, content: url, type: 'web', botId: selectedBot }) })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            toast.success(`URL Analizada. ${data.chunksProcessed} vectores.`)
            setUrl(''); if (onRefresh) onRefresh()
        } catch (err: any) { toast.error(err.message) } finally { setLoading(false) }
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="p-16 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[40px] bg-slate-50 dark:bg-white/5 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-white dark:bg-white/10 rounded-[32px] shadow-2xl flex items-center justify-center border border-slate-100 dark:border-white/10 mb-8">
                    <Globe className={`w-10 h-10 ${loading ? 'animate-spin text-indigo-500' : 'text-indigo-400'}`} />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter mb-4">Rasterizador de Dominios</h3>
                <div className="flex w-full max-w-md gap-2">
                    <Input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://tuempresa.com" className="flex-1 bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 h-14 rounded-2xl px-6 font-bold" />
                    <Button onClick={handleScrape} disabled={loading} className="bg-indigo-600 text-white rounded-2xl px-8 h-14">
                        {loading ? <Loader2 className="animate-spin" /> : <ChevronRight />}
                    </Button>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-6">Protocolo de Limpieza HTML Activado</p>
            </div>
        </div>
    )
}

function PdfUploadForm({ selectedBot, onRefresh }: any) {
    const [file, setFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleUpload = async () => {
        if (!file) return
        setLoading(true)
        try {
            const formData = new FormData(); formData.append('file', file); formData.append('botId', selectedBot)
            const res = await fetch('/api/ingest/pdf', { method: 'POST', body: formData })
            if (!res.ok) throw new Error('Error PDF')
            toast.success('PDF Sincronizado.')
            setFile(null); if (onRefresh) onRefresh()
        } catch (err: any) { toast.error(err.message) } finally { setLoading(false) }
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <input type="file" accept=".pdf" className="hidden" ref={fileInputRef} onChange={e => e.target.files && setFile(e.target.files[0])} />
            <div onClick={() => !loading && fileInputRef.current?.click()} className={`p-16 border-2 border-dashed rounded-[40px] cursor-pointer transition-all flex flex-col items-center ${file ? 'border-indigo-500 bg-indigo-500/5' : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:border-indigo-500/20'}`}>
                <div className="w-20 h-20 bg-white dark:bg-white/10 rounded-[32px] flex items-center justify-center mb-6 shadow-xl border border-white/5">
                    {loading ? <Loader2 className="w-10 h-10 animate-spin text-indigo-500" /> : <FileText className={`w-10 h-10 ${file ? 'text-indigo-500' : 'text-slate-300'}`} />}
                </div>
                <h3 className="text-xl font-black">{file ? file.name : 'Extracción de Texto'}</h3>
                {file && !loading && (
                    <Button onClick={e => { e.stopPropagation(); handleUpload() }} className="mt-8 bg-indigo-600 text-white px-12 h-14 rounded-2xl font-black uppercase text-xs">Iniciar Mapeo</Button>
                )}
            </div>
        </div>
    )
}

function CatalogProductForm({ selectedBot, onRefresh }: any) {
    const [name, setName] = useState('')
    const [price, setPrice] = useState('')
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [products, setProducts] = useState<any[]>([])
    const fileInputRef = useRef<HTMLInputElement>(null)

    const fetchProducts = useCallback(async () => {
        const res = await getProductsAction(selectedBot)
        if (res.success && res.products) setProducts(res.products)
    }, [selectedBot])

    useEffect(() => { fetchProducts() }, [fetchProducts])

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <Input value={name} onChange={e => setName(e.target.value)} placeholder="Nombre del Producto" className="h-14 bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-2xl px-6 font-bold" />
                    <Input value={price} onChange={e => setPrice(e.target.value)} placeholder="Precio (COP)" className="h-14 bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-2xl px-6 font-bold" />
                    <Button className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest">Registrar para RAG Visual</Button>
                </div>
                <div onClick={() => !loading && fileInputRef.current?.click()} className="aspect-video border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[32px] flex flex-col items-center justify-center bg-slate-50 dark:bg-white/5 cursor-pointer hover:border-indigo-400 overflow-hidden relative group">
                    <input type="file" ref={fileInputRef} className="hidden" onChange={e => { if (e.target.files && e.target.files[0]) { setImageFile(e.target.files[0]); setPreviewUrl(URL.createObjectURL(e.target.files[0])) } }} />
                    {previewUrl ? <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" /> : <ImageIcon className="w-10 h-10 text-slate-300" />}
                </div>
            </div>

            <div className="pt-8 border-t border-slate-100 dark:border-white/5">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Inventario Inteligente</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {products.map(p => (
                        <div key={p.id} className="aspect-square bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl p-1 relative group overflow-hidden">
                            <img src={p.image_url} alt={p.name} className="w-full h-full object-cover rounded-[14px] group-hover:scale-110 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Trash2 className="w-4 h-4 text-white hover:text-rose-500" />
                            </div>
                        </div>
                    ))}
                    {products.length === 0 && <div className="aspect-square border border-dashed border-slate-200 dark:border-white/10 rounded-2xl flex items-center justify-center text-slate-300"><Plus /></div>}
                </div>
            </div>
        </div>
    )
}
