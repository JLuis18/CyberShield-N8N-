/**
 * Network Threat Database Test Script
 * 
 * This script demonstrates how the threat database categorizes different connections
 */

import { analyzeConnection, checkKnownConnection, SAFE_CONNECTIONS, WARNING_CONNECTIONS, HIGH_RISK_CONNECTIONS, CRITICAL_CONNECTIONS } from '../lib/network-threats'

console.log('🔍 CyberShield - Network Threat Database Test\n')
console.log('='.repeat(80))

// Test Safe Connections
console.log('\n🟢 SAFE CONNECTIONS - Should pass security check')
console.log('-'.repeat(80))
SAFE_CONNECTIONS.forEach(conn => {
    const result = analyzeConnection(conn.ip, conn.port)
    console.log(`${result.emoji} ${conn.ip}:${conn.port}`)
    console.log(`   Description: ${conn.description}`)
    console.log(`   Category: ${result.category}`)
    console.log(`   Risk Level: ${result.riskLevel}`)
    console.log(`   Threats: ${result.threats.join(', ')}`)
    console.log()
})

// Test Warning Connections
console.log('\n🟡 WARNING CONNECTIONS - Medium risk')
console.log('-'.repeat(80))
WARNING_CONNECTIONS.forEach(conn => {
    const result = analyzeConnection(conn.ip, conn.port)
    console.log(`${result.emoji} ${conn.ip}:${conn.port}`)
    console.log(`   Description: ${conn.description}`)
    console.log(`   Category: ${result.category}`)
    console.log(`   Risk Level: ${result.riskLevel}`)
    console.log(`   Threats: ${result.threats.slice(0, 2).join(', ')}`)
    console.log()
})

// Test High Risk Connections
console.log('\n🔴 HIGH RISK CONNECTIONS - Dangerous')
console.log('-'.repeat(80))
HIGH_RISK_CONNECTIONS.forEach(conn => {
    const result = analyzeConnection(conn.ip, conn.port)
    console.log(`${result.emoji} ${conn.ip}:${conn.port}`)
    console.log(`   Description: ${conn.description}`)
    console.log(`   Category: ${result.category}`)
    console.log(`   Risk Level: ${result.riskLevel}`)
    console.log(`   ⚠️  ${result.threats.slice(0, 2).join(', ')}`)
    console.log()
})

// Test Critical Connections
console.log('\n🧨 CRITICAL CONNECTIONS - IMMEDIATE THREAT')
console.log('-'.repeat(80))
CRITICAL_CONNECTIONS.forEach(conn => {
    const result = analyzeConnection(conn.ip, conn.port)
    console.log(`${result.emoji} ${conn.ip}:${conn.port}`)
    console.log(`   Description: ${conn.description}`)
    console.log(`   Category: ${result.category}`)
    console.log(`   Risk Level: ${result.riskLevel}`)
    console.log(`   🔥 ${result.threats.slice(0, 3).join(' | ')}`)
    console.log(`   Recommendations:`)
    result.recommendations.slice(0, 2).forEach(rec => {
        console.log(`      - ${rec}`)
    })
    console.log()
})

// Port-based detection test
console.log('\n🎯 PORT-BASED DETECTION TEST')
console.log('-'.repeat(80))
const dangerousPorts = [4444, 6667, 9001, 1337, 5000, 2222, 8888]
dangerousPorts.forEach(port => {
    const result = analyzeConnection('1.2.3.4', port)
    console.log(`Port ${port}: ${result.emoji} ${result.category} - ${result.riskLevel}`)
})

console.log('\n' + '='.repeat(80))
console.log('✅ Test completed!')
console.log(`
📊 Summary:
   - Safe connections: ${SAFE_CONNECTIONS.length}
   - Warning connections: ${WARNING_CONNECTIONS.length}
   - High risk connections: ${HIGH_RISK_CONNECTIONS.length}
   - Critical connections: ${CRITICAL_CONNECTIONS.length}
   - Total: ${SAFE_CONNECTIONS.length + WARNING_CONNECTIONS.length + HIGH_RISK_CONNECTIONS.length + CRITICAL_CONNECTIONS.length} known threats
`)
