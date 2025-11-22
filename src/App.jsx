import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import './App.css'
import authService from "./appwrite/auth"
import {login, logout} from "./store/authSlice"
import { Footer, Header } from './components'
import { Outlet, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast';

function App() {
  const [loading, setLoading] = useState(true)
  const dispatch = useDispatch()
  const location = useLocation()

  useEffect(() => {
    authService.getCurrentUser()
    .then((userData) => {
      if (userData) {
        dispatch(login({userData}))
      } else {
        dispatch(logout())
      }
    })
    .finally(() => setLoading(false))
  }, [])

  const noFooterRoutes = ['/login', '/signup', '/messages', '/admin'];
  const shouldShowFooter = !noFooterRoutes.some(route => location.pathname.startsWith(route));
  
  return !loading ? (
    <div className='min-h-screen flex flex-col bg-background text-foreground bg-grid-pattern'>
      <Header />
      <Toaster 
        position="top-right" 
        reverseOrder={false}
        toastOptions={{
          className: '',
          style: {
            border: '1px solid hsl(var(--border))',
            padding: '16px',
            color: 'hsl(var(--foreground))',
            background: 'hsl(var(--card))',
          },
          success: {
            iconTheme: {
              primary: 'hsl(var(--primary))',
              secondary: 'hsl(var(--primary-foreground))',
            },
          },
          error: {
            iconTheme: {
              primary: 'hsl(var(--destructive))',
              secondary: 'hsl(var(--destructive-foreground))',
            },
          },
        }}
      />
      <main className="flex-grow">
        <Outlet />
      </main>
      {shouldShowFooter && <Footer />}
    </div>
  ) : null
}

export default App