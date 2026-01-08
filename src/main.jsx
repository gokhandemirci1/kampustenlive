import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Global error handler for Agora stats collector network errors
// These errors are harmless and don't affect video/audio streaming
window.addEventListener('error', (event) => {
  // Ignore Agora stats collector network errors
  if (
    event.message &&
    (
      event.message.includes('statscollector') ||
      event.message.includes('ERR_NETWORK_CHANGED') ||
      event.message.includes('sd-rtn.com')
    )
  ) {
    event.preventDefault()
    return false
  }
})

// Handle unhandled promise rejections from Agora SDK
window.addEventListener('unhandledrejection', (event) => {
  // Ignore Agora stats collector network errors
  if (
    event.reason &&
    (
      (typeof event.reason === 'string' && (
        event.reason.includes('statscollector') ||
        event.reason.includes('ERR_NETWORK_CHANGED') ||
        event.reason.includes('sd-rtn.com')
      )) ||
      (event.reason.message && (
        event.reason.message.includes('statscollector') ||
        event.reason.message.includes('ERR_NETWORK_CHANGED') ||
        event.reason.message.includes('sd-rtn.com')
      ))
    )
  ) {
    event.preventDefault()
    return false
  }
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)


