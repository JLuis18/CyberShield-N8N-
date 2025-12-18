# AbuseIPDB Threat Intelligence Setup Guide

## 🚀 Quick Start

CyberShield now includes real-time threat intelligence powered by **AbuseIPDB** - a collaborative IP reputation database with millions of reports from around the world.

## 📋 Prerequisites

- CyberShield application already set up
- Internet connection for API calls

## 🔑 Step 1: Get Your API Key

1. **Register** for a free account at: https://www.abuseipdb.com/register
2. **Verify your email** (increases daily limit from 1,000 to 3,000 checks)
3. **Get your API key** from: https://www.abuseipdb.com/account/api

### Free Tier Limits:
- ✅ **1,000 checks/day** (default)
- ✅ **3,000 checks/day** (with email verification)
- ✅ No credit card required
- ✅ Instant activation

---

## ⚙️ Step 2: Configure Environment

1. **Copy your API key** from AbuseIPDB dashboard

2. **Add to your `.env` file:**

```bash
# AbuseIPDB Threat Intelligence
ABUSEIPDB_API_KEY=your_actual_api_key_here
ENABLE_THREAT_INTELLIGENCE=true
```

3. **Restart your application:**

```bash
npm run dev
```

That's it! The system will automatically start using threat intelligence.

---

## 🧪 Step 3: Test the Integration

### Test with Known Malicious IP

```bash
curl -X POST http://localhost:3000/api/scanner/network \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "ipAddress": "118.25.6.39",
    "port": 22,
    "protocol": "TCP"
  }'
```

**Expected Response** (if IP is reported):
```json
{
  "riskLevel": "high",
  "threats": [
    "SSH externo desconocido",
    "🌐 150 reportes de abuso globales",
    "📊 Confianza de amenaza: 85%"
  ],
  "connectionInfo": {
    "threatIntelligence": {
      "provider": "abuseipdb",
      "abuseConfidenceScore": 85,
      "totalReports": 150,
      "isWhitelisted": false,
      "countryCode": "CN",
      "isp": "Example ISP",
      "cached": false
    }
  }
}
```

### Test with Known Safe IP (Google DNS)

```bash
curl -X POST http://localhost:3000/api/scanner/network \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "ipAddress": "8.8.8.8",
    "port": 53,
    "protocol": "UDP"
  }'
```

**Expected Response:**
```json
{
  "riskLevel": "low",
  "threats": [
    "Google DNS",
    "✓ Conexión segura verificada",
    "✅ IP verificada como legítima"
  ],
  "connectionInfo": {
    "threatIntelligence": {
      "abuseConfidenceScore": 0,
      "totalReports": 0,
      "isWhitelisted": true
    }
  }
}
```

---

## 📊 How It Works

### 1. **Automatic Detection**
When you scan an IP, the system:
1. First checks the **local threat database** (your rules)
2. Then queries **AbuseIPDB API** for global reputation
3. Combines both scores using weighted algorithm:
   - **60%** AbuseIPDB score
   - **40%** Rule-based score

### 2. **Smart Caching**
- Results are cached for **24 hours**
- Reduces API calls by ~90%
- Automatic cache cleanup

### 3. **Rate Limit Protection**
- Tracks daily usage (900 calls/day limit for safety)
- Falls back to rule-based analysis if limit reached
- Resets automatically every 24 hours

### 4. **Risk Scoring**

| AbuseIPDB Score | Risk Level | Action |
|----------------|------------|--------|
| 75-100% | 🧨 Critical | Block immediately |
| 50-74% | 🔴 High | Block + investigate |
| 25-49% | 🟡 Medium | Monitor closely |
| 1-24% | 🟢 Low | Standard monitoring |
| 0% (Whitelisted) | ✅ Safe | Allow |

---

## 🔧 Advanced Configuration

### Disable Threat Intelligence (Optional)

```bash
# In .env
ENABLE_THREAT_INTELLIGENCE=false
```

### Or remove API key to disable:
```bash
# In .env
# ABUSEIPDB_API_KEY=your_api_key_here
```

The system will gracefully fall back to rule-based analysis only.

---

## 📈 Monitoring Usage

### Check Cache Statistics

The cache automatically stores IP reputation checks to minimize API calls.

**Cache behavior:**
- Stores results for 24 hours
- Automatically cleans expired entries
- No manual maintenance needed

### Rate Limit Status

The free tier provides:
- **1,000-3,000 checks/day**
- Conservative limit set to **900/day** for safety
- Resets every 24 hours

If you exceed the limit:
- System falls back to rule-based analysis
- No errors shown to users
- Logged in server console

---

## 🎯 What You Get

### Enhanced Detection
- ✅ **Global threat data** from millions of reports
- ✅ **Real-time updates** no training needed
- ✅ **Country & ISP info** for better context
- ✅ **Whitelisted IPs** reduce false positives

### Better Accuracy
- ✅ **Combined scoring** (local rules + global intel)
- ✅ **Higher confidence** when sources agree
- ✅ **Reduced false positives** with whitelist

### Response Enrichment
Your API responses now include:
```json
{
  "threatIntelligence": {
    "provider": "abuseipdb",
    "abuseConfidenceScore": 85,
    "totalReports": 150,
    "lastReportedAt": "2024-12-03T10:30:00Z",
    "isWhitelisted": false,
    "countryCode": "CN",
    "isp": "Example ISP",
    "cached": true
  }
}
```

---

## 🆘 Troubleshooting

### Issue: "API key not configured"
**Solution:** Ensure `.env` has `ABUSEIPDB_API_KEY` set correctly

### Issue: "Rate limit exceeded"
**Solution:** Wait 24 hours or upgrade AbuseIPDB plan. System will work with local rules meanwhile.

### Issue: No threat intelligence data in response
**Check:** 
1. Is `ENABLE_THREAT_INTELLIGENCE=true` in `.env`?
2. Is API key valid?
3. Check server console for errors

### Issue: All IPs show cached=true
**This is normal!** Cache improves performance. First check is always `cached: false`, subsequent checks show `cached: true`.

---

## 🔐 Security Notes

- ⚠️ **Never commit** your `.env` file with API key
- ✅ API key is **not exposed** to frontend
- ✅ All requests are **server-side only**
- ✅ Graceful fallback if API is down

---

## 📚 Resources

- AbuseIPDB Website: https://www.abuseipdb.com
- API Documentation: https://docs.abuseipdb.com
- Dashboard: https://www.abuseipdb.com/account
- Check IPs manually: https://www.abuseipdb.com/check/[IP-ADDRESS]

---

## 🎉 You're All Set!

Your CyberShield installation now has **AI-powered threat detection** using global threat intelligence - **no training required!**

The system automatically learns from the collaborative database updated by security researchers worldwide. 🌍
