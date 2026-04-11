import { useContext, useState, useEffect } from 'react'
import { assets } from '../assets/assets'
import { useClerk, UserButton, useUser } from '@clerk/react'
import { Link, useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { motion } from 'framer-motion'
import { BriefcaseBusiness, UserRound, LogIn, HelpCircle } from 'lucide-react'

const Navbar = () => {

    const { openSignIn } = useClerk()
    const { user } = useUser()
    const navigate = useNavigate()
    const { setShowRecruiterLogin } = useContext(AppContext)

    // Check if current user is an Alumni (lacks the college email domain)
    const isAlumni = user?.primaryEmailAddress?.emailAddress && !user.primaryEmailAddress.emailAddress.endsWith('@ietlucknow.ac.in');

    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <motion.div
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
            className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100' : 'bg-transparent'}`}
        >
            <div className='container px-4 2xl:px-20 mx-auto flex justify-between items-center py-4'>
                <div onClick={() => navigate('/')} className='flex items-center gap-3 cursor-pointer group'>
                    <img className='w-10 sm:w-12 group-hover:scale-105 transition-transform mix-blend-multiply' src={assets.iet_logo_2} alt="IET Logo" />
                    <h1 className='text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 tracking-tight'>
                        IET Lucknow
                        <span className="block text-xs font-semibold text-blue-600 uppercase tracking-widest mt-0.5">Placement Portal</span>
                    </h1>
                </div>

                {
                    user
                        ? <div className='flex items-center gap-4 sm:gap-6'>
                            {!isAlumni && (
                                <>
                                    <Link to={'/doubts'} className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                                        <HelpCircle size={16} /> <span className="hidden xl:inline">Doubts Forum</span>
                                    </Link>
                                    <div className="w-px h-4 bg-gray-300 hidden sm:block"></div>
                                </>
                            )}
                            <Link to={'/no-dues'} className="flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-800 transition-colors">
                                <BriefcaseBusiness size={16} /> <span className="hidden xl:inline">No Dues Form</span>
                            </Link>
                            <div className="w-px h-4 bg-gray-300 hidden sm:block"></div>
                            {!isAlumni && (
                                <>
                                    <Link to={'/applications'} className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                                        <BriefcaseBusiness size={16} /> <span className="hidden sm:inline">Applied Jobs</span>
                                    </Link>
                                    <div className="w-px h-4 bg-gray-300"></div>
                                    <Link to={'/profile'} className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                                        <UserRound size={16} /> <span className="hidden sm:inline">Profile</span>
                                    </Link>
                                    <div className="w-px h-4 bg-gray-300 absolute -left-[9999px] hidden"></div>
                                </>
                            )}
                            <p className='max-sm:hidden text-sm font-medium text-gray-800 ml-2'>Hi, {user.firstName}</p>
                            <UserButton afterSignOutUrl="/" />
                        </div>
                        :
                        <div className='flex items-center gap-4 max-sm:text-xs'>
                            <button onClick={e => setShowRecruiterLogin(true)} className='text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors'>
                                Coordinator Login
                            </button>
                            <button onClick={e => navigate('/no-dues')} className='btn-primary flex items-center justify-center py-2 px-4 text-xs sm:text-sm rounded-full bg-slate-800 text-white shadow hover:bg-slate-700 transition-colors'>
                                Alumni Login
                            </button>
                            <button onClick={e => openSignIn()} className='btn-primary flex items-center gap-2 py-2 px-5 sm:px-7 text-sm rounded-full shadow-md hover:shadow-lg'>
                                <LogIn size={16} /> Student Login
                            </button>
                        </div>
                }
            </div>
        </motion.div>
    )
}

export default Navbar