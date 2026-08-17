import Cookies from 'js-cookie'

export async function apiRequest(endpoint, options = {}) {
  const token = Cookies.get('access_token')
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  }
  
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`
  }
  
  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  }
  
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}${endpoint}`, config)
    
    if (response.status === 401) {
      // Token expired or invalid
      Cookies.remove('access_token')
      Cookies.remove('user')
      window.location.href = '/login'
      throw new Error('Session expired. Please login again.')
    }
    
    return response
  } catch (error) {
    console.error('API request error:', error)
    throw error
  }
}

export async function get(endpoint) {
  return apiRequest(endpoint, { method: 'GET' })
}

export async function post(endpoint, data) {
  return apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

export async function put(endpoint, data) {
  return apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data)
  })
}

export async function del(endpoint) {
  return apiRequest(endpoint, { method: 'DELETE' })
}