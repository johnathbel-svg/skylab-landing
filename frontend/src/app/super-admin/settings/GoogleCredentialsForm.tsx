'use client'

import React, { useState } from 'react'
import { Save, Key, Database, Mail, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { testGoogleSheetsConnection } from '../finances/actions'
import { toast } from 'sonner'

interface GoogleCredentialsFormProps {
    initialCreds: {
        client_email: string
        private_key: string
        sheet_id: string
    }
    saveAction: (formData: FormData) => Promise<void>
}

export default function GoogleCredentialsForm({ initialCreds, saveAction }: GoogleCredentialsFormProps) {
    const [clientEmail, setClientEmail] = useState(initialCreds.client_email || '')
    const [privateKey, setPrivateKey] = useState(initialCreds.private_key || '')
    const [sheetId, setSheetId] = useState(initialCreds.sheet_id || '')
    const [isTesting, setIsTesting] = useState(false)
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
    const [isSaving, setIsSaving] = useState(false)

    const handleTestConnection = async (e: React.MouseEvent) => {
        e.preventDefault()
        setIsTesting(true)
        setTestResult(null)
        try {
            const res = await testGoogleSheetsConnection(clientEmail, privateKey, sheetId)
            if (res.success) {
                setTestResult({ success: true, message: res.message || 'Conexión exitosa' })
                toast.success('Conexión con Google Sheets verificada correctamente.')
            } else {
                setTestResult({ success: false, message: res.error || 'Error al conectar' })
                toast.error('Fallo en la conexión de Google Sheets.')
            }
        } catch (err: any) {
            setTestResult({ success: false, message: err.message || 'Error desconocido' })
            toast.error('Error al probar la conexión.')
        } finally {
            setIsTesting(false)
        }
    }

    return (
        <form 
            onSubmit={async (e) => {
                e.preventDefault()
                setIsSaving(true)
                try {
                    const formData = new FormData()
                    formData.append('clientEmail', clientEmail)
                    formData.append('privateKey', privateKey)
                    formData.append('sheetId', sheetId)
                    await saveAction(formData)
                    toast.success('Configuración guardada correctamente.')
                } catch (err: any) {
                    toast.error('Error al guardar la configuración: ' + err.message)
                } finally {
                    setIsSaving(false)
                }
            }} 
            className="space-y-5"
        >
            {/* Client Email */}
            <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-slate-500" /> Client Email (Google Service Account)
                </label>
                <input 
                    aria-label="Client Email"
                    type="text" 
                    value={clientEmail} 
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="ejemplo@proyecto.iam.gserviceaccount.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 font-mono"
                />
            </div>

            {/* Spreadsheet ID */}
            <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-slate-500" /> Google Spreadsheet ID
                </label>
                <input 
                    aria-label="Google Spreadsheet ID"
                    type="text" 
                    value={sheetId} 
                    onChange={(e) => setSheetId(e.target.value)}
                    placeholder="1BxuhPTkzzwYggLPSntKmce2rxSeoPYgWSRXtspbHp-E"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 font-mono"
                />
            </div>

            {/* Private Key */}
            <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-slate-500" /> Private Key (Service Account PKCS8 JSON o API Key)
                </label>
                <textarea 
                    aria-label="Private Key"
                    value={privateKey} 
                    onChange={(e) => setPrivateKey(e.target.value)}
                    placeholder="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC..."
                    className="w-full h-44 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 focus:outline-none focus:border-indigo-500/50 font-mono resize-none"
                />
                <p className="text-[10px] text-slate-500">
                    Asegúrese de incluir las marcas de inicio y fin de la llave privada. Las secuencias literales '\n' serán reemplazadas por saltos de línea al conectar en el servidor de forma transparente.
                </p>
            </div>

            {/* Connection Test Result Banner */}
            {testResult && (
                <div className={`p-4 rounded-xl border flex items-start gap-3 animate-in fade-in slide-in-from-top-1 duration-200 ${testResult.success ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                    {testResult.success ? <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />}
                    <div>
                        <h4 className="font-bold text-xs uppercase tracking-wider">{testResult.success ? 'Conexión Exitosa' : 'Fallo de Conexión'}</h4>
                        <p className="text-xs mt-1 leading-relaxed">{testResult.message}</p>
                    </div>
                </div>
            )}

            {/* Actions Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button 
                    type="submit" 
                    disabled={isSaving}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all flex-1 sm:flex-none cursor-pointer"
                >
                    {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Guardar Configuración
                </Button>
                
                <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isTesting}
                    className="px-6 py-2.5 text-sm font-bold border border-slate-800 hover:bg-slate-900 text-slate-350 hover:text-white rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer flex-1 sm:flex-none disabled:opacity-50"
                >
                    {isTesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    Probar Conexión
                </button>
            </div>
        </form>
    )
}
