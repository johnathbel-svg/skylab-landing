# Plan de Desarrollo — Plataforma SaaS de Chatbots Inteligentes + CRM Multicanal

> **Hoja de ruta técnica completa — MVP a Producción**
> Versión 1.0 · Confidencial · Marzo 2026

---

## Resumen ejecutivo

Este documento define el plan de desarrollo técnico completo para construir la plataforma SaaS de chatbots con CRM integrado. Está organizado en **5 fases secuenciales** que cubren desde la infraestructura base hasta el ecosistema completo en producción.

**Objetivo del producto:** Construir la plataforma de chatbots más humanizada, completa y accesible del mercado hispano: con builder guiado por industria, base de conocimiento vectorial con Gemini, CRM nativo, motor de humanización con delays adaptativos, y soporte para WhatsApp, Telegram, Instagram y web widget en un solo ecosistema.

### Estructura del plan

| Fase | Nombre | Duración | Objetivo principal | Entregable clave |
|:----:|--------|----------|-------------------|-----------------|
| **1** | Fundación e Infraestructura | 6 semanas | Base técnica sólida y segura | Entorno cloud + auth + CI/CD |
| **2** | MVP Core | 8 semanas | Bot funcional con RAG + Telegram | Bot en producción con 10 beta testers |
| **3** | Canales y CRM | 8 semanas | WhatsApp + IG + CRM completo | Plataforma multicanal con pipeline leads |
| **4** | Humanización y Automatización | 6 semanas | Motor de humanización + automations | Bot que supera el Test Turing de chat |
| **5** | Escala y Ecosistema | 8 semanas | Analytics + Agencias + White-label | Plataforma lista para 500+ clientes |

### Equipo requerido

| Rol | Responsabilidad principal | Fase de entrada | Tipo |
|-----|--------------------------|:--------------:|------|
| Tech Lead / Arquitecto | Decisiones técnicas, revisión de código, arquitectura | Fase 1 | Full-time |
| Backend Developer ×2 | APIs, lógica de negocio, integraciones, RAG engine | Fase 1 | Full-time |
| Frontend Developer | Dashboard, builder, widget de chat, CRM UI | Fase 1 | Full-time |
| IA / ML Engineer | Pipelines RAG, Gemini, embeddings, humanización | Fase 2 | Full-time |
| DevOps Engineer | GCP, CI/CD, seguridad, monitoreo, escalabilidad | Fase 1 | Part-time → Full |
| QA Engineer | Testing, automatización de pruebas, estabilidad | Fase 2 | Part-time |

### Principios de desarrollo

- **Seguridad desde el día 1:** multi-tenancy aislado, cifrado en reposo y tránsito desde la Fase 1
- **API-first:** todos los módulos se construyen con API REST bien documentada antes de la UI
- **Observabilidad:** logs estructurados, métricas y alertas desde el primer deploy
- **Calidad sobre velocidad:** cada feature pasa por QA antes de merge a `main`
- **Iteración con usuarios reales:** beta testers activos desde la Fase 2, semana 1

---

## Fase 1 — Fundación e Infraestructura

> **El esqueleto sobre el que se construye todo · 6 semanas**

Antes de escribir una sola línea de lógica de negocio, la infraestructura debe estar en pie, segura y automatizada. Esta fase no produce features visibles para el usuario final, pero es la que determina si el producto puede escalar o se romperá bajo carga.

---

### Sprint 1 — Infraestructura Cloud y CI/CD _(Semanas 1–2)_

| # | Tarea | Responsable | Criterio de éxito |
|---|-------|-------------|------------------|
| 1.1 | Configurar proyecto GCP: VPC, subnets, firewall rules, IAM roles | DevOps | Entornos dev/staging/prod aislados |
| 1.2 | Configurar Cloud SQL (PostgreSQL) con réplica de lectura | DevOps + Backend | Conexión segura desde app, backup automático |
| 1.3 | Configurar Redis (Cloud Memorystore) para cache y sesiones | DevOps | Latencia < 5ms desde app servers |
| 1.4 | Configurar Cloud Storage para docs, media y assets | DevOps | Buckets por tenant, políticas IAM correctas |
| 1.5 | Pipeline CI/CD con GitHub Actions (lint → test → build → deploy) | DevOps + Tech Lead | Deploy automático a staging en cada PR mergeado |
| 1.6 | Configurar Docker + Cloud Run para APIs Node.js y Python | DevOps | Imágenes < 500MB, deploy en < 2 min |
| 1.7 | Dominio, SSL (Let's Encrypt), CDN (Cloud CDN / Cloudflare) | DevOps | HTTPS forzado, headers de seguridad correctos |

### Sprint 2 — Base de datos, Auth y Estructura Multi-tenant _(Semanas 3–4)_

| # | Tarea | Responsable | Criterio de éxito |
|---|-------|-------------|------------------|
| 2.1 | Diseño del schema PostgreSQL: tenants, users, bots, conversations, contacts, knowledge_docs | Tech Lead + Backend | ERD aprobado, migraciones con Prisma/Drizzle |
| 2.2 | Implementar Row Level Security (RLS) en PostgreSQL para multi-tenancy | Backend | Tenant A no puede acceder a datos de Tenant B bajo ninguna circunstancia |
| 2.3 | Integrar Clerk / Auth0 para autenticación: email/pass, Google OAuth, magic links | Backend + Frontend | Login funcional, JWT con `tenant_id` en claims |
| 2.4 | API REST base con Fastify: estructura de rutas, middlewares, error handling | Backend | Endpoints `/health`, `/auth`, `/tenants` documentados en OpenAPI |
| 2.5 | Sistema de roles y permisos: Owner, Admin, Agent (para acceso al CRM) | Backend | Middleware de permisos funcionando por endpoint |
| 2.6 | Logs estructurados con Pino + Cloud Logging, métricas con Cloud Monitoring | Backend + DevOps | Cada request loggeado con `tenant_id`, latencia, status |
| 2.7 | Rate limiting por tenant, protección contra abuse (IP + tenant) | Backend | Bloqueo automático a 1000 req/min por tenant |

### Sprint 3 — Frontend base y Design System _(Semanas 5–6)_

| # | Tarea | Responsable | Criterio de éxito |
|---|-------|-------------|------------------|
| 3.1 | Setup Next.js 14 (App Router) + TailwindCSS + Zustand + React Query | Frontend | Build limpio, ESLint + TypeScript estricto |
| 3.2 | Design system: paleta de colores, tipografía, componentes base (Button, Input, Card, Modal, Table) | Frontend | Storybook con todos los componentes documentados |
| 3.3 | Layout del dashboard: sidebar, header, breadcrumbs, nav activo | Frontend | Responsive en móvil y desktop, dark mode preparado |
| 3.4 | Páginas de auth: login, register, forgot password, onboarding inicial | Frontend | Flujo completo funcional conectado al backend |
| 3.5 | Servicio Python FastAPI para IA: estructura de endpoints, health check | IA Engineer + Backend | API de IA corriendo en Cloud Run, documentada |
| 3.6 | Plan de pruebas: configurar Jest + Playwright para tests unitarios y E2E | QA + Frontend | Tests de auth y layout pasando en CI |

### ✅ Entregables de la Fase 1

- Infraestructura GCP completa con entornos dev / staging / prod separados
- Base de datos PostgreSQL con multi-tenancy seguro (RLS) y schema definitivo
- Sistema de autenticación y roles funcionando con Clerk/Auth0
- API REST base documentada en OpenAPI/Swagger
- Pipeline CI/CD automático desde GitHub a Cloud Run
- Design system y layout base del dashboard
- Monitoreo y logs estructurados activos

---

## Fase 2 — MVP Core: Bot Funcional

> **RAG con Gemini + Telegram + Onboarding guiado · 8 semanas**

Esta fase produce el primer producto real: un bot funcional, entrenado con información del negocio, disponible en Telegram y web widget, con el onboarding guiado de 5 pasos. Al final de la Fase 2, se puede cobrar el primer cliente.

---

### Sprint 4 — Motor RAG con Gemini _(Semanas 7–9)_

| # | Tarea | Responsable | Criterio de éxito |
|---|-------|-------------|------------------|
| 4.1 | Integrar Gemini API (`gemini-1.5-pro` + `gemini-1.5-flash`) en servicio Python | IA Engineer | Respuesta en < 1.5s para queries simples |
| 4.2 | Implementar pipeline de ingesta: PDF → extracción de texto → chunking semántico | IA Engineer | PDF de 100 páginas procesado en < 60s |
| 4.3 | Generar embeddings con `text-embedding-004` y almacenar en Vertex AI Vector Search | IA Engineer | Índice por tenant, búsqueda en < 200ms |
| 4.4 | Implementar ingesta desde URL (scraping con Playwright + Cheerio) | Backend + IA | Sitio de 50 páginas scrapeado y embeddings generados |
| 4.5 | Implementar sync con Google Sheets API v4 (lectura bidireccional) | Backend | Cambio en Sheets reflejado en bot en < 2 min |
| 4.6 | Pipeline RAG completo: query → embedding → top-K retrieval → reranking → Gemini | IA Engineer | Tasa de respuesta correcta > 85% en test set interno |
| 4.7 | Sistema de fallback: confianza < 0.7 → respuesta de escalado a humano | IA Engineer + Backend | Nunca inventa información no presente en la base |
| 4.8 | Re-indexación incremental: cuando se actualiza la base de conocimiento | IA Engineer | Solo re-indexa chunks modificados, no toda la base |

### Sprint 5 — Canales: Telegram + Web Widget _(Semanas 9–11)_

| # | Tarea | Responsable | Criterio de éxito |
|---|-------|-------------|------------------|
| 5.1 | Integración Telegram Bot API: webhook, recepción y envío de mensajes | Backend | Bot responde en Telegram en < 800ms |
| 5.2 | Setup en 3 pasos para Telegram: el cliente pega su token y el bot se activa | Frontend + Backend | Tiempo de setup < 5 minutos para cliente no técnico |
| 5.3 | Web widget (iframe embebible): diseño del chat bubble, ventana, animaciones | Frontend | Widget carga en < 500ms, no afecta PageSpeed del sitio host |
| 5.4 | Web widget: personalización de colores, logo, posición, mensaje de bienvenida | Frontend | El cliente puede ver preview en tiempo real al configurar |
| 5.5 | Motor de WebSocket para chat en tiempo real (Socket.io / native WS) | Backend | Latencia < 100ms para entrega de mensajes |
| 5.6 | Sistema de sesiones de conversación: crear, reanudar, expirar (timeout configurable) | Backend | Sesiones aisladas por canal y usuario final |
| 5.7 | Código de embed del widget: snippet de 1 línea de JS para el sitio del cliente | Frontend | Funciona en cualquier sitio sin conflictos de CSS/JS |

### Sprint 6 — Onboarding Guiado y Base de Conocimiento UI _(Semanas 11–14)_

| # | Tarea | Responsable | Criterio de éxito |
|---|-------|-------------|------------------|
| 6.1 | Wizard paso 1 — datos del negocio (nombre, industria, tipo de bot) | Frontend + Backend | Selector visual de industria con 12 categorías |
| 6.2 | Wizard paso 2 — base de conocimiento (upload PDFs, URL scraping, FAQs manuales) | Frontend + Backend | Upload hasta 50MB, scraping con preview de páginas encontradas |
| 6.3 | Wizard paso 3 — personalidad del bot (nombre, avatar, tono, sliders) | Frontend + Backend | Preview en tiempo real del bot con la personalidad elegida |
| 6.4 | Wizard paso 4 — flujos automáticos (templates por industria con toggle) | Frontend + Backend | 8 templates listos: citas, precios, horarios, escalado, etc. |
| 6.5 | Wizard paso 5 — canales (Telegram con tutorial + web widget con código embed) | Frontend + Backend | El bot queda activo al finalizar el paso 5 |
| 6.6 | Panel de base de conocimiento: ver documentos, eliminar, re-subir, estado de índice | Frontend + Backend | Estado de indexación visible (procesando / listo / error) |
| 6.7 | Sistema de planes y pagos: integrar Stripe + MercadoPago, gates por feature | Backend + Frontend | Suscripción activa, downgrade/upgrade, cancelación funcionando |
| 6.8 | Trial de 14 días: activación automática, emails de recordatorio (día 7, día 12) | Backend | Emails enviados con Resend, usuario puede pagar desde email |

### ✅ Entregables de la Fase 2

- Motor RAG completo con Gemini + Vertex AI Vector Search, un índice por tenant
- Ingesta desde PDF, URL scraping y Google Sheets con sync automático
- Bot funcional en Telegram con setup de 5 minutos
- Web widget embebible personalizable con snippet de 1 línea
- Wizard de onboarding completo (5 pasos) con preview en tiempo real
- 8 templates de flujos por industria activables sin código
- Sistema de pagos con Stripe + MercadoPago y período de prueba de 14 días
- **🏁 Hito: primeros 10 beta testers activos con feedback estructurado**

---

## Fase 3 — Canales y CRM Completo

> **WhatsApp + Instagram + Pipeline de leads · 8 semanas**

Con el MVP validado, esta fase agrega los canales de mayor volumen (WhatsApp e Instagram) y construye el CRM completo con gestión de leads, historial y automatizaciones básicas.

---

### Sprint 7 — WhatsApp Business API _(Semanas 15–17)_

| # | Tarea | Responsable | Criterio de éxito |
|---|-------|-------------|------------------|
| 7.1 | Integrar 360dialog (proveedor BSP) como gateway de WhatsApp Business | Backend | Envío y recepción de mensajes funcionando en sandbox |
| 7.2 | Tutorial interactivo de WhatsApp integrado en el dashboard (video + checklist vivo) | Frontend + Backend | Cliente completa la verificación sin soporte externo |
| 7.3 | Detección automática del estado de verificación Meta: pending / approved / rejected | Backend | Badge en dashboard se actualiza automáticamente cada 30 min |
| 7.4 | Soporte para plantillas de WhatsApp (templates HSM) aprobadas por Meta | Backend + Frontend | Cliente puede crear y enviar templates desde el panel |
| 7.5 | Manejo de tipos de mensaje WhatsApp: texto, imagen, audio, documento, botones | Backend | Todos los tipos recibidos correctamente y almacenados |
| 7.6 | Bot de WhatsApp con lógica de horarios: fuera de horario responde con mensaje custom | Backend + IA | Configuración de horarios en UI, respuesta correcta en tests |
| 7.7 | Tests de carga: simular 500 conversaciones simultáneas en WhatsApp | QA + DevOps | Tiempo de respuesta < 2s bajo carga, sin pérdida de mensajes |

### Sprint 8 — Instagram DMs _(Semanas 17–19)_

| # | Tarea | Responsable | Criterio de éxito |
|---|-------|-------------|------------------|
| 8.1 | Integrar Meta Graph API para Instagram Messaging | Backend | Mensajes enviados/recibidos en cuenta de prueba |
| 8.2 | Tutorial de conexión Instagram: vinculación con Business Manager en 2 clics | Frontend + Backend | Cliente conecta Instagram en < 5 minutos con el tutorial |
| 8.3 | Soporte para DMs de texto, stickers, reacciones, respuestas a stories | Backend | Todos los tipos manejados correctamente |
| 8.4 | Unified Inbox: vista unificada de conversaciones de todos los canales | Frontend + Backend | Agente humano ve Telegram + WhatsApp + Instagram + Web en un panel |
| 8.5 | Handoff humano: bot escala a agente, agente toma control, bot retoma al terminar | Backend + Frontend | El cliente final no percibe interrupciones en el handoff |
| 8.6 | Notificaciones en tiempo real al agente cuando hay conversación esperando handoff | Backend + Frontend | Notificación push/email en < 30s desde el escalado |

### Sprint 9 — CRM Completo _(Semanas 19–22)_

| # | Tarea | Responsable | Criterio de éxito |
|---|-------|-------------|------------------|
| 9.1 | Módulo de contactos: crear/editar/eliminar, tags, notas, historial completo | Frontend + Backend | Búsqueda de contactos en < 200ms, historial paginado |
| 9.2 | Pipeline visual de leads: columnas Kanban drag-and-drop (Nuevo → Calificado → Cerrado) | Frontend + Backend | Drag-and-drop fluido, cambio de estado persistido en tiempo real |
| 9.3 | Clasificación automática de leads: el bot asigna etiquetas según intención detectada | IA Engineer + Backend | Precisión > 80% en clasificación hot/warm/cold |
| 9.4 | Segmentación de contactos: filtros por etiqueta, canal, fecha, estado del pipeline | Frontend + Backend | Filtros combinables, exportación a CSV |
| 9.5 | Módulo de automatizaciones básicas: "si pasa X → hacer Y" con builder visual | Frontend + Backend | Al menos 10 triggers y 10 acciones configurables sin código |
| 9.6 | Integración Google Calendar: agendar citas desde el bot, confirmar disponibilidad en tiempo real | Backend | Cita creada en Google Calendar del negocio en < 3s desde el chat |
| 9.7 | Exportación de datos: contactos, conversaciones y leads a CSV/Excel | Backend + Frontend | Export de 10,000 registros en < 30s |

### ✅ Entregables de la Fase 3

- WhatsApp Business API funcionando con tutorial de setup integrado en el dashboard
- Instagram DMs con detección de tipos de mensaje y handoff a agente humano
- Unified Inbox: todos los canales en una sola vista para el equipo del negocio
- CRM completo: contactos, pipeline Kanban, segmentación, historial
- Clasificación automática de leads por nivel de intención
- Builder de automatizaciones visual (10+ triggers y acciones)
- Integración con Google Calendar para agendado desde el chat
- **🏁 Hito: 50 clientes pagos activos**

---

## Fase 4 — Humanización y Automatización

> **El bot que genera la duda · 6 semanas**

Esta fase es donde el producto se convierte en algo extraordinario. El motor de humanización, los delays adaptativos y el sistema de personalidades son el diferencial que ningún competidor ofrece. Al finalizar, cada bot pasa el _"Test Turing de chat"_.

---

### Sprint 10 — Motor de Humanización _(Semanas 23–25)_

| # | Tarea | Responsable | Criterio de éxito |
|---|-------|-------------|------------------|
| 10.1 | Motor de fraccionamiento: split inteligente en oraciones naturales con pausas | IA Engineer + Backend | Respuestas de > 40 palabras siempre se fraccionan en 2–4 mensajes |
| 10.2 | Delays adaptativos: calcular tiempo de "escritura" según longitud (~40 wpm ±20%) | Backend | Delay entre 800ms y 3.5s según longitud, con variación aleatoria realista |
| 10.3 | Indicador de "escribiendo..." en tiempo real antes de cada fragmento | Frontend + Backend | Visible en web widget, Telegram y WhatsApp (cuando la API lo permite) |
| 10.4 | Sistema de personalidades: sliders de formalidad, empatía, entusiasmo, concisión | Frontend + Backend + IA | Preview en tiempo real con mensajes de ejemplo al mover los sliders |
| 10.5 | Generador de system prompt: convierte la configuración de personalidad en instrucciones Gemini | IA Engineer | System prompt con reglas de escritura humana y variante del español |
| 10.6 | Reglas anti-bot: prohibir listas de bullets en chat, evitar frases de IA clichés, variedad en saludos | IA Engineer | Lista de 50+ frases y patrones bloqueados en el system prompt |
| 10.7 | Test Turing interno: 10 conversaciones reales por template de industria, evaluadores ciegos | QA + IA Engineer | Mínimo 7/10 evaluadores dudan o se equivocan sobre si es bot o humano |
| 10.8 | Configuración de variante del español: Colombia, México, Argentina, España, general | IA Engineer | Vocabulario y expresiones regionales correctas en cada variante |

### Sprint 11 — Automatizaciones Avanzadas y Soporte Multimodal _(Semanas 25–28)_

| # | Tarea | Responsable | Criterio de éxito |
|---|-------|-------------|------------------|
| 11.1 | Soporte de voz: integrar Whisper API para transcripción de mensajes de audio | IA Engineer | Audio de 30s transcrito en < 3s con precisión > 90% en español |
| 11.2 | Respuesta con audio: el bot puede enviar notas de voz (Google Cloud TTS) | IA Engineer + Backend | Voz natural, sin sonido robótico, latencia < 2s |
| 11.3 | Soporte de imágenes: el bot recibe fotos de productos y las analiza con Gemini Vision | IA Engineer | Identificación de producto en foto + respuesta relevante de la base de conocimiento |
| 11.4 | Automatizaciones de seguimiento: recordatorios post-cita, follow-up de leads fríos | Backend + Frontend | Mensaje enviado automáticamente en el tiempo configurado con 0 fallos |
| 11.5 | Campañas de reactivación: envío masivo a lista de contactos por canal | Backend + Frontend | Envío a 1000 contactos en < 5 min, con throttling para respetar límites de Meta |
| 11.6 | Webhook outbound: disparar a URL externa en eventos clave (nuevo lead, cita agendada) | Backend | Webhook con retry automático en caso de fallo, logs de entregas |
| 11.7 | Integración Zapier / Make: triggers y acciones disponibles como Zap/Module | Backend | Al menos 5 triggers y 5 acciones publicadas y funcionales en Zapier |

### ✅ Entregables de la Fase 4

- Motor de humanización completo: delays adaptativos, fraccionamiento, indicador de escritura
- Sistema de personalidades con sliders y preview en tiempo real
- Generador automático de system prompt por industria y personalidad
- Soporte de voz (input y output) con Whisper + Google Cloud TTS
- Soporte de imágenes con Gemini Vision para análisis de fotos de productos
- Automatizaciones de seguimiento y campañas de reactivación
- Integración con Zapier/Make publicada
- **🏁 Hito: todos los templates pasan el Test Turing interno (7/10)**

---

## Fase 5 — Escala y Ecosistema

> **Analytics + Agencias + White-label + 500+ clientes · 8 semanas**

La fase final convierte el producto en un ecosistema listo para escalar: analytics que demuestran ROI, programa de agencias como canal de distribución, white-label para revendedores, e infraestructura auditada para 500+ tenants.

---

### Sprint 12 — Analytics e Insights _(Semanas 29–31)_

| # | Tarea | Responsable | Criterio de éxito |
|---|-------|-------------|------------------|
| 12.1 | Dashboard principal: conversaciones/día, tasa de resolución, volumen por canal | Frontend + Backend | Datos del día anterior disponibles a las 6am, histórico de 12 meses |
| 12.2 | Análisis de intención: topics más frecuentes, preguntas sin respuesta, gaps en la base | IA Engineer + Backend | Top 20 preguntas sin respuesta del mes, exportable |
| 12.3 | Lead funnel analytics: Nuevos → Calificados → Convertidos, tasa de conversión por canal | Backend + Frontend | Funnel visual interactivo, filtrable por fecha y canal |
| 12.4 | NPS automático: encuesta post-conversación enviada a usuarios finales | Backend + Frontend | Tasa de respuesta > 15% en tests con beta testers |
| 12.5 | Heatmap de horarios: cuándo hay más conversaciones para optimizar turnos de agentes | Frontend + Backend | Heatmap semanal y mensual con zoom a día específico |
| 12.6 | Reportes automáticos semanales: email con resumen de KPIs enviado cada lunes al cliente | Backend | Email con datos reales, generado automáticamente |
| 12.7 | Exportación de reportes: PDF y Excel de cualquier vista del dashboard | Backend + Frontend | Export del dashboard completo en < 10s |

### Sprint 13 — Programa de Agencias y White-label _(Semanas 31–34)_

| # | Tarea | Responsable | Criterio de éxito |
|---|-------|-------------|------------------|
| 13.1 | Panel de agencia: una agencia gestiona hasta 20 clientes desde una sola cuenta | Frontend + Backend | Switch de cliente en < 1s, datos completamente aislados |
| 13.2 | White-label: la agencia puede usar su propio dominio, logo y colores en el dashboard | Frontend + Backend | El cliente final de la agencia nunca ve la marca de la plataforma base |
| 13.3 | Facturación independiente por cliente de agencia con resumen mensual consolidado | Backend | Agencia recibe una sola factura consolidada de todos sus clientes |
| 13.4 | Programa de referidos: link único, tracking de conversiones, pago automático de comisión | Backend + Frontend | Comisión del 20% recurrente, pagada automáticamente via Stripe Connect |
| 13.5 | API pública documentada: los clientes Pro acceden a la API para integraciones custom | Backend | Documentación en `docs.plataforma.com` con playground interactivo |
| 13.6 | Marketplace de templates: partners pueden publicar templates de flujos por industria | Frontend + Backend | Proceso de revisión y publicación en < 48h |

### Sprint 14 — Rendimiento, Seguridad y Preparación para Escala _(Semanas 34–36)_

| # | Tarea | Responsable | Criterio de éxito |
|---|-------|-------------|------------------|
| 14.1 | Load testing: simular 500 tenants activos con 50 conversaciones simultáneas cada uno | DevOps + QA | p99 de latencia < 2s bajo carga máxima, 0% de pérdida de mensajes |
| 14.2 | Auto-scaling de Cloud Run y Vertex AI Vector Search por demanda | DevOps | Scale-up automático en < 60s al detectar aumento de tráfico |
| 14.3 | Auditoría de seguridad: penetration testing básico, revisión de RLS, revisión de IAM | Tech Lead + DevOps | Sin vulnerabilidades críticas o altas sin resolver |
| 14.4 | Backup y disaster recovery: RTO < 1h, RPO < 15 min documentado y probado | DevOps | Restore completo de base de datos en < 45 minutos desde backup |
| 14.5 | GDPR / Ley de datos: política de privacidad, DPA para clientes europeos, borrado de datos | Tech Lead + Backend | Borrado completo de tenant en < 24h por solicitud |
| 14.6 | Onboarding de equipo de soporte: documentación interna, runbooks de incidentes comunes | Tech Lead | Runbook para los 10 problemas más frecuentes documentado |
| 14.7 | Status page pública con uptime histórico (statuspage.io o similar) | DevOps | Uptime visible públicamente, alertas automáticas en incidentes |

### ✅ Entregables de la Fase 5

- Dashboard de analytics completo con funnel de leads, NPS y heatmaps de actividad
- Reportes automáticos semanales por email a cada cliente
- Panel de agencias: gestión multi-cliente con white-label y facturación consolidada
- Programa de referidos con tracking y pago automático de comisiones
- API pública documentada con playground interactivo
- Marketplace de templates de flujos por industria
- Infraestructura auditada y probada bajo carga de 500+ tenants simultáneos
- **🏁 Hito final: plataforma lista para lanzamiento público y campaña de growth**

---

## Estándares de calidad y proceso

### Metodología de trabajo

El equipo trabaja en **sprints de 2 semanas** con los siguientes rituales mínimos:

- **Planning** al inicio del sprint (2h): selección de tasks, estimación y asignación
- **Daily standup** (15 min): qué hice ayer, qué hago hoy, bloqueos
- **Demo** al final del sprint (1h): mostrar features al product owner con datos reales
- **Retro** al final del sprint (45 min): qué salió bien, qué mejorar, acciones concretas

### Definition of Done (DoD)

Una tarea no está terminada hasta que cumpla **todos** estos criterios:

- [ ] Código revisado por al menos otro desarrollador (PR con 1 approval mínimo)
- [ ] Tests unitarios escritos y pasando (cobertura mínima 70% por módulo nuevo)
- [ ] Tests de integración para endpoints críticos (auth, payments, bot engine)
- [ ] Documentado en Notion: endpoint, parámetros, ejemplo de uso o comportamiento esperado
- [ ] Desplegado en staging y verificado manualmente por QA
- [ ] Sin errores en Sentry por 24h en staging antes de pasar a producción

### Branching strategy

| Rama | Propósito | Quién puede hacer push | Cuándo se mergea |
|------|-----------|----------------------|-----------------|
| `main` | Producción — siempre estable | Solo via PR aprobado | Después de QA en staging |
| `staging` | Entorno de pruebas pre-producción | Solo via PR de feature | Al completar sprint |
| `develop` | Integración continua del sprint | Todos los devs vía feature branches | Daily |
| `feature/xxx` | Feature específica en desarrollo | Dev asignado | Al completar la task |
| `hotfix/xxx` | Fix urgente en producción | Tech Lead + Dev | Directo a `main` + `staging` |

### Métricas de éxito técnico

| Métrica | Target | Medición |
|---------|--------|----------|
| Uptime de la plataforma | 99.5% mensual | Cloud Monitoring + Status page |
| Latencia p95 de respuesta del bot | < 1.5s | Cloud Trace por endpoint |
| Latencia p95 del RAG pipeline | < 800ms | Custom metrics en IA service |
| Tasa de errores en producción | < 0.5% de requests | Sentry error rate |
| Tiempo de build CI/CD | < 8 minutos | GitHub Actions timing |
| Cobertura de tests | > 70% por módulo | Codecov en cada PR |
| Tiempo de onboarding de nuevo dev | < 2 días para primer deploy | README + runbooks |

---

## Gestión de riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|:------------:|:-------:|-----------|
| Meta retrasa aprobación de WhatsApp Business API | Alta | Medio | Telegram como canal principal en Fase 2; WhatsApp en Fase 3 con margen de 4 semanas extra |
| Costos de Gemini API superiores a lo proyectado | Media | Alto | Cache de respuestas frecuentes en Redis; Gemini Flash para queries simples; límite de costo por tenant |
| Churn alto en período de trial (primeros 14 días) | Media | Alto | Onboarding personalizado para primeros 50 clientes; email de activación si no completan el wizard en 24h |
| Deuda técnica por velocidad en fases tempranas | Alta | Medio | Fase 1 no se salta bajo ninguna circunstancia; sprint de refactoring entre Fase 3 y Fase 4 |
| Filtración de datos entre tenants | Baja | Crítico | RLS en PostgreSQL desde Fase 1; audit log inmutable; penetration testing en Fase 5 |
| Key developer abandona el proyecto | Media | Alto | Documentación obligatoria; pair programming en módulos críticos; sin single points of knowledge |
| Latencia inaceptable del RAG bajo carga | Media | Alto | Cache de respuestas frecuentes; Vertex AI autoscaling; load testing continuo desde Fase 3 |

---

## Resumen timeline — 12 meses

| Semanas | Fase | Sprint | Hito principal |
|:-------:|------|:------:|----------------|
| 1–2 | **Fase 1** | Sprint 1 | Infraestructura GCP + CI/CD operativo |
| 3–4 | **Fase 1** | Sprint 2 | Multi-tenancy + Auth + API base |
| 5–6 | **Fase 1** | Sprint 3 | Frontend base + Design system |
| 7–9 | **Fase 2** | Sprint 4 | RAG con Gemini + Google Sheets sync |
| 9–11 | **Fase 2** | Sprint 5 | Telegram + Web widget en producción |
| 11–14 | **Fase 2** | Sprint 6 | ⭐ MVP completo — 10 beta testers activos |
| 15–17 | **Fase 3** | Sprint 7 | WhatsApp Business API + tutorial |
| 17–19 | **Fase 3** | Sprint 8 | Instagram DMs + Unified Inbox |
| 19–22 | **Fase 3** | Sprint 9 | ⭐ CRM completo — 50 clientes pagos |
| 23–25 | **Fase 4** | Sprint 10 | Motor de humanización + Test Turing |
| 25–28 | **Fase 4** | Sprint 11 | Voz + Imágenes + Automatizaciones avanzadas |
| 29–31 | **Fase 5** | Sprint 12 | Analytics completo + reportes automáticos |
| 31–34 | **Fase 5** | Sprint 13 | Programa de agencias + White-label |
| 34–36 | **Fase 5** | Sprint 14 | ⭐ LANZAMIENTO — plataforma auditada, 500+ tenants |

> **Nota:** Los sprints pueden ajustarse según el feedback de beta testers. Se recomienda el lanzamiento público al finalizar la Fase 3 (semana 22) con pricing activo y campaña de adquisición, continuando el desarrollo de las Fases 4 y 5 en paralelo con clientes reales.

---

*Versión 1.0 · Confidencial · Marzo 2026*
