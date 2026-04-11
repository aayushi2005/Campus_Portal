import { useContext, useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Lock, Mail, User, ArrowRight, ShieldCheck } from 'lucide-react'
import { toast } from 'react-toastify'

const RecruiterLogin = () => {

    const [state, setState] = useState('Login')
    const [name, setName] = useState('')
    const [password, setPassword] = useState('')
    const [email, setEmail] = useState('')

    const { setShowRecruiterLogin, setCompanyToken, setCompanyData } = useContext(AppContext)
    const navigate = useNavigate()

    const onSubmitHandler = async (e) => {
        e.preventDefault()
        
        // Strict Hardcoded Authentication for Coordinator
        const ADMIN_EMAIL = 'coordinator@ietlucknow.ac.in'
        const ADMIN_PASSWORD = 'admin' // you can change this anytime!
        
        if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
            toast.error("Invalid Coordinator Credentials!")
            return;
        }

        // Proceed if credentials match
        setCompanyData({ name: "IET Lucknow Placement Cell", image: assets.iet_logo_2, email })
        setCompanyToken("mock-token-123")
        setShowRecruiterLogin(false)
        navigate('/dashboard')
    }

    useEffect(() => {
        document.body.style.overflow = 'hidden'
        return () => { document.body.style.overflow = 'unset' }
    }, [])

    return (
        <div className='fixed inset-0 z-[999] backdrop-blur-md bg-slate-900/40 flex justify-center items-center px-4'>
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className='relative w-full max-w-md'
            >
                <form onSubmit={onSubmitHandler} className='glass-panel relative p-8 sm:p-10 rounded-3xl shadow-2xl border border-white/40 overflow-hidden'>
                    
                    {/* Background decorations */}
                    <div className='absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full blur-3xl -mr-10 -mt-10 opacity-60'></div>
                    <div className='absolute bottom-0 left-0 w-32 h-32 bg-indigo-100 rounded-full blur-3xl -ml-10 -mb-10 opacity-60'></div>

                    <button 
                        type="button"
                        onClick={() => setShowRecruiterLogin(false)}
                        className='absolute top-6 right-6 p-2 rounded-full text-gray-400 hover:bg-gray-100/50 hover:text-gray-600 transition-colors z-10'
                    >
                        <X size={20} />
                    </button>

                    <div className='relative z-10'>
                        <div className='flex justify-center mb-6'>
                            <div className='w-20 h-20 bg-white rounded-2xl border border-gray-100 flex items-center justify-center p-3 shadow-inner'>
                                <img src={assets.iet_logo_2} alt="IET Logo" className="w-full h-full object-contain" />
                            </div>
                        </div>

                        <div className="text-center mb-8">
                            <h1 className='text-2xl font-extrabold text-gray-800 tracking-tight'>
                                {state === 'Login' ? 'Coordinator Access' : 'Register Access'}
                            </h1>
                            <p className='text-sm text-gray-500 mt-2 font-medium'>
                                Secure portal for IET Lucknow placement cell
                            </p>
                        </div>

                        <div className='space-y-4'>
                            {state !== 'Login' && (
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-600 ml-1 uppercase tracking-wider">Full Name</label>
                                    <div className='relative group'>
                                        <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                                            <User size={18} className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                        </div>
                                        <input className='glass-input w-full pl-11 pr-4 py-3' onChange={e => setName(e.target.value)} value={name} type="text" placeholder='e.g. John Doe' required />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-600 ml-1 uppercase tracking-wider">Email Address</label>
                                <div className='relative group'>
                                    <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                                        <Mail size={18} className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                    </div>
                                    <input className='glass-input w-full pl-11 pr-4 py-3' onChange={e => setEmail(e.target.value)} value={email} type="email" placeholder='coordinator@ietlucknow.ac.in' required />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-600 ml-1 uppercase tracking-wider">Password</label>
                                <div className='relative group'>
                                    <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                                        <Lock size={18} className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                    </div>
                                    <input className='glass-input w-full pl-11 pr-4 py-3' onChange={e => setPassword(e.target.value)} value={password} type="password" placeholder='••••••••' required />
                                </div>
                            </div>
                        </div>

                        {state === "Login" && (
                            <div className="flex justify-end mt-3 mb-6">
                                <span className='text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer transition-colors'>Recover Password?</span>
                            </div>
                        )}

                        <button type='submit' className='btn-primary w-full py-3.5 mt-6 flex flex-row items-center justify-center gap-2 shadow-lg shadow-blue-500/30 text-sm'>
                            {state === 'Login' ? 'Authenticate' : 'Request Access'} <ArrowRight size={16} />
                        </button>

                        <div className='mt-8 text-center pt-6 border-t border-gray-100/50'>
                            {state === 'Login' ? (
                                <p className='text-sm text-gray-500 font-medium'>
                                    New to the team? <button type="button" className='text-blue-600 font-bold hover:text-blue-800 ml-1 transition-colors' onClick={() => setState("Sign Up")}>Request Access</button>
                                </p>
                            ) : (
                                <p className='text-sm text-gray-500 font-medium'>
                                    Already authorized? <button type="button" className='text-blue-600 font-bold hover:text-blue-800 ml-1 transition-colors' onClick={() => setState("Login")}>Sign In here</button>
                                </p>
                            )}
                        </div>
                    </div>
                </form>
            </motion.div>
        </div>
    )
}

export default RecruiterLogin