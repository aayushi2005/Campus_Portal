import React, { useContext, useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'
import { LogOut, Bell, Building2, FileCheck, Users, MessageSquare } from 'lucide-react'

const Dashboard = () => {

    const navigate = useNavigate()

    const { companyData, setCompanyData, setCompanyToken } = useContext(AppContext)

    // Function to logout for company
    const logout = () => {
        setCompanyToken(null)
        localStorage.removeItem('companyToken')
        setCompanyData(null)
        navigate('/')
    }

    // Remove automatic redirect to manage-jobs so it lands on dashboard home (Overview)
    useEffect(() => {
        // if (companyData) { navigate('/dashboard') } is not needed if the route drops them there
    }, [companyData])

    return (
        <div className='min-h-screen flex flex-col'>

            {/* Navbar for Recuriter Panel */}
            <div className='shadow-sm border-b border-gray-100 py-4 bg-white/80 backdrop-blur-md sticky top-0 z-50'>
                <div className='px-6 flex justify-between items-center'>
                    <div onClick={() => navigate('/')} className='flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity'>
                        <img className='w-10 sm:w-12 mix-blend-multiply' src={assets.iet_logo_2} alt="IET Logo" />
                        <h1 className='text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-800 tracking-tight'>
                            IET Lucknow Placement Portal
                        </h1>
                    </div>
                    {/* Always show coordinator profile for now */}
                    <div className='flex items-center gap-4'>
                        <div className='text-right max-sm:hidden'>
                            <p className='text-sm font-semibold text-gray-800 tracking-tight'>Welcome, Coordinator</p>
                            <p className='text-xs text-gray-500 font-medium'>Placement Cell</p>
                        </div>
                        <div className='relative group'>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-md border-2 border-white cursor-pointer overflow-hidden">
                                <img src={assets.profile_img} alt="Profile" className="w-full h-full object-cover" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className='flex items-start flex-1'>

                {/* Left Sidebar with option to add job, manage jobs, view applications */}
                <div className='flex flex-col min-h-[calc(100vh-80px)] border-r border-gray-100 bg-white/50 w-64 shrink-0 transition-all'>
                    <ul className='flex flex-col items-start pt-6 text-gray-600 font-medium w-full flex-1 overflow-y-auto max-h-[calc(100vh-140px)]'>
                        <NavLink className={({ isActive }) => ` flex items-center px-6 py-4 gap-3 w-full transition-all border-l-4 ${isActive ? 'bg-indigo-50/50 text-indigo-700 border-indigo-600 font-bold' : 'border-transparent hover:bg-gray-50 hover:text-gray-900'}`} end to={'/dashboard'}>
                            <img className='w-5 opacity-80' src={assets.home_icon} alt="" />
                            <p className='max-sm:hidden'>Overview</p>
                        </NavLink>
        
                        <NavLink className={({ isActive }) => ` flex items-center px-6 py-4 gap-3 w-full transition-all border-l-4 ${isActive ? 'bg-indigo-50/50 text-indigo-700 border-indigo-600 font-bold' : 'border-transparent hover:bg-gray-50 hover:text-gray-900'}`} to={'/dashboard/add-job'}>
                            <img className='w-5 opacity-80' src={assets.add_icon} alt="" />
                            <p className='max-sm:hidden'>Add Job</p>
                        </NavLink>

                        <NavLink className={({ isActive }) => ` flex items-center px-6 py-4 gap-3 w-full transition-all border-l-4 ${isActive ? 'bg-indigo-50/50 text-indigo-700 border-indigo-600 font-bold' : 'border-transparent hover:bg-gray-50 hover:text-gray-900'}`} to={'/dashboard/manage-jobs'}>
                            <img className='w-5 opacity-80' src={assets.suitcase_icon} alt="" />
                            <p className='max-sm:hidden'>Manage Jobs</p>
                        </NavLink>

                        <NavLink className={({ isActive }) => ` flex items-center px-6 py-4 gap-3 w-full transition-all border-l-4 ${isActive ? 'bg-indigo-50/50 text-indigo-700 border-indigo-600 font-bold' : 'border-transparent hover:bg-gray-50 hover:text-gray-900'}`} to={'/dashboard/view-applications'}>
                            <img className='w-5 opacity-80' src={assets.person_tick_icon} alt="" />
                            <p className='max-sm:hidden'>View Applications</p>
                        </NavLink>

                        <div className='w-full px-6 py-2 mt-2'>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block border-b border-gray-100 pb-2">Power Tools</span>
                        </div>

                        <NavLink className={({ isActive }) => ` flex items-center px-6 py-3.5 gap-3 w-full transition-all border-l-4 ${isActive ? 'bg-indigo-50/50 text-indigo-700 border-indigo-600 font-bold' : 'border-transparent hover:bg-gray-50 hover:text-gray-900'}`} to={'/dashboard/manage-notices'}>
                            <Bell size={20} className='opacity-80' />
                            <p className='max-sm:hidden'>Manage Notices</p>
                        </NavLink>

                        <NavLink className={({ isActive }) => ` flex items-center px-6 py-3.5 gap-3 w-full transition-all border-l-4 ${isActive ? 'bg-indigo-50/50 text-indigo-700 border-indigo-600 font-bold' : 'border-transparent hover:bg-gray-50 hover:text-gray-900'}`} to={'/dashboard/company-tracker'}>
                            <Building2 size={20} className='opacity-80' />
                            <p className='max-sm:hidden'>Company Tracker</p>
                        </NavLink>

                        <NavLink className={({ isActive }) => ` flex items-center px-6 py-3.5 gap-3 w-full transition-all border-l-4 ${isActive ? 'bg-indigo-50/50 text-indigo-700 border-indigo-600 font-bold' : 'border-transparent hover:bg-gray-50 hover:text-gray-900'}`} to={'/dashboard/placement-records'}>
                            <FileCheck size={20} className='opacity-80' />
                            <p className='max-sm:hidden'>Placement Records</p>
                        </NavLink>

                        <NavLink className={({ isActive }) => ` flex items-center px-6 py-3.5 gap-3 w-full transition-all border-l-4 ${isActive ? 'bg-indigo-50/50 text-indigo-700 border-indigo-600 font-bold' : 'border-transparent hover:bg-gray-50 hover:text-gray-900'}`} to={'/dashboard/student-database'}>
                            <Users size={20} className='opacity-80' />
                            <p className='max-sm:hidden'>Student Base</p>
                        </NavLink>

                        <NavLink className={({ isActive }) => ` flex items-center px-6 py-3.5 gap-3 w-full transition-all border-l-4 ${isActive ? 'bg-indigo-50/50 text-indigo-700 border-indigo-600 font-bold' : 'border-transparent hover:bg-gray-50 hover:text-gray-900'}`} to={'/dashboard/manage-queries'}>
                            <MessageSquare size={20} className='opacity-80' />
                            <p className='max-sm:hidden'>Query Forum</p>
                        </NavLink>
                    </ul>
                    
                    <div className='p-4 border-t border-gray-100 mt-auto bg-white/50 z-10 block'>
                        <button 
                            onClick={logout} 
                            className='flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors'
                        >
                            <LogOut size={18} />
                            <span className='max-sm:hidden'>Logout</span>
                        </button>
                    </div>
                </div>

                <div className='flex-1 h-[calc(100vh-80px)] p-2 sm:p-5 m-2 overflow-y-auto overflow-x-hidden'>
                    <Outlet />
                </div>

            </div>

        </div>
    )
}

export default Dashboard