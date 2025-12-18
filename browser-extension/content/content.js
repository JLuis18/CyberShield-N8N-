/**
 * CyberShield Content Script
 * Runs on all web pages to provide hover scanning on links
 */

let hoveredLink = null;
let scanTimeout = null;
let tooltip = null;

// Initialize content script
function init() {
    createTooltip();
    attachLinkListeners();
}

/**
 * Create tooltip element
 */
function createTooltip() {
    tooltip = document.createElement('div');
    tooltip.id = 'cybershield-tooltip';
    tooltip.className = 'cybershield-tooltip hidden';
    document.body.appendChild(tooltip);
}

/**
 * Attach listeners to all links
 */
function attachLinkListeners() {
    document.addEventListener('mouseover', handleMouseOver, true);
    document.addEventListener('mouseout', handleMouseOut, true);
}

/**
 * Handle mouse over link
 */
async function handleMouseOver(e) {
    const link = e.target.closest('a[href]');
    if (!link || !link.href) return;

    // Skip if already hovering this link
    if (hoveredLink === link) return;

    hoveredLink = link;

    // Clear any pending scan
    if (scanTimeout) {
        clearTimeout(scanTimeout);
    }

    // Show tooltip after 500ms hover
    scanTimeout = setTimeout(async () => {
        await showLinkInfo(link);
    }, 500);
}

/**
 * Handle mouse out of link
 */
function handleMouseOut(e) {
    const link = e.target.closest('a[href]');
    if (link === hoveredLink) {
        hoveredLink = null;
        hideTooltip();

        if (scanTimeout) {
            clearTimeout(scanTimeout);
            scanTimeout = null;
        }
    }
}

/**
 * Show link information tooltip
 */
async function showLinkInfo(link) {
    const href = link.href;

    // Skip chrome:// and javascript: links
    if (href.startsWith('chrome://') ||
        href.startsWith('javascript:') ||
        href.startsWith('chrome-extension://')) {
        return;
    }

    // Position tooltip near cursor
    const rect = link.getBoundingClientRect();
    tooltip.style.left = `${rect.left}px`;
    tooltip.style.top = `${rect.bottom + window.scrollY + 5}px`;

    // Show loading state
    tooltip.className = 'cybershield-tooltip loading';
    tooltip.innerHTML = `
    <div class="tooltip-header">
      <span class="tooltip-icon">🔍</span>
      <span>Analizando...</span>
    </div>
  `;

    try {
        // Request scan from background
        const response = await chrome.runtime.sendMessage({
            action: 'scanURL',
            url: href
        });

        if (response.success && response.result) {
            displayTooltipResult(response.result, href);
        }
    } catch (error) {
        console.error('Scan request failed:', error);
        hideTooltip();
    }
}

/**
 * Display scan result in tooltip
 */
function displayTooltipResult(result, url) {
    if (!result.analyzed) {
        hideTooltip();
        return;
    }

    const domain = new URL(url).hostname;
    const riskLevel = result.riskLevel || 'unknown';
    const emoji = getRiskEmoji(riskLevel);
    const color = getRiskColor(riskLevel);

    const riskClass = riskLevel === 'high' || riskLevel === 'critical'
        ? 'danger'
        : riskLevel === 'medium' || riskLevel === 'warning'
            ? 'warning'
            : 'safe';

    tooltip.className = `cybershield-tooltip ${riskClass}`;
    tooltip.innerHTML = `
    <div class="tooltip-header" style="background-color: ${color}">
      <span class="tooltip-icon">${emoji}</span>
      <span>${getRiskLevelText(riskLevel)}</span>
    </div>
    <div class="tooltip-body">
      <div class="tooltip-domain">${domain}</div>
      ${result.threats && result.threats.length > 0 ? `
        <div class="tooltip-threat">${result.threats[0]}</div>
      ` : ''}
    </div>
  `;
}

/**
 * Hide tooltip
 */
function hideTooltip() {
    if (tooltip) {
        tooltip.className = 'cybershield-tooltip hidden';
    }
}

/**
 * Get risk emoji
 */
function getRiskEmoji(level) {
    const emojis = {
        low: '🟢', safe: '🟢',
        medium: '🟡', warning: '🟡',
        high: '🔴', critical: '🧨',
        unknown: '❓'
    };
    return emojis[level] || '❓';
}

/**
 * Get risk color
 */
function getRiskColor(level) {
    const colors = {
        low: '#10b981', safe: '#10b981',
        medium: '#f59e0b', warning: '#f59e0b',
        high: '#ef4444', critical: '#dc2626',
        unknown: '#6b7280'
    };
    return colors[level] || '#6b7280';
}

/**
 * Get risk level text
 */
function getRiskLevelText(level) {
    const texts = {
        low: 'Seguro', safe: 'Seguro',
        medium: 'Precaución', warning: 'Advertencia',
        high: '¡Peligroso!', critical: '¡Amenaza!',
        unknown: 'Sin análisis'
    };
    return texts[level] || 'Desconocido';
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
