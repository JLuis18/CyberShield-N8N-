/**
 * Test script for AbuseIPDB Threat Intelligence Integration
 * Run with: node --loader tsx scripts/test-abuseipdb.ts
 */

import { getThreatIntelligence, combineThreatScores, getRateLimitStatus, getCacheStats } from '../lib/threat-intelligence'

console.log('🧪 Testing AbuseIPDB Threat Intelligence Integration\n')
console.log('='.repeat(80))

async function testThreatIntelligence() {
    try {
        // Test 1: Known malicious IP (often reported for SSH attacks)
        console.log('\n📍 Test 1: Known Malicious IP')
        console.log('-'.repeat(80))
        const maliciousIP = '118.25.6.39' // Common SSH attack source
        console.log(`Checking IP: ${maliciousIP}`)

        const threat1 = await getThreatIntelligence(maliciousIP)
        if (threat1) {
            console.log('✅ Threat intelligence received!')
            console.log(`   Provider: ${threat1.provider}`)
            console.log(`   Abuse Confidence: ${threat1.abuseConfidenceScore}%`)
            console.log(`   Total Reports: ${threat1.totalReports}`)
            console.log(`   Risk Level: ${threat1.riskLevel}`)
            console.log(`   Whitelisted: ${threat1.isWhitelisted}`)
            console.log(`   Country: ${threat1.countryCode || 'N/A'}`)
            console.log(`   ISP: ${threat1.isp || 'N/A'}`)
            console.log(`   Cached: ${threat1.cached}`)
        } else {
            console.log('⚠️  No threat intelligence data (API might be disabled or error)')
        }

        // Test 2: Safe IP (Google DNS)
        console.log('\n📍 Test 2: Known Safe IP (Google DNS)')
        console.log('-'.repeat(80))
        const safeIP = '8.8.8.8'
        console.log(`Checking IP: ${safeIP}`)

        const threat2 = await getThreatIntelligence(safeIP)
        if (threat2) {
            console.log('✅ Threat intelligence received!')
            console.log(`   Provider: ${threat2.provider}`)
            console.log(`   Abuse Confidence: ${threat2.abuseConfidenceScore}%`)
            console.log(`   Total Reports: ${threat2.totalReports}`)
            console.log(`   Risk Level: ${threat2.riskLevel}`)
            console.log(`   Whitelisted: ${threat2.isWhitelisted}`)
            console.log(`   Cached: ${threat2.cached}`)
        } else {
            console.log('⚠️  No threat intelligence data')
        }

        // Test 3: Score combination
        console.log('\n📍 Test 3: Score Combination Algorithm')
        console.log('-'.repeat(80))
        const ruleScore = 50 // Medium risk from local rules
        const combined = combineThreatScores(ruleScore, threat1)
        console.log(`   Rule-based score: ${ruleScore}`)
        console.log(`   AbuseIPDB score: ${threat1?.abuseConfidenceScore || 0}`)
        console.log(`   Combined score: ${combined.finalScore}`)
        console.log(`   Final risk level: ${combined.riskLevel}`)
        console.log(`   Confidence: ${combined.confidence}%`)

        // Test 4: Cache test (second call should be cached)
        console.log('\n📍 Test 4: Cache Functionality')
        console.log('-'.repeat(80))
        console.log(`Checking same IP again: ${maliciousIP}`)

        const threat1Cached = await getThreatIntelligence(maliciousIP)
        if (threat1Cached) {
            console.log(`   Cached: ${threat1Cached.cached} ${threat1Cached.cached ? '✅' : '❌'}`)
            console.log(`   ${threat1Cached.cached ? 'Cache is working!' : 'First call or cache miss'}`)
        }

        // Get statistics
        console.log('\n📊 System Statistics')
        console.log('-'.repeat(80))
        const rateLimit = getRateLimitStatus()
        const cache = getCacheStats()

        console.log(`   Rate Limit:`)
        console.log(`     - Requests used: ${rateLimit.requestsUsed}`)
        console.log(`     - Requests remaining: ${rateLimit.requestsRemaining}`)
        console.log(`     - Resets at: ${rateLimit.resetTime.toLocaleString()}`)
        console.log(`   Cache:`)
        console.log(`     - Enabled: ${cache.enabled}`)
        console.log(`     - Cached IPs: ${cache.size}`)

        console.log('\n' + '='.repeat(80))
        console.log('✅ All tests completed successfully!')
        console.log('\n💡 Tip: Run this script again to see caching in action.')

    } catch (error) {
        console.error('\n❌ Error during testing:', error)
        console.log('\n🔧 Troubleshooting:')
        console.log('   1. Check that ABUSEIPDB_API_KEY is set in .env')
        console.log('   2. Verify ENABLE_THREAT_INTELLIGENCE=true in .env')
        console.log('   3. Ensure your API key is valid')
        console.log('   4. Check your internet connection')
    }
}

// Run the tests
testThreatIntelligence()
