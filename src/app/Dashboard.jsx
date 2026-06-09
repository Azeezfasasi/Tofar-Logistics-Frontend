import React, { useEffect } from 'react'
import { Helmet } from 'react-helmet'
import { useNavigate } from 'react-router-dom'
import DashHeader from '../assets/component/DashboardComponents.jsx/DashHeader'
import DashMenu from '../assets/component/DashboardComponents.jsx/DashMenu'
import DashboardStats from '../assets/component/DashboardComponents.jsx/DashboardStats'
import AppointmentStatusChart from '../assets/component/DashboardComponents.jsx/AppointmentChart'
import ShipmentChart from '@/assets/component/DashboardComponents.jsx/ShipmentChart'
import QuoteChart from '@/assets/component/DashboardComponents.jsx/QuoteChart'
import UserRolesChart from '@/assets/component/DashboardComponents.jsx/UserChart'
import { useProfile } from '@/assets/context-api/ProfileContext'
import UserDashboardStats from '@/assets/component/DashboardComponents.jsx/UserDashboardStats'
import AdminWelcome from '@/assets/component/DashboardComponents.jsx/AdminWelcome'

function Dashboard() {
  const { isAdmin, isEmployee, isClient, isAgent, isAuthenticated, isLoading } = useProfile()
  const navigate = useNavigate()

  // Redirect to login if session expires or user is not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login', { replace: true })
    }
  }, [isAuthenticated, isLoading, navigate])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 font-inter">
        <div className="text-center text-lg text-gray-700 flex items-center">
          <svg className="animate-spin h-6 w-6 text-blue-600 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading dashboard...
        </div>
      </div>
    )
  }

  // Don't render if not authenticated (redirect will happen in useEffect)
  if (!isAuthenticated) {
    return null
  }

  return (
    <>
    <Helmet>
        <title>Dashboard - Tofar Logistics Agency</title>
    </Helmet>
    <DashHeader />
    <div className='flex flex-row justify-start gap-4'>
      <div className='hidden lg:block w-[20%]'>
        <DashMenu />
      </div>
      <div className='w-full lg:w-[80%]'>
      {(isAdmin || isEmployee) &&
        <>
        <AdminWelcome />
        <DashboardStats />
        </>
      }
      {(isAdmin || isEmployee) &&
      <>
       <ShipmentChart />
       <QuoteChart />
       <UserRolesChart />
       <AppointmentStatusChart />
       </>
      }
      {(isClient || isAgent) &&
      <>
       <UserDashboardStats />
       </>
      }
      </div>
    </div>
    </>
  )
}

export default Dashboard