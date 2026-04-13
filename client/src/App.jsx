import React from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useUser, useClerk } from '@clerk/react'
import { useEffect, useContext, useState } from 'react'
import Home from './pages/Home'
import ApplyJob from './pages/ApplyJob'
import Applications from './pages/Applications'
import StudentProfile from './pages/StudentProfile'
import RecruiterLogin from './components/RecruiterLogin'
import { AppContext } from './context/AppContext'
import Dashboard from './pages/Dashboard'
import AddJob from './pages/AddJob'
import ManageJobs from './pages/ManageJobs'
import ViewApplications from './pages/ViewApplications'
import DashboardHome from './pages/DashboardHome'
import ManageNotices from './pages/ManageNotices'
import CompanyTracker from './pages/CompanyTracker'
import PlacementRecords from './pages/PlacementRecords'
import StudentDatabase from './pages/StudentDatabase'
import ManageQueries from './pages/ManageQueries'
import StudentDoubts from './pages/StudentDoubts'
import NoDues from './pages/NoDues'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import axios from 'axios'
import { useAuth } from '@clerk/react'

import 'quill/dist/quill.snow.css'

const App = () => {
  const { showRecruiterLogin, backendUrl } = useContext(AppContext)
  const { user, isLoaded, isSignedIn } = useUser()
  const { getToken } = useAuth()
  const { signOut } = useClerk()
  const navigate = useNavigate()
  const location = useLocation()
  const [restrictedUser, setRestrictedUser] = useState(false)
  const [synced, setSynced] = useState(false)

  // Enforce College Email Domain Restriction (EXCEPT for Alumni routing directly to No Dues!)
  useEffect(() => {
      // Do not block access if the user is explicitly on the No Dues flow
      if (location.pathname === '/no-dues') {
          return;
      }

      if (isLoaded && isSignedIn && user) {
          const email = user.primaryEmailAddress?.emailAddress || '';
          // If on any other page, strictly enforce the college email payload
          if (!email.endsWith('@ietlucknow.ac.in')) {
              setRestrictedUser(true);
              setTimeout(() => {
                  signOut();
                  setRestrictedUser(false);
                  navigate('/');
              }, 4000)
          } else if (!synced) {
              // Valid College Student - Sync Authentication Securely!
              const performSync = async () => {
                  try {
                      const token = await getToken();
                      const res = await axios.post(`${backendUrl}/api/student/sync`, {
                          name: user.fullName,
                          email: email,
                          image: user.imageUrl
                      }, { headers: { Authorization: `Bearer ${token}` } });
                      
                      setSynced(true);
                      
                      const dbUser = res.data.user;
                      if (!dbUser || !dbUser.name || !dbUser.branch || !dbUser.phone || !dbUser.passingYear) {
                          navigate('/profile');
                      }
                  } catch (error) {
                      console.error("Auth Sync Failure:", error);
                  }
              }
              performSync();
          }
      }
  }, [isLoaded, isSignedIn, user, signOut, navigate, location.pathname, synced, backendUrl, getToken])

  if (restrictedUser) {
      return (
          <div className="fixed inset-0 z-[99999] bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
                  <span className="text-5xl">🚫</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-red-600 mb-4 tracking-tight">Access Restricted</h1>
              <p className="text-lg md:text-xl text-gray-700 max-w-lg mx-auto font-medium">
                  We detected an unsupported login attempt via <span className="font-bold text-gray-900 border-b-2 border-red-200">{user?.primaryEmailAddress?.emailAddress}</span>.
              </p>
              <p className="mt-4 text-base md:text-lg text-gray-500 max-w-md mx-auto">
                  Please login strictly with your official college email ID ending in <b>@ietlucknow.ac.in</b>.
              </p>
              <div className="mt-12 flex items-center gap-3">
                  <div className="w-5 h-5 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
                  <p className="text-sm font-bold text-gray-400 tracking-widest uppercase">Terminating Session...</p>
              </div>
          </div>
      )
  }


  return (
    <div>
      <ToastContainer position="bottom-right" />
      {showRecruiterLogin && <RecruiterLogin/>}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/apply-job/:id" element={<ApplyJob />} />
        <Route path="/applications" element={<Applications />} />
        <Route path="/profile" element={<StudentProfile />} />
        <Route path="/doubts" element={<StudentDoubts />} />
        <Route path="/no-dues" element={<NoDues />} />
        
        <Route path='/dashboard' element={<Dashboard />}>
              <Route index element={<DashboardHome />} />
              <Route path='add-job' element={<AddJob />} />
              <Route path='manage-jobs' element={<ManageJobs />} />
              <Route path='view-applications' element={<ViewApplications />} /> 
              <Route path='manage-notices' element={<ManageNotices />} />
              <Route path='company-tracker' element={<CompanyTracker />} />
              <Route path='placement-records' element={<PlacementRecords />} />
              <Route path='student-database' element={<StudentDatabase />} />
              <Route path='manage-queries' element={<ManageQueries />} />
        </Route>
      </Routes>
      
    </div>
  )
}

export default App
