/**
 * CyberShield Background Service Worker
 * Handles URL scanning, badge updates, and notifications
 */

importScripts('/lib/api.js', '/lib/utils.js');

const scanCache = new ScanCache();
let currentScans = new Map(); // Track ongoing scans

/**
 * Handle navigation to new URLs
 */
chrome.webNavigation.onCompleted.addListener(async (details) => {
    // Only process main frame navigation
    if (details.frameId !== 0) return;

    const url = details.url;
    const tabId = details.tabId;

    // Skip chrome:// and extension URLs
    if (url.startsWith('chrome://') || url.startsWith('chrome-extension://')) {
        return;
    }

    // Scan the URL
    await scanAndUpdateTab(url, tabId);
});

/**
 * Scan URL and update tab badge
 */
async function scanAndUpdateTab(url, tabId) {
    try {
        // Check cache first
        let scanResult = scanCache.get(url);

        if (!scanResult) {
            // Check if already scanning this URL
            if (currentScans.has(url)) {
                return await currentScans.get(url);
            }

            // Start new scan
            const scanPromise = api.scanURL(url);
            currentScans.set(url, scanPromise);

            try {
                scanResult = await scanPromise;

                // Cache the result
                if (scanResult.analyzed) {
                    scanCache.set(url, scanResult);
                }
            } finally {
                currentScans.delete(url);
            }
        }

        // Update badge based on risk level
        await updateTabBadge(tabId, scanResult);

        // Show notification for high-risk sites
        if (scanResult.riskLevel === 'high' || scanResult.riskLevel === 'critical') {
            await showThreatNotification(url, scanResult);
        }

        // Store scan in history
        await addToHistory(url, scanResult);

    } catch (error) {
        console.error('Scan failed:', error);
        await updateBadge('?', '#6b7280', tabId);
    }
}

/**
 * Update tab badge with scan result
 */
async function updateTabBadge(tabId, scanResult) {
    if (!scanResult.analyzed) {
        await updateBadge('', '#6b7280', tabId);
        return;
    }

    const riskLevel = scanResult.riskLevel || 'unknown';
    const emoji = getRiskEmoji(riskLevel);
    const color = getRiskColor(riskLevel);

    // Set badge text (empty for safe, emoji for unsafe)
    const badgeText = (riskLevel === 'low' || riskLevel === 'safe') ? '' : '!';

    await updateBadge(badgeText, color, tabId);

    // Update icon based on risk
    await updateIcon(tabId, riskLevel);
}

/**
 * Update extension icon based on risk level
 */
async function updateIcon(tabId, riskLevel) {
    // You can create different icon sets for different risk levels
    // For now, we'll use the same icon
    // In production, create icon-safe.png, icon-warning.png, icon-danger.png
}

/**
 * Show notification for detected threats
 */
async function showThreatNotification(url, scanResult) {
    const domain = extractDomain(url);
    const threats = scanResult.threats || [];
    const emoji = getRiskEmoji(scanResult.riskLevel);

    const title = `${emoji} Amenaza Detectada`;
    const message = `${domain}\n${threats.slice(0, 2).join('\n')}`;

    await showNotification(title, message);
}

/**
 * Add scan to history
 */
async function addToHistory(url, scanResult) {
    try {
        const history = await getHistory();

        const entry = {
            url,
            domain: extractDomain(url),
            riskLevel: scanResult.riskLevel,
            threats: scanResult.threats || [],
            timestamp: Date.now(),
            analyzed: scanResult.analyzed
        };

        // Keep only last 50 scans
        history.unshift(entry);
        if (history.length > 50) {
            history.length = 50;
        }

        await chrome.storage.local.set({ scanHistory: history });
    } catch (error) {
        console.error('Failed to save to history:', error);
    }
}

/**
 * Get scan history
 */
async function getHistory() {
    const result = await chrome.storage.local.get(['scanHistory']);
    return result.scanHistory || [];
}

/**
 * Clear scan history
 */
async function clearHistory() {
    await chrome.storage.local.set({ scanHistory: [] });
}

/**
 * Handle messages from popup/content scripts
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    (async () => {
        try {
            switch (request.action) {
                case 'scanURL':
                    const result = await scanAndUpdateTab(request.url, sender.tab?.id);
                    sendResponse({ success: true, result });
                    break;

                case 'getHistory':
                    const history = await getHistory();
                    sendResponse({ success: true, history });
                    break;

                case 'clearHistory':
                    await clearHistory();
                    sendResponse({ success: true });
                    break;

                case 'getCurrentTabScan':
                    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
                    if (tabs[0]) {
                        const cached = scanCache.get(tabs[0].url);
                        sendResponse({ success: true, result: cached });
                    } else {
                        sendResponse({ success: false, error: 'No active tab' });
                    }
                    break;

                case 'rescan':
                    // Clear cache and rescan
                    scanCache.clear();
                    const tabs2 = await chrome.tabs.query({ active: true, currentWindow: true });
                    if (tabs2[0]) {
                        await scanAndUpdateTab(tabs2[0].url, tabs2[0].id);
                        sendResponse({ success: true });
                    }
                    break;

                default:
                    sendResponse({ success: false, error: 'Unknown action' });
            }
        } catch (error) {
            console.error('Message handler error:', error);
            sendResponse({ success: false, error: error.message });
        }
    })();

    return true; // Keep message channel open for async response
});

/**
 * Handle extension installation
 */
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        // Open welcome page
        chrome.tabs.create({ url: 'popup/welcome.html' });
    }
});

console.log('CyberShield background service worker loaded');
