"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/utils/supabase/server"
import { google } from "googleapis"

// Helpers for date parsing
function parseSpanishDate(dateStr: string): string | null {
    if (!dateStr) return null;
    const clean = dateStr.trim();
    if (clean === "-" || clean === "—") return null;

    // YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
        return clean;
    }

    // Try standard JS date parsing (e.g. ISO format)
    const parsedDate = new Date(clean);
    if (!isNaN(parsedDate.getTime()) && clean.includes("-") && clean.indexOf("-") === 4) {
        return parsedDate.toISOString().split("T")[0];
    }

    // DD/MM/YYYY or DD-MM-YYYY
    const parts = clean.split(/[\/\-]/);
    if (parts.length === 3) {
        let day, month, year;
        if (parts[2].length === 4) {
            day = parseInt(parts[0], 10);
            month = parseInt(parts[1], 10);
            year = parseInt(parts[2], 10);
        } else if (parts[0].length === 4) {
            year = parseInt(parts[0], 10);
            month = parseInt(parts[1], 10);
            day = parseInt(parts[2], 10);
        }
        if (day && month && year) {
            const d = new Date(year, month - 1, day);
            if (!isNaN(d.getTime())) {
                return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
            }
        }
    }
    return null;
}

function parseBillingCycleEnd(venceStr: string): string | null {
    if (!venceStr) return null;
    const clean = venceStr.toLowerCase().trim();
    if (clean === "-" || clean === "—" || clean === "verificar") return null;

    // Check if standard date format first
    const stdDate = parseSpanishDate(venceStr);
    if (stdDate) return stdDate;

    // Handle "día X" or "dia X" or just a number
    const match = clean.match(/(?:d\u00EDa|dia)?\s*(\d+)/i);
    if (match) {
        const dayNum = parseInt(match[1], 10);
        if (dayNum >= 1 && dayNum <= 31) {
            const now = new Date();
            let year = now.getFullYear();
            let month = now.getMonth();

            if (now.getDate() > dayNum) {
                month += 1;
                if (month > 11) {
                    month = 0;
                    year += 1;
                }
            }

            const targetDate = new Date(year, month, dayNum);
            if (targetDate.getMonth() !== (month % 12)) {
                const lastDay = new Date(year, month + 1, 0);
                return lastDay.toISOString().split("T")[0];
            }
            return targetDate.toISOString().split("T")[0];
        }
    }
    return null;
}

// Fuzzy matching helper
function findProviderMatch(sheetName: string, dbProviders: any[]): any {
    const sName = sheetName.toLowerCase();
    const keywords = [
        { key: "openai", dbKeys: ["openai"] },
        { key: "anthropic", dbKeys: ["anthropic", "claude"] },
        { key: "claude", dbKeys: ["anthropic", "claude"] },
        { key: "gemini", dbKeys: ["gemini"] },
        { key: "whatsapp", dbKeys: ["whatsapp", "meta"] },
        { key: "meta", dbKeys: ["whatsapp", "meta"] },
        { key: "supabase", dbKeys: ["supabase"] },
        { key: "hetzner", dbKeys: ["hetzner"] },
        { key: "hostinger", dbKeys: ["hostinger"] },
        { key: "cloudflare", dbKeys: ["cloudflare"] },
        { key: "github", dbKeys: ["github"] },
        { key: "certbot", dbKeys: ["certbot"] }
    ];

    for (const item of keywords) {
        if (sName.includes(item.key)) {
            const match = dbProviders.find(p => {
                const pName = p.name.toLowerCase();
                return item.dbKeys.some(dk => pName.includes(dk));
            });
            if (match) return match;
        }
    }

    return dbProviders.find(p => 
        p.name.toLowerCase().includes(sName) || 
        sName.includes(p.name.toLowerCase())
    );
}

export async function syncFinancesWithGoogleSheets() {
    const supabase = await createClient();

    try {
        // 1. Obtener credenciales de system_config
        const { data: configData, error: configError } = await supabase
            .from("system_config")
            .select("value")
            .eq("key", "google_drive_credentials")
            .single();

        if (configError || !configData) {
            return { 
                success: false, 
                error: "Google Sheets credentials not found. Please configure them in Global Settings." 
            };
        }

        const creds = configData.value as any;
        if (!creds.sheet_id) {
            return { 
                success: false, 
                error: "Google Spreadsheet ID is required. Please configure it in Global Settings." 
            };
        }

        // 2. Conectar a Google Sheets API
        let sheets;
        if (creds.private_key && creds.private_key.startsWith("AIzaSy")) {
            // API Key Authentication (self-healing for standard Google Cloud API Key)
            sheets = google.sheets({ version: "v4", auth: creds.private_key });
        } else {
            // Service Account JWT Authentication
            if (!creds.client_email || !creds.private_key) {
                return { 
                    success: false, 
                    error: "Invalid credentials format. Service Account authentication requires both Client Email and Private Key." 
                };
            }
            const auth = new google.auth.JWT({
                email: creds.client_email,
                key: creds.private_key.replace(/\\n/g, "\n"),
                scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"]
            });
            sheets = google.sheets({ version: "v4", auth });
        }

        // A. Sincronizar Transacciones Financieras desde registro rapido
        let txMessage = "No procesada";
        let txSuccess = false;
        try {
            const responseTx = await sheets.spreadsheets.values.get({
                spreadsheetId: creds.sheet_id,
                range: "REGISTRO_RÁPIDO!A5:M5000",
            });

            const rowsTx = responseTx.data.values;
            if (rowsTx && rowsTx.length > 0) {
                const transactions = rowsTx
                    .filter(row => row[1] && row[3] && row[5]) // Fecha (B/1), Concepto (D/3), Tipo (F/5)
                    .map((row) => {
                        const dateStr = row[1];
                        const description = row[3];
                        const category = row[4] || "General";
                        const typeStr = row[5].toLowerCase().trim();
                        const amountStr = row[12] || row[8] || row[7] || "0";

                        // Limpiar y parsear monto
                        const cleanAmount = amountStr.replace(/[^0-9,\-]/g, "").replace(",", ".");
                        const amount = parseFloat(cleanAmount);
                        
                        const type = typeStr === "ingreso" || typeStr === "income" ? "income" : "expense";

                        // Formatear fecha robustamente
                        const date = parseSpanishDate(dateStr) || new Date().toISOString().split("T")[0];

                        return {
                            date,
                            description,
                            category,
                            amount: isNaN(amount) ? 0.0 : amount,
                            type
                        };
                    });

                if (transactions.length > 0) {
                    // Borrar transacciones de forma idempotente
                    const { error: deleteError } = await supabase
                        .from("finance_transactions")
                        .delete()
                        .neq("description", "DELETING_ALL_TRANSACTIONS_BY_DUMMY_NEQ");

                    if (deleteError) {
                        throw new Error("Database clean error: " + deleteError.message);
                    }

                    const { error: insertError } = await supabase
                        .from("finance_transactions")
                        .insert(transactions);

                    if (insertError) {
                        txMessage = "Error de base de datos: " + insertError.message;
                    } else {
                        txSuccess = true;
                        txMessage = "Sincronizadas " + transactions.length + " transacciones.";
                    }
                } else {
                    txMessage = "No se encontraron transacciones válidas en REGISTRO_RÁPIDO.";
                }
            } else {
                txMessage = "La hoja REGISTRO_RÁPIDO está vacía o el rango es inválido.";
            }
        } catch (err: any) {
            txMessage = "Error al leer REGISTRO_RÁPIDO: " + err.message;
        }

        // B. Sincronizar Costo y Fecha de Proveedores desde suscripciones
        let subMessage = "No procesada";
        let subSuccess = false;
        try {
            const responseSub = await sheets.spreadsheets.values.get({
                spreadsheetId: creds.sheet_id,
                range: "SUSCRIPCIONES!A7:I100", // Cabecera en fila 6, datos fila 7+
            });

            const rowsSub = responseSub.data.values;
            if (rowsSub && rowsSub.length > 0) {
                const { data: existingProviders, error: fetchErr } = await supabase
                    .from("provider_subscriptions")
                    .select("*");

                if (fetchErr) {
                    throw new Error("Error fetching providers: " + fetchErr.message);
                }

                let updatedCount = 0;
                let insertedCount = 0;

                for (const row of rowsSub) {
                    const name = row[1]; // SERVICIO (Col B / 1)
                    if (!name) continue;

                    const costOrigStr = row[4] || "0"; // COSTO/MES(ORIG) (Col E / 4)
                    const costCopStr = row[5] || "0"; // COSTO/MES COP (Col F / 5)
                    const venceStr = row[7]; // VENCE (Col H / 7)

                    const costOrig = parseFloat(costOrigStr.replace(/[^0-9,\-]/g, "").replace(",", "."));
                    const costCop = parseFloat(costCopStr.replace(/[^0-9,\-]/g, "").replace(",", "."));

                    // Usamos el costo original si es mayor a cero, de lo contrario usamos COP
                    const costThisMonth = costOrig > 0 ? costOrig : costCop;

                    // Formatear fecha de vencimiento a YYYY-MM-DD
                    const billingCycleEnd = parseBillingCycleEnd(venceStr);

                    // Buscar si existe un proveedor por coincidencia inteligente
                    const match = findProviderMatch(name, existingProviders || []);

                    if (match) {
                        await supabase
                            .from("provider_subscriptions")
                            .update({
                                cost_this_month: costThisMonth,
                                ...(billingCycleEnd ? { billing_cycle_end: billingCycleEnd } : {}),
                                updated_at: new Date().toISOString()
                            })
                            .eq("id", match.id);
                        updatedCount++;
                    } else {
                        // Crear nuevo proveedor si no coincide
                        const startCycle = new Date();
                        startCycle.setDate(1);
                        const billingCycleStart = startCycle.toISOString().split("T")[0];

                        await supabase
                            .from("provider_subscriptions")
                            .insert({
                                name,
                                cost_this_month: costThisMonth,
                                spending_limit: 100.0, // presupuesto por defecto
                                billing_cycle_start: billingCycleStart,
                                ...(billingCycleEnd ? { billing_cycle_end: billingCycleEnd } : {}),
                                status: "active",
                                created_at: new Date().toISOString(),
                                updated_at: new Date().toISOString()
                            });
                        insertedCount++;
                    }
                }
                subSuccess = true;
                subMessage = "Sincronizados (Actualizados: " + updatedCount + ", Creados: " + insertedCount + ") proveedores de API.";
            } else {
                subMessage = "La hoja SUSCRIPCIONES está vacía o el rango es inválido.";
            }
        } catch (err: any) {
            subMessage = "Error al leer SUSCRIPCIONES: " + err.message;
        }

        revalidatePath("/super-admin/finances");
        revalidatePath("/super-admin/providers");

        if (txSuccess || subSuccess) {
            return {
                success: true,
                message: "Finanzas: " + txMessage + " | Proveedores: " + subMessage
            };
        } else {
            return {
                success: false,
                error: "Sincronización fallida. Finanzas: " + txMessage + " • Proveedores: " + subMessage
            };
        }

    } catch (error: any) {
        console.error("[FAST-ORDER-INV] Finance/Providers Sync Error:", error.message);
        return { success: false, error: error.message };
    }
}

export async function testGoogleSheetsConnection(clientEmail: string, privateKey: string, sheetId: string) {
    try {
        if (!sheetId) {
            return { success: false, error: "El ID de la hoja de cálculo es obligatorio." };
        }

        let sheets;
        if (privateKey && privateKey.startsWith("AIzaSy")) {
            // API Key Authentication
            sheets = google.sheets({ version: "v4", auth: privateKey });
        } else {
            // Service Account JWT Authentication
            if (!clientEmail || !privateKey) {
                return { 
                    success: false, 
                    error: "La autenticación de Cuenta de Servicio requiere tanto el correo como la clave privada." 
                };
            }
            const auth = new google.auth.JWT({
                email: clientEmail,
                key: privateKey.replace(/\\n/g, "\n"),
                scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"]
            });
            sheets = google.sheets({ version: "v4", auth });
        }

        // Intentar obtener las propiedades del Spreadsheet
        const response = await sheets.spreadsheets.get({
            spreadsheetId: sheetId,
        });

        const title = response.data.properties?.title || "Sin título";
        return { 
            success: true, 
            message: "Conexión establecida con éxito con el archivo \"" + title + "\"" 
        };

    } catch (err: any) {
        console.error("[FAST-ORDER-INV] Test Connection Error:", err.message);
        return { 
            success: false, 
            error: err.message || "Error desconocido de conexión." 
        };
    }
}