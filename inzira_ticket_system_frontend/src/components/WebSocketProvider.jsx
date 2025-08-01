import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

const WebSocketContext = createContext()

export const useWebSocket = () => {
  const context = useContext(WebSocketContext)
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider')
  }
  return context
}

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [seatUpdates, setSeatUpdates] = useState({})
  const { isAuthenticated, getToken } = useAuth()

  useEffect(() => {
    if (isAuthenticated()) {
      connectWebSocket()
    } else {
      disconnectWebSocket()
    }

    return () => {
      disconnectWebSocket()
    }
  }, [isAuthenticated()])

  const connectWebSocket = () => {
    try {
      // For now, we'll simulate WebSocket with Server-Sent Events
      // In a real implementation, you would connect to a WebSocket server
      const eventSource = new EventSource(`http://localhost:8080/api/sse/seat-updates?token=${getToken()}`)
      
      eventSource.onopen = () => {
        setIsConnected(true)
        console.log('SSE connection established')
      }

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === 'SEAT_UPDATE') {
            setSeatUpdates(prev => ({
              ...prev,
              [data.scheduleId]: data.availableSeats
            }))
          }
        } catch (error) {
          console.error('Error parsing SSE message:', error)
        }
      }

      eventSource.onerror = () => {
        setIsConnected(false)
        console.log('SSE connection error')
      }

      setSocket(eventSource)
    } catch (error) {
      console.error('Failed to connect to SSE:', error)
    }
  }

  const disconnectWebSocket = () => {
    if (socket) {
      socket.close()
      setSocket(null)
      setIsConnected(false)
    }
  }

  const subscribeTo = (scheduleId) => {
    // In a real WebSocket implementation, you would send a subscription message
    console.log(`Subscribing to schedule ${scheduleId}`)
  }

  const unsubscribeFrom = (scheduleId) => {
    // In a real WebSocket implementation, you would send an unsubscription message
    console.log(`Unsubscribing from schedule ${scheduleId}`)
  }

  const value = {
    isConnected,
    seatUpdates,
    subscribeTo,
    unsubscribeFrom
  }

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  )
}