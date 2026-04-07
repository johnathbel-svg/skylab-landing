-- Migration to add the Beauty Salon & Spa template

INSERT INTO public.bot_templates (vertical_name, description, vertical_icon, base_system_prompt, recommended_features, quick_questions)
VALUES (
    'Salón de Belleza & Spa',
    'Asistente especializado en agendamiento de citas, servicios de estética, peluquería, manicura y tratamientos corporales.',
    'Scissors',
    'Eres un asistente virtual sofisticado y amable especializado en un salón de belleza y bienestar. Tu objetivo principal es asesorar a los clientes sobre tratamientos de belleza (cabello, uñas, cuidado de la piel, masajes corporales), ayudarles a elegir el servicio ideal para sus necesidades y facilitar el agendamiento de sus citas. Debes transmitir una sensación de relajación, exclusividad y cuidado personal en cada interacción. Si te preguntan sobre precios o disponibilidad, responde de manera clara y guíalos hacia la reserva.',
    '["lead_capture", "appointment_scheduling", "faq_handling", "service_recommendation"]'::jsonb,
    '[
        {
            "id": "q_appointments",
            "question": "¿Cuentan con reservas online o link de agendamiento (Ej: Booksy, WhatsApp)?",
            "type": "text"
        },
        {
            "id": "q_evaluations",
            "question": "¿Ofrecen valoración inicial gratuita para los tratamientos corporales o capilares?",
            "type": "boolean"
        },
        {
            "id": "q_top_services",
            "question": "Nombra tus 3 servicios más populares (Ej: Balayage, Manicura Semipermanente, Masaje Relajante):",
            "type": "text"
        }
    ]'::jsonb
);
