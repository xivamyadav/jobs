import axios from 'axios'
import Cookies from 'js-cookie'
import { getApiErrorMessage } from '@/lib/api-error'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

const getHeaders = () => {
    const token = Cookies.get('accessToken')
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    }
}

export const getDashboardStats = async (timeframe: string = 'This Week') => {
    try {
        const response = await axios.get(`${API_BASE_URL}/dashboard/stats/?timeframe=${encodeURIComponent(timeframe)}`, {
            headers: getHeaders()
        })
        return response.data
    } catch (error) {
        const message = getApiErrorMessage(error, 'Unable to load dashboard statistics.')
        throw new Error(message)
    }
}
