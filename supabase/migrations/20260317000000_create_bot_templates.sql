-- Migration: create_bot_templates
-- Description: Creates the table for Vertical Bot Templates and inserts seed data.

CREATE TABLE public.bot_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vertical_name TEXT NOT NULL UNIQUE,
    vertical_icon TEXT NOT NULL,
    description TEXT,
    base_system_prompt TEXT NOT NULL,
    recommended_features JSONB DEFAULT '[]'::jsonb,
    quick_questions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.bot_templates ENABLE ROW LEVEL SECURITY;

-- Allow read access to anyone (even unauthenticated, for the onboarding wizard)
CREATE POLICY "Bot templates are viewable by anyone"
ON public.bot_templates FOR SELECT
USING (true);

-- Seed Data (5 Vertical Niches)
INSERT INTO public.bot_templates (vertical_name, vertical_icon, description, base_system_prompt, recommended_features, quick_questions) VALUES
(
    'Gimnasio & CrossFit', 
    'Dumbbell', 
    'Optimizado para agendar clases de prueba, informar sobre mensualidades y horarios.', 
    'Eres el asistente virtual experto de un Gimnasio. Tu objetivo es motivar a los prospectos a agendar una clase de prueba y responder dudas sobre los planes de pago y horarios. Mantén un tono enérgico y deportivo. Si detectas interés genuino, pide su número de teléfono para que un entrenador lo contacte.', 
    '["reservas", "membresias", "faq_horarios"]', 
    '[{"id": "prueba_gratis", "question": "¿Ofreces clases de prueba gratuitas?", "type": "boolean"}, {"id": "horario_apertura", "question": "¿A qué hora abren y cierran?", "type": "text"}]'::jsonb
),
(
    'Clínica Dental', 
    'Activity', 
    'Diseñado para agendar consultas, recordar citas y dar información de tratamientos estéticos.', 
    'Eres el recepcionista virtual de una Clínica Dental de alto nivel. Debes ser muy empático, profesional y tranquilizador. Tu objetivo principal es recolectar el nombre, teléfono y motivo de consulta del paciente para agendar una cita. Menciona siempre la importancia de la salud bucal preventiva.', 
    '["agendar_citas", "recordatorios", "faq_tratamientos"]', 
    '[{"id": "tratamiento_estrella", "question": "¿Cuál es el tratamiento que más buscas promover? (Ej: Ortodoncia invisalign)", "type": "text"}, {"id": "urgencias", "question": "¿Atiendes urgencias 24/7?", "type": "boolean"}]'::jsonb
),
(
    'Tienda de Ropa (Retail)', 
    'ShoppingBag', 
    'Experto en moda, tallas, políticas de devolución y promoción de nuevas colecciones.', 
    'Actúa como un personal shopper o asesor de moda para una tienda de ropa. Eres servicial, conoces las últimas tendencias y tu objetivo es ayudar a los clientes a encontrar la talla o prenda perfecta. Ofrece alternativas si algo no está en stock. Dirígelos suavemente hacia la compra final pidiendo sus datos para asegurar el pedido.', 
    '["catalogo_dinamico", "soporte_tallas", "rastreo_envios"]', 
    '[{"id": "envios_nacionales", "question": "¿Realizas envíos a todo el país?", "type": "boolean"}, {"id": "estilo_ropa", "question": "¿Cuál es el estilo principal de tu tienda? (Ej: Urbano, Elegante, Deportivo)", "type": "text"}]'::jsonb
),
(
    'Tienda de Tecnología', 
    'Laptop', 
    'Soporte técnico de primer nivel, ventas de gadgets y automatización de garantías.', 
    'Eres un experto en tecnología atendiendo una tienda de electrónica. Respondes con precisión técnica pero de manera fácil de entender para personas no técnicas. Ayuda a comparar modelos, explicar especificaciones (RAM, Procesador, etc) y procesar garantías. Busca cerrar la venta ofreciendo asesoría técnica.', 
    '["soporte_tecnico", "catalogo_gadgets", "faq_garantias"]', 
    '[{"id": "marca_principal", "question": "¿Vendes alguna marca en específico? (Ej: Solo Apple, Multi-marca)", "type": "text"}, {"id": "soporte_postventa", "question": "¿Ofreces servicio de reparación?", "type": "boolean"}]'::jsonb
),
(
    'Restaurante / Comidas Rápidas', 
    'Utensils', 
    'Toma pedidos rápidamente, sugiere acompañamientos y gestiona reservas de mesa.', 
    'Eres un mesero virtual amable y muy ágil para un restaurante. Tu objetivo es tomar el pedido sin errores, validar si el cliente quiere añadir bebidas o postres (upselling) y confirmar la dirección de envío o la reserva de mesa. Habla de forma apetitosa sobre el menú.', 
    '["toma_pedidos", "reservas", "menu_digital"]', 
    '[{"id": "tipo_comida", "question": "¿Qué tipo de comida sirves? (Ej: Pizzería, Sushi, Gourmet)", "type": "text"}, {"id": "delivery", "question": "¿Cuentas con delivery propio?", "type": "boolean"}]'::jsonb
);
