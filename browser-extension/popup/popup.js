/**
 * CyberShield Popup Script
 * Manages the extension popup interface
 */

document.addEventListener('DOMContentLoaded', async () => {
    await loadCurrentScan();
    await loadHistory();
    setupEventListeners();
});

/**
 * Load current tab scan result
 */
async function loadCurrentScan() {
    const scanResult = document.getElementById('scanResult');

    try {
        // Get current tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        if (!tab || tab.url.startsWith('chrome://')) {
            scanResult.innerHTML = `
        <div class="scan-card-content">
          <div class="icon-large">ℹ️</div>
          <h3>Página del Sistema</h3>
          <p>No se puede escanear páginas internas del navegador</p>
        </div>
      `;
            scanResult.className = 'scan-card';
            return;
        }

        // Request scan result from background
        const response = await chrome.runtime.sendMessage({
            action: 'getCurrentTabScan'
        });

        if (response.success && response.result) {
            displayScanResult(response.result, tab.url);
        } else {
            scanResult.innerHTML = `
        <div class="scan-card-content">
          <div class="icon-large">⏳</div>
          <h3>Escaneando...</h3>
          <p>${truncateURL(tab.url)}</p>
        </div>
      `;
        }
    } catch (error) {
        console.error('Failed to load current scan:', error);
        scanResult.innerHTML = `
      <div class="scan-card-content error">
        <div class="icon-large">⚠️</div>
        <h3>Error</h3>
        <p>No se pudo cargar el análisis</p>
      </div>
    `;
        scanResult.className = 'scan-card';
    }
}

/**
 * Display scan result in popup
 */
function displayScanResult(result, url) {
    const scanResult = document.getElementById('scanResult');
    const domain = extractDomain(url);
    const emoji = getRiskEmoji(result.riskLevel);
    const color = getRiskColor(result.riskLevel);

    const threats = result.threats || [];
    const threatsHTML = threats.length > 0
        ? threats.slice(0, 3).map(t => `<li>${t}</li>`).join('')
        : '<li>No se detectaron amenazas</li>';

    const riskClass = result.riskLevel === 'high' || result.riskLevel === 'critical'
        ? 'danger'
        : result.riskLevel === 'medium' || result.riskLevel === 'warning'
            ? 'warning'
            : 'safe';

    scanResult.className = `scan-card ${riskClass}`;
    scanResult.innerHTML = `
    <div class="scan-card-content">
      <div class="risk-indicator" style="background-color: ${color}">
        <div class="icon-large">${emoji}</div>
      </div>
      <h3>${domain}</h3>
      <div class="risk-level" style="color: ${color}">
        ${getRiskLevelText(result.riskLevel)}
      </div>
      <ul class="threats-list">
        ${threatsHTML}
      </ul>
      ${result.threatIntelligence ? getThreatIntelHTML(result.threatIntelligence) : ''}
    </div>
  `;
}

/**
 * Get threat intelligence HTML
 */
function getThreatIntelHTML(ti) {
    if (!ti || ti.abuseConfidenceScore === 0) return '';

    return `
    <div class="threat-intel">
      <div class="intel-badge">
        <span>🌐</span> ${ti.totalReports} reportes globales
      </div>
      ${ti.countryCode ? `<div class="intel-badge"><span>🌍</span> ${ti.countryCode}</div>` : ''}
    </div>
  `;
}

/**
 * Get risk level text
 */
function getRiskLevelText(level) {
    const texts = {
        low: 'Seguro',
        safe: 'Seguro',
        medium: 'Precaución',
        warning: 'Advertencia',
        high: '¡Peligroso!',
        critical: '¡Amenaza Crítica!',
        unknown: 'Sin análisis'
    };
    return texts[level] || 'Desconocido';
}

/**
 * Load scan history
 */
async function loadHistory() {
    const historyList = document.getElementById('historyList');
    const statsElement = document.getElementById('stats');

    try {
        const response = await chrome.runtime.sendMessage({ action: 'getHistory' });

        if (response.success && response.history) {
            const history = response.history;

            if (history.length === 0) {
                historyList.innerHTML = '<p class="empty-message">Sin historial de escaneos</p>';
                statsElement.textContent = '0 sitios escaneados';
                return;
            }

            // Update stats
            statsElement.textContent = `${history.length} sitios escaneados`;

            // Display history items (max 10)
            historyList.innerHTML = history.slice(0, 10).map(item => {
                const emoji = getRiskEmoji(item.riskLevel);
                return `
          <div class="history-item" data-url="${item.url}">
            <div class="history-icon">${emoji}</div>
            <div class="history-info">
              <div class="history-domain">${item.domain}</div>
              <div class="history-time">${formatTimestamp(item.timestamp)}</div>
            </div>
            <div class="history-risk" style="color: ${getRiskColor(item.riskLevel)}">
              ${getRiskLevelText(item.riskLevel)}
            </div>
          </div>
        `;
            }).join('');

            // Add click listeners to history items
            document.querySelectorAll('.history-item').forEach(item => {
                item.addEventListener('click', () => {
                    const url = item.dataset.url;
                    chrome.tabs.create({ url });
                });
            });
        }
    } catch (error) {
        console.error('Failed to load history:', error);
        historyList.innerHTML = '<p class="empty-message error">Error al cargar historial</p>';
    }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Rescan button
    document.getElementById('rescanBtn').addEventListener('click', async () => {
        const btn = document.getElementById('rescanBtn');
        btn.disabled = true;
        btn.textContent = 'Escaneando...';

        try {
            await chrome.runtime.sendMessage({ action: 'rescan' });
            await loadCurrentScan();
            await loadHistory();
        } catch (error) {
            console.error('Rescan failed:', error);
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<span>🔄</span> Reescanear';
        }
    });

    // Clear history button
    document.getElementById('clearHistoryBtn').addEventListener('click', async () => {
        if (confirm('¿Eliminar todo el historial de escaneos?')) {
            await chrome.runtime.sendMessage({ action: 'clearHistory' });
            await loadHistory();
        }
    });

    // Open dashboard
    document.getElementById('openDashboard').addEventListener('click', (e) => {
        e.preventDefault();
        chrome.tabs.create({ url: 'http://localhost:3000/dashboard' });
    });

    // Settings button (placeholder)
    document.getElementById('settingsBtn').addEventListener('click', () => {
        alert('Configuración próximamente...');
    });

    // Report button (placeholder)
    document.getElementById('reportBtn').addEventListener('click', () => {
        alert('Función de reporte próximamente...');
    });
}
