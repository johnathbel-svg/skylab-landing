import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Settings, Key } from 'lucide-react'
import { revalidatePath } from 'next/cache'
import GoogleCredentialsForm from './GoogleCredentialsForm'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
    const supabase = await createClient()

    // 1. Obtener credenciales de Google
    const { data: configData } = await supabase
        .from('system_config')
        .select('value')
        .eq('key', 'google_drive_credentials')
        .single()

    const creds = (configData?.value as any) || {
        client_email: '',
        private_key: '',
        sheet_id: ''
    }

    // Action para guardar credenciales de Google Sheets
    async function saveGoogleCredentials(formData: FormData) {
        "use server"
        const supabase = await createClient()
        const clientEmail = formData.get('clientEmail') as string
        const privateKey = formData.get('privateKey') as string
        const sheetId = formData.get('sheetId') as string

        const jsonCreds = {
            client_email: clientEmail,
            private_key: privateKey,
            sheet_id: sheetId
        }

        // Insertar o actualizar
        await supabase
            .from('system_config')
            .upsert({ 
                key: 'google_drive_credentials',
                value: jsonCreds,
                updated_at: new Date().toISOString() 
            })

        revalidatePath('/super-admin/settings')
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
            <header className="flex flex-col gap-2">
                <h2 className="text-3xl font-display font-bold text-white tracking-tight flex items-center gap-2">
                    Configuración Global <Settings className="w-6 h-6 text-slate-400" />
                </h2>
                <p className="text-slate-400 text-sm max-w-2xl">
                    Configure las variables globales y llaves de acceso del sistema que vinculan a Skylab con otras plataformas como Google Cloud y Meta API.
                </p>
            </header>

            <div className="max-w-3xl">
                <Card className="bg-slate-900/40 border-slate-800/60 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2 text-lg">
                            <Key className="w-5 h-5 text-indigo-400" /> Integración con Google Sheets (Finanzas)
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                            Configure las credenciales de la Cuenta de Servicio de Google (Service Account) para permitir la sincronización automatizada de contabilidad y proveedores.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <GoogleCredentialsForm initialCreds={creds} saveAction={saveGoogleCredentials} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
