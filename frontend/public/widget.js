(function () {
    // Skylab Human Bot - Universal Web Widget
    // V1.0 - Zero Config Embed

    // Ensure we don't load twice
    if (window.SkylabWidget) return;
    window.SkylabWidget = true;

    // Configuration
    const scriptTag = document.currentScript;
    if (!scriptTag) {
        console.error("Skylab: No se pudo identificar la etiqueta script. No se puede montar el widget.");
        return;
    }

    const botId = scriptTag.getAttribute('data-bot-id');
    const themeColor = scriptTag.getAttribute('data-theme') || '#4f46e5'; // Default indigo-600

    if (!botId) {
        console.error("Skylab: Faltó el atributo 'data-bot-id' en la etiqueta de script.");
        return;
    }

    // Server source (where the widget is hosted)
    // Extract domain from the script src
    const scriptSrc = scriptTag.src;
    const url = new URL(scriptSrc);
    // Remove the trailing slash or filename to get the base URL
    const baseUrl = url.origin;

    const iframeUrl = `${baseUrl}/widget/${botId}?origin=${encodeURIComponent(window.location.origin)}`;

    // Create Container
    const container = document.createElement('div');
    container.id = 'skylab-widget-container';

    // Inject Styles once
    const style = document.createElement('style');
    style.innerHTML = `
        #skylab-widget-container {
            position: fixed;
            bottom: 24px;
            right: 24px;
            z-index: 2147483647;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            pointer-events: none;
        }

        #skylab-widget-toggle {
            width: 60px;
            height: 60px;
            border-radius: 30px;
            background-color: ${themeColor};
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease-in-out;
            pointer-events: auto;
            border: none;
            outline: none;
            position: relative;
            z-index: 2;
        }

        #skylab-widget-toggle:hover {
            transform: scale(1.05);
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        
        #skylab-widget-toggle:active {
            transform: scale(0.95);
        }

        #skylab-widget-iframe-container {
            background: white;
            border-radius: 24px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            overflow: hidden;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            transform-origin: bottom right;
            transform: scale(0.8) translateY(20px);
            opacity: 0;
            pointer-events: none;
            margin-bottom: 20px;
            width: max(380px, calc(100vw - 48px));
            height: max(600px, calc(100vh - 120px));
            max-width: 400px;
            max-height: 700px;
            position: relative;
            z-index: 1;
            border: 1px solid rgba(0,0,0,0.05);
        }

        #skylab-widget-iframe-container.skylab-open {
            transform: scale(1) translateY(0);
            opacity: 1;
            pointer-events: auto;
        }

        #skylab-svg-icon {
            width: 32px;
            height: 32px;
            fill: white;
            transition: transform 0.3s ease;
        }

        #skylab-svg-close {
            width: 24px;
            height: 24px;
            stroke: white;
            stroke-width: 2.5;
            stroke-linecap: round;
            stroke-linejoin: round;
            position: absolute;
            opacity: 0;
            transform: rotate(-90deg) scale(0.5);
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        #skylab-widget-toggle.skylab-open #skylab-svg-icon {
            opacity: 0;
            transform: rotate(90deg) scale(0.5);
        }

        #skylab-widget-toggle.skylab-open #skylab-svg-close {
            opacity: 1;
            transform: rotate(0deg) scale(1);
        }

        /* Responsive Fixes */
        @media (max-width: 480px) {
            #skylab-widget-container {
                bottom: 16px;
                right: 16px;
            }
            #skylab-widget-iframe-container {
                width: calc(100vw - 32px);
                height: calc(100vh - 100px);
                max-width: none;
                max-height: none;
                border-radius: 20px;
            }
        }
    `;
    document.head.appendChild(style);

    // Create Iframe Container
    const iframeContainer = document.createElement('div');
    iframeContainer.id = 'skylab-widget-iframe-container';

    // Create Iframe
    const iframe = document.createElement('iframe');
    iframe.src = iframeUrl;
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.allow = "microphone";
    iframeContainer.appendChild(iframe);

    // Create Toggle Button
    const toggle = document.createElement('button');
    toggle.id = 'skylab-widget-toggle';
    toggle.setAttribute('aria-label', 'Chat with us');
    toggle.innerHTML = \`
        <svg id="skylab-svg-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 5.91 2 10.74C2 13.04 3.03 15.13 4.7 16.7C4.46 18.06 3.61 19.34 2.14 20.3C2.1 20.33 2.06 20.37 2.04 20.41C1.96 20.53 1.95 20.68 2.01 20.81C2.07 20.93 2.19 21.01 2.32 21.01C4.44 21.01 6.3 20.17 7.7 18.81C9 19.16 10.45 19.38 12 19.38C17.52 19.38 22 15.47 22 10.64C22 5.82 17.52 1.91 12 1.91V2ZM8.5 10.5C7.67 10.5 7 9.83 7 9C7 8.17 7.67 7.5 8.5 7.5C9.33 7.5 10 8.17 10 9C10 9.83 9.33 10.5 8.5 10.5ZM12 13.5C11.17 13.5 10.5 12.83 10.5 12C10.5 11.17 11.17 10.5 12 10.5C12.83 10.5 13.5 11.17 13.5 12C13.5 12.83 12.83 13.5 12 13.5ZM15.5 10.5C14.67 10.5 14 9.83 14 9C14 8.17 14.67 7.5 15.5 7.5C16.33 7.5 17 8.17 17 9C17 9.83 16.33 10.5 15.5 10.5Z"/>
        </svg>
        <svg id="skylab-svg-close" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
    \`;

    // Append to container
    container.appendChild(iframeContainer);
    container.appendChild(toggle);
    document.body.appendChild(container);

    // Toggle Logic
    let isOpen = false;
    toggle.addEventListener('click', () => {
        isOpen = !isOpen;
        if (isOpen) {
            iframeContainer.classList.add('skylab-open');
            toggle.classList.add('skylab-open');
            // Send message to iframe telling it we opened
            if (iframe.contentWindow) {
                iframe.contentWindow.postMessage({ type: 'skylab-widget-opened' }, '*');
            }
        } else {
            iframeContainer.classList.remove('skylab-open');
            toggle.classList.remove('skylab-open');
             if (iframe.contentWindow) {
                iframe.contentWindow.postMessage({ type: 'skylab-widget-closed' }, '*');
            }
        }
    });

    // Listen for messages from iframe (e.g., to close programmatically)
    window.addEventListener('message', (event) => {
        // Security check - ensure message comes from our iframe
        if (event.origin !== baseUrl) return;

        if (event.data && event.data.type === 'skylab-close-widget') {
            isOpen = false;
            iframeContainer.classList.remove('skylab-open');
            toggle.classList.remove('skylab-open');
        }
    });

    console.log("🚀 Skylab Widget SDK cargado exitosamente.");
})();
