import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Helmet } from 'react-helmet'
import HeaderSection from './assets/component/HomeComponents.jsx/HeaderSection'
import FooterSection from './assets/component/HomeComponents.jsx/FooterSection'
import { BACKEND_URL } from './config/Api'
import './App.css'

export default function ResetPassword() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields')
      return
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (!token) {
      setError('Invalid or missing reset token')
      return
    }

    setLoading(true)

    try {
      await axios.post(`${BACKEND_URL}/profile/reset-password`, {
        token,
        newPassword
      })

      setSuccess(true)
      setError('')

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (err) {
      console.error('Reset password error:', err.response?.data || err.message)
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>Reset Password - Tofar Logistics Agency</title>
      </Helmet>
      <HeaderSection />
      
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ 
          maxWidth: '400px', 
          width: '100%', 
          padding: '30px', 
          border: '1px solid #ddd', 
          borderRadius: '8px', 
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>Reset Your Password</h2>

          {success ? (
            <div style={{ 
              padding: '15px', 
              backgroundColor: '#d4edda', 
              color: '#155724', 
              borderRadius: '5px',
              textAlign: 'center',
              marginBottom: '20px'
            }}>
              <p><strong>Success!</strong> Your password has been reset successfully.</p>
              <p>Redirecting to login...</p>
            </div>
          ) : (
            <>
              {error && (
                <div style={{ 
                  padding: '12px', 
                  backgroundColor: '#f8d7da', 
                  color: '#721c24', 
                  borderRadius: '5px',
                  marginBottom: '20px',
                  border: '1px solid #f5c6cb'
                }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter your new password"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '5px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                    disabled={loading}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your new password"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '5px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: loading ? '#ccc' : '#007bff',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.3s'
                  }}
                  onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#0056b3')}
                  onMouseOut={(e) => !loading && (e.target.style.backgroundColor = '#007bff')}
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>

              <p style={{ textAlign: 'center', marginTop: '20px', color: '#666', fontSize: '14px' }}>
                Remember your password? <a href="/login" style={{ color: '#007bff', textDecoration: 'none' }}>Login here</a>
              </p>
            </>
          )}
        </div>
      </div>

      <FooterSection />
    </>
  )
}
