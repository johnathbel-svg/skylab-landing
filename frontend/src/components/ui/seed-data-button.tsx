"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Database, Loader2 } from "lucide-react"
import { seedDemoData } from "@/app/actions/seed-actions"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

export function SeedDataButton({ className }: { className?: string }) {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleSeed = async () => {
        try {
            setIsLoading(true)
            const result = await seedDemoData()

            if (result.error) {
                alert(result.error)
                return
            }

            alert("¡Datos B2B inyectados exitosamente! Recargando tablas...")
            router.refresh()

        } catch (error) {
            alert("Ocurrió un error inesperado al popular la tabla.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Button
            onClick={handleSeed}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className={cn("mt-4 text-indigo-600 border-indigo-200 bg-indigo-50 hover:bg-indigo-100 hover:text-indigo-700 transition-colors font-semibold shadow-sm", className)}
        >
            {isLoading ? (
                <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin text-indigo-500" />
                    Procesando...
                </>
            ) : (
                <>
                    <Database className="w-4 h-4 mr-2 text-indigo-500" />
                    Generar Data de Prueba B2B
                </>
            )}
        </Button>
    )
}
