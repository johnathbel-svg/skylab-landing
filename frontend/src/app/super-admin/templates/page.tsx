import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { BookOpen, Sparkles, MessageSquare, ArrowRight, Save, Database, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

export default async function TemplatesPage() {
    const supabase = await createClient()

    // 1. Obtener todas las plantillas
    const { data: templates } = await supabase
        .from('bot_templates')
        .select('*')
        .order('vertical_name')

    // Server Action para actualizar el system prompt de la plantilla
    async function updateTemplatePrompt(formData: FormData) {
        "use server"
        const supabase = await createClient()
        const templateId = formData.get('templateId') as string
        const baseSystemPrompt = formData.get('baseSystemPrompt') as string

        await supabase
            .from('bot_templates')
            .update({ 
                base_system_prompt: baseSystemPrompt,
                updated_at: new Date().toISOString() 
            })
            .eq('id', templateId)

        revalidatePath('/super-admin/templates')
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
            <header className="flex flex-col gap-2">
                <h2 className="text-3xl font-display font-bold text-white tracking-tight flex items-center gap-2">
                    Plantillas de Agente <BookOpen className="w-6 h-6 text-violet-400" />
                </h2>
                <p className="text-slate-400 text-sm max-w-2xl">
                    Administración de agentes inteligentes preconfigurados por vertical. Diseña prompts base recomendados que los inquilinos usarán al crear nuevos bots.
                </p>
            </header>

            {/* Grid de Plantillas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {templates?.map((template) => (
                    <Card key={template.id} className="bg-slate-900/40 border-slate-800/60 backdrop-blur-xl hover:border-slate-700/60 transition-all flex flex-col group">
                        <CardHeader className="flex flex-row items-start justify-between pb-3">
                            <div className="space-y-1">
                                <CardTitle className="text-white text-lg font-bold flex items-center gap-2">
                                    <span className="text-2xl">{template.vertical_icon || 'ðŸ¤–'}</span> {template.vertical_name}
                                </CardTitle>
                                <span className="text-[10px] text-slate-500 font-mono block">ID: {template.id}</span>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
                            <p className="text-xs text-slate-400 leading-relaxed">{template.description}</p>

                            {/* Features Recomendadas */}
                            {template.recommended_features && (
                                <div className="flex flex-wrap gap-1.5 pt-2">
                                    {(template.recommended_features as string[]).map((feature: string, idx: number) => (
                                        <span key={idx} className="px-2 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20 text-[10px] font-semibold">
                                            {feature}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Editor de Prompt Base */}
                            <form action={updateTemplatePrompt} className="space-y-3 pt-4 border-t border-slate-800/40 flex-1 flex flex-col">
                                <input type="hidden" name="templateId" value={template.id} />
                                <div className="space-y-1 flex-1 flex flex-col">
                                    <label className="text-[10px] font-black tracking-widest text-slate-500 uppercase">Base System Prompt</label>
                                    <textarea 
                                        aria-label="Base System Prompt"
                                        name="baseSystemPrompt" 
                                        defaultValue={template.base_system_prompt} 
                                        className="w-full h-32 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-300 focus:outline-none focus:border-indigo-500/50 resize-none flex-1"
                                    />
                                </div>

                                <Button type="submit" variant="outline" size="sm" className="w-full border-slate-800 text-xs font-bold hover:bg-violet-500/10 hover:text-violet-400 hover:border-violet-500/40 py-2 h-9 flex items-center justify-center gap-2">
                                    <Save className="w-4 h-4" /> Guardar Prompt Base
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                ))}

                {(!templates || templates.length === 0) && (
                    <Card className="col-span-2 bg-slate-900/40 border-slate-800/60 p-12 text-center">
                        <Database className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400 text-sm font-medium">No templates found.</p>
                        <p className="text-xs text-slate-500 mt-1">Please populate the bot_templates table in the database.</p>
                    </Card>
                )}
            </div>
        </div>
    )
}