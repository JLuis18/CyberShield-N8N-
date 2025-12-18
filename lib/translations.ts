export const translations = {
    es: {
        // Common
        common: {
            loading: 'Cargando...',
            save: 'Guardar',
            cancel: 'Cancelar',
            back: 'Volver',
            backToDashboard: 'Volver al Dashboard',
            perMonth: 'por mes',
            yes: 'Sí',
            no: 'No',
        },

        // Navigation
        nav: {
            dashboard: 'Dashboard',
            scanner: 'Escáner de Amenazas',
            security: 'Nivel de Seguridad',
            settings: 'Configuración',
            plans: 'Planes y Suscripciones',
        },

        // Dashboard
        dashboard: {
            welcome: '¡Hola de nuevo! 👋',
            subtitle: 'Aquí está tu resumen de seguridad diario',
            title: 'Dashboard de Seguridad',
            securityScore: 'Puntuación de Seguridad',
            threats: 'Amenazas Detectadas',
            scans: 'Análisis Realizados',
            lastScan: 'Último Escaneo',
            recent: 'Actividad Reciente',
            noActivity: 'No hay actividad reciente',
            threatsBlocked: 'amenazas bloqueadas',
            emailsAnalyzed: 'correos analizados',
            connectionsAnalyzed: 'conexiones analizadas',
            actions: {
                analyzeLink: 'Analizar Enlace',
                analyzeLinkDesc: 'URL sospechosa detectada en correo entrante. Posible intento de phishing.',
                verifyEmail: 'Verificar Correo',
                verifyEmailDesc: 'Email marcado con contenido sospechoso. Se recomienda análisis de detección de phishing.',
                analyzeInvoice: 'Analizar Factura',
                analyzeInvoiceDesc: 'Carga y analiza documentos de facturas (PDF/Imagen) para detectar anomalías y fraude.',
            },
        },

        // Scanner
        scanner: {
            title: 'Escáner de Amenazas',
            subtitle: 'Analiza URLs, correos electrónicos y facturas para detectar amenazas',
            urlTab: 'Analizar URL',
            emailTab: 'Analizar Email',
            invoiceTab: 'Analizar Factura',
            placeholder: {
                url: 'Ingresa una URL para analizar',
                email: 'Pega el contenido del email aquí',
                invoice: 'Sube o pega los datos de la factura',
            },
            analyze: 'Analizar',
            analyzing: 'Analizando...',
            results: 'Resultados del Análisis',
            threat: 'Amenaza',
            safe: 'Seguro',
            limitReached: 'Has alcanzado el límite diario de análisis',
            upgradePrompt: 'Actualiza tu plan para continuar',
            scansRemaining: 'análisis restantes hoy',
            urlScans: 'análisis de URL',
            emailScans: 'análisis de email',
            invoiceScans: 'análisis de facturas',
        },

        // Security
        security: {
            title: 'Tu Nivel de Seguridad',
            subtitle: 'Monitorea tu puntuación de seguridad y amenazas detectadas',
            currentScore: 'PUNTUACIÓN ACTUAL',
            criticalThreats: 'AMENAZAS CRÍTICAS',
            blocked: 'AMENAZAS BLOQUEADAS',
            recommendations: 'Recomendaciones de IA',
            threats: 'Amenazas Detectadas',
            noThreats: 'No hay amenazas detectadas',
        },

        // Plans
        plans: {
            title: 'Planes y Suscripciones',
            subtitle: 'Elige el plan perfecto para tus necesidades de ciberseguridad',
            currentPlan: 'Tu plan actual',
            popular: 'MÁS POPULAR',
            current: 'PLAN ACTUAL',
            upgrade: 'Actualizar Plan',
            subscribe: 'Contratar',
            free: 'Plan Gratis',
            comparison: 'Comparación Detallada',
            faq: 'Preguntas Frecuentes',
            includes: 'Incluye:',
        },

        // Settings
        settings: {
            title: 'Configuración',
            subtitle: 'Personaliza tu experiencia en CyberShield',
            language: 'Idioma',
            theme: 'Tema',
            darkTheme: 'Oscuro (Recomendado)',
            lightTheme: 'Claro',
            notifications: 'Notificaciones',
            receiveAlerts: 'Recibir alertas de seguridad',
            apiKeys: 'API Keys',
            apiKeysDesc: 'Genera claves API para integraciones externas (Disponible en Plan Profesional+)',
            generateKey: 'Generar Nueva API Key',
            integrations: 'Integraciones Externas',
            connect: 'Conectar',
            saveConfig: 'Guardar Configuración',
            saving: 'Guardando...',
            saved: '✓ Configuración guardada exitosamente',
            error: '✗ Error al guardar configuración',
            comingSoon: '💡 Próximamente:',
        },

        // Checkout
        checkout: {
            title: 'Checkout',
            subtitle: 'Completa tu compra de forma segura',
            paymentInfo: 'Información de Pago',
            orderSummary: 'Resumen del Pedido',
            email: 'Email',
            cardNumber: 'Número de Tarjeta',
            cardName: 'Nombre en la Tarjeta',
            expiry: 'Fecha de Expiración',
            cvv: 'CVV',
            secure: 'Pago 100% Seguro',
            encryption: 'Tus datos están protegidos con encriptación SSL de 256 bits',
            pay: 'Pagar',
            processing: 'Procesando pago...',
            monthly: 'Mensual',
            subtotal: 'Subtotal',
            tax: 'IVA (18%)',
            total: 'Total',
        },

        // Success
        success: {
            title: '¡Pago Exitoso!',
            subtitle: 'Tu suscripción ha sido activada',
            features: 'Nuevas Funciones Desbloqueadas',
            receipt: 'Se ha enviado un recibo a tu correo electrónico',
            redirect: 'Serás redirigido al dashboard en',
            seconds: 'segundos',
            goNow: 'Ir al Dashboard Ahora',
        },
    },

    en: {
        // Common
        common: {
            loading: 'Loading...',
            save: 'Save',
            cancel: 'Cancel',
            back: 'Back',
            backToDashboard: 'Back to Dashboard',
            perMonth: 'per month',
            yes: 'Yes',
            no: 'No',
        },

        // Navigation
        nav: {
            dashboard: 'Dashboard',
            scanner: 'Threat Scanner',
            security: 'Security Level',
            settings: 'Settings',
            plans: 'Plans & Subscriptions',
        },

        // Dashboard
        dashboard: {
            welcome: 'Welcome back! 👋',
            subtitle: "Here's your daily security overview",
            title: 'Security Dashboard',
            securityScore: 'Security Score',
            threats: 'Detected Threats',
            scans: 'Scans Performed',
            lastScan: 'Last Scan',
            recent: 'Recent Activity',
            noActivity: 'No recent activity',
            threatsBlocked: 'threats blocked',
            emailsAnalyzed: 'emails analyzed',
            connectionsAnalyzed: 'connections analyzed',
            actions: {
                analyzeLink: 'Analyze Link',
                analyzeLinkDesc: 'Suspicious URL detected in incoming email. Possible phishing attempt.',
                verifyEmail: 'Verify Email',
                verifyEmailDesc: 'Email flagged with suspicious content. Phishing detection analysis recommended.',
                analyzeInvoice: 'Analyze Invoice',
                analyzeInvoiceDesc: 'Upload and analyze invoice documents (PDF/Image) for anomalies and fraud detection.',
            },
        },

        // Scanner
        scanner: {
            title: 'Threat Scanner',
            subtitle: 'Analyze URLs, emails, and invoices to detect threats',
            urlTab: 'Analyze URL',
            emailTab: 'Analyze Email',
            invoiceTab: 'Analyze Invoice',
            placeholder: {
                url: 'Enter a URL to analyze',
                email: 'Paste email content here',
                invoice: 'Upload or paste invoice data',
            },
            analyze: 'Analyze',
            analyzing: 'Analyzing...',
            results: 'Analysis Results',
            threat: 'Threat',
            safe: 'Safe',
            limitReached: 'You have reached your daily analysis limit',
            upgradePrompt: 'Upgrade your plan to continue',
            scansRemaining: 'scans remaining today',
            urlScans: 'URL scans',
            emailScans: 'email scans',
            invoiceScans: 'invoice scans',
        },

        // Security
        security: {
            title: 'Your Security Level',
            subtitle: 'Monitor your security score and detected threats',
            currentScore: 'CURRENT SCORE',
            criticalThreats: 'CRITICAL THREATS',
            blocked: 'BLOCKED THREATS',
            recommendations: 'AI Recommendations',
            threats: 'Detected Threats',
            noThreats: 'No threats detected',
        },

        // Plans
        plans: {
            title: 'Plans & Subscriptions',
            subtitle: 'Choose the perfect plan for your cybersecurity needs',
            currentPlan: 'Your current plan',
            popular: 'MOST POPULAR',
            current: 'CURRENT PLAN',
            upgrade: 'Upgrade Plan',
            subscribe: 'Subscribe',
            free: 'Free Plan',
            comparison: 'Detailed Comparison',
            faq: 'Frequently Asked Questions',
            includes: 'Includes:',
        },

        // Settings
        settings: {
            title: 'Settings',
            subtitle: 'Customize your CyberShield experience',
            language: 'Language',
            theme: 'Theme',
            darkTheme: 'Dark (Recommended)',
            lightTheme: 'Light',
            notifications: 'Notifications',
            receiveAlerts: 'Receive security alerts',
            apiKeys: 'API Keys',
            apiKeysDesc: 'Generate API keys for external integrations (Available in Professional+ Plan)',
            generateKey: 'Generate New API Key',
            integrations: 'External Integrations',
            connect: 'Connect',
            saveConfig: 'Save Configuration',
            saving: 'Saving...',
            saved: '✓ Configuration saved successfully',
            error: '✗ Error saving configuration',
            comingSoon: '💡 Coming soon:',
        },

        // Checkout
        checkout: {
            title: 'Checkout',
            subtitle: 'Complete your purchase securely',
            paymentInfo: 'Payment Information',
            orderSummary: 'Order Summary',
            email: 'Email',
            cardNumber: 'Card Number',
            cardName: 'Name on Card',
            expiry: 'Expiration Date',
            cvv: 'CVV',
            secure: '100% Secure Payment',
            encryption: 'Your data is protected with 256-bit SSL encryption',
            pay: 'Pay',
            processing: 'Processing payment...',
            monthly: 'Monthly',
            subtotal: 'Subtotal',
            tax: 'Tax (18%)',
            total: 'Total',
        },

        // Success
        success: {
            title: 'Payment Successful!',
            subtitle: 'Your subscription has been activated',
            features: 'New Features Unlocked',
            receipt: 'A receipt has been sent to your email',
            redirect: 'You will be redirected to the dashboard in',
            seconds: 'seconds',
            goNow: 'Go to Dashboard Now',
        },
    },
}

export type Language = 'es' | 'en'
export type TranslationKey = keyof typeof translations.es
