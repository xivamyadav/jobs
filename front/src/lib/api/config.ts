/**
 * API Configuration
 * Determines whether to use mock APIs or real APIs
 * 
 * Usage:
 * Set environment variable: NEXT_PUBLIC_USE_MOCK_API=true (development)
 * Or: NEXT_PUBLIC_USE_MOCK_API=false (production with real API)
 */

export const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true'

export const API_CONFIG = {
    useMockApi: USE_MOCK_API,
    apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
    mockDelay: 0, // No delay for mock data - instant response
}
