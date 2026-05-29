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

export const searchCities = async (query: string) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/city-search/?q=${query}`, {
            headers: getHeaders()
        })
        return response.data // { count, results: [{ label, ... }] }
    } catch (error) {
        const message = getApiErrorMessage(error, 'Unable to search cities.')
        throw new Error(message)
    }
}

export const searchSkills = async (query: string) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/skills/search/?q=${query}`, {
            headers: getHeaders()
        })
        return response.data // [{ skill_id, skill_name }]
    } catch (error) {
        const message = getApiErrorMessage(error, 'Unable to search skills.')
        throw new Error(message)
    }
}

export const createSkill = async (skillName: string) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/skills/`, {
            skill_name: skillName
        }, {
            headers: getHeaders()
        })
        return response.data // { skill_id, skill_name }
    } catch (error) {
        const message = getApiErrorMessage(error, 'Unable to create skill.')
        throw new Error(message)
    }
}
