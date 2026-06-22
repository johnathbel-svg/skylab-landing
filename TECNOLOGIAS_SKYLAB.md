# Ficha de Tecnología y Seguridad — Ecosistema Skylab
> **Synerg-IA Automation** · Confidencial / Corporativo · Versión 1.1 · Junio 2026

Este documento detalla la arquitectura de tecnologías avanzadas, motores de humanización y protocolos de seguridad implementados en el núcleo de la plataforma **Skylab (BotFlow)**.

---

## 1. Motores de Inferencia e Inteligencia Conversacional

### 1.1 Inferencia RAG Avanzada (Retrieval-Augmented Generation)
*   **Pipeline Vectorial:** El sistema interactúa con una base de datos vectorial PostgreSQL (`pgvector` versión 0.8.0) sobre Supabase. La búsqueda semántica y contextual se realiza con embeddings de 768 dimensiones.
*   **Motor Primario:** Gemini 3.1 Pro (Inferencia principal) con fallback dinámico y de baja latencia a Gemini 3.1 Flash en caso de congestión de API (código de error 503).
*   **Inyección de Metadatos:** Cada fragmento de texto inyectado en el vector store contiene una cabecera de origen que ancla la identidad del bot (título, fuente y URI original) previniendo alucinaciones y desvíos de identidad.

### 1.2 Extracción de Documentos por LLM Multimodal
*   **OCR de Alta Seguridad:** El pipeline de extracción de PDFs abandona los métodos tradicionales de parseo de librerías locales (vulnerables a formateos corruptos) y delega la lectura a **Gemini 1.5 Flash**.
*   **Prompt Criptográfico:** Se instruye al modelo en el momento del escaneo para identificar, omitir y reemplazar credenciales, contraseñas o datos de tarjetas de crédito por etiquetas de privacidad.

---

## 2. Motor de Humanización Conversacional (Turing Tech)

Para superar el Test de Turing en conversaciones cotidianas, Skylab incorpora un motor matemático de emulación humana:

*   **Delays Adaptativos Variables:** El tiempo transcurrido entre la recepción del mensaje y el inicio de la respuesta no es constante. Se calcula dinámicamente con la fórmula:
    $$t_{\text{delay}} = \left(\frac{\text{Caracteres del mensaje}}{v_{\text{escritura}}}\right) \pm \sigma_{\text{variabilidad}}$$
    donde la velocidad promedio de escritura ($v_{\text{escritura}}$) es de aproximadamente $40 \text{ palabras por minuto}$, variando con un factor aleatorio real ($\sigma$) del $\pm 20\%$.
*   **Motor de Fraccionamiento (Splitting):** Las respuestas de longitud mayor a 40 palabras se dividen de manera inteligente en oraciones e ideas lógicas independientes, enviándose como mensajes consecutivos con micro-pausas y estado *"Escribiendo..."* activo.
*   **sliders de Personalidad Molecular:** La personalidad del bot se parametriza en el dashboard mediante vectores de formalidad, tono local (ej. Paisa, Formal, Friendly) y densidad de emojis.

---

## 3. Blindaje de Seguridad y Confidencialidad de Datos

De acuerdo con el **Artículo 4 de la Constitución de Synerg-IA S.A.S.**, el sistema implementa un esquema de seguridad multicapa:

### 3.1 Aislamiento Multi-tenant por RLS
*   **Row Level Security (RLS):** Cada tabla del esquema (`public` y `knowledge`) cuenta con políticas RLS activas en Postgres.
*   **Restricción Total:** La consulta de embeddings vectoriales (`knowledge_chunks`) y registros de documentos (`knowledge_docs`) requiere un `tenant_id` obligatorio y autenticado, garantizando que el *Tenant A* jamás pueda ver, inferir o leer información del *Tenant B*.

### 3.2 Bóveda de Sanitización en Tiempo Real (PII & Secrets)
*   **Filtro Regex Activo:** El texto extraído de PDFs, URLs o entradas manuales pasa por una función de sanitización en el servidor antes de guardarse.
*   **Anonimización de Secretos:** Se detectan y enmascaran automáticamente:
    *   Llaves de API (de OpenAI `sk-...` o Gemini `AIzaSy...`).
    *   Tokens de sesión estructurados (JWT `eyJ...`).
    *   Números de tarjetas de crédito.
    *   Contraseñas o tokens en texto plano.

### 3.3 Protección contra Ataques de SSRF (Server-Side Request Forgery)
*   **Validador de Host de Scraper:** Al recibir una URL de cliente para scraping contextual, el servidor realiza una resolución DNS pasiva del host.
*   **Bloqueo de Rangos Privados:** Se restringe y cancela la petición si la dirección IP resuelta pertenece a rangos locales o privados de la infraestructura del servidor:
    *   Loopbacks: `127.0.0.1`, `0.0.0.0`.
    *   Privadas: `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`.
    *   Cloud Metadata IP: `169.254.169.254` (bloqueando fugas de credenciales de infraestructura VPS).
