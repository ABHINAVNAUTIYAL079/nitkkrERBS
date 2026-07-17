import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'
import { ThemeProvider } from './components/ThemeProvider.jsx'
import ThemeBackground from './components/ThemeBackground.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <ThemeBackground />
        <Toaster
            position="top-right"
            toastOptions={{
                duration: 4000,
                style: {
                    background: "#1e293b",
                    color: "#f8fafc",
                    borderRadius: "12px",
                    border: "1px solid #334155",
                },
                success: {
                    iconTheme: { primary: "#22c55e", secondary: "#fff" },
                },
                error: {
                    iconTheme: { primary: "#ef4444", secondary: "#fff" },
                },
            }}
        />
        <div className="relative z-10">
          <App />
        </div>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
