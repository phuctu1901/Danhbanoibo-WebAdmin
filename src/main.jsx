import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// URL dạng #ten-section (khác route #/...) — lưu lại TRƯỚC khi HashRouter chiếm hash
// rồi đổi thành #/, nếu không route "*" sẽ redirect và mất anchor (đứng im ở hero)
const anchor = window.location.hash && !window.location.hash.startsWith('#/')
  ? decodeURIComponent(window.location.hash.slice(1))
  : ''
if (anchor) {
  window.__landingAnchor = anchor
  history.replaceState(null, '', window.location.pathname + window.location.search + '#/')
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
