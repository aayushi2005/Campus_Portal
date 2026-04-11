import React, { useContext, useState, useEffect } from 'react'
import { AppContext } from '../context/AppContext'
import { motion } from 'framer-motion'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useUser, RedirectToSignIn } from '@clerk/react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { CheckCircle, Clock, XCircle } from 'lucide-react'

const NoDues = () => {
    const { backendUrl } = useContext(AppContext)
    const { isSignedIn, user, isLoaded } = useUser()
    const [existingRequest, setExistingRequest] = useState(null)
    const [loadingData, setLoadingData] = useState(true)
    const [loading, setLoading] = useState(false)

    const [formData, setFormData] = useState({
        name: user?.fullName || '',
        rollNumber: '',
        branch: '',
        year: '',
        company: '',
        package: '',
        letterUrl: '',
        type: 'Job'
    })

    useEffect(() => {
        const fetchStatus = async () => {
            if (!isSignedIn) {
                setLoadingData(false)
                return;
            }
            try {
                const token = await window.Clerk.session.getToken()
                const response = await axios.get(`${backendUrl}/api/student/no-dues/status`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                if (response.data.success && response.data.request) {
                    setExistingRequest(response.data.request)
                }
            } catch (error) {
                console.error("Failed to fetch no dues status:", error)
            } finally {
                setLoadingData(false)
            }
        }
        if (isLoaded) fetchStatus()
    }, [isSignedIn, isLoaded, backendUrl])

    if (!isSignedIn) {
        return <RedirectToSignIn forceRedirectUrl="/no-dues" />
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const token = await window.Clerk.session.getToken()
            const response = await axios.post(`${backendUrl}/api/student/no-dues`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (response.data.success) {
                toast.success(response.data.message)
                setExistingRequest({ status: 'Pending' }) // Locally assume it's pending
            } else {
                toast.error(response.data.message)
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Navbar />
            
            <div className="flex-grow flex items-center justify-center p-4 py-12">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-panel w-full max-w-2xl bg-white shadow-xl rounded-3xl p-8 border border-gray-100 min-h-[400px] flex flex-col justify-center"
                >
                    {loadingData ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="w-8 h-8 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div>
                        </div>
                    ) : existingRequest && (existingRequest.status === 'Pending' || existingRequest.status === 'Approved') ? (
                        <div className="text-center py-6">
                            {existingRequest.status === 'Pending' ? (
                                <>
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Clock className="text-yellow-500 w-10 h-10" />
                                    </motion.div>
                                    <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight mb-3">Approval Pending</h2>
                                    <p className="text-gray-500 mb-8 max-w-md mx-auto">Your placement or higher studies outcome is currently under review by the placement coordinator. Keep an eye out for updates!</p>
                                </>
                            ) : (
                                <>
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <CheckCircle className="text-green-500 w-10 h-10" />
                                    </motion.div>
                                    <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight mb-3">No Dues Cleared!</h2>
                                    <p className="text-gray-500 mb-8 max-w-md mx-auto">Your placement information has been successfully verified. You have completed the No Dues process for the placement unit.</p>
                                </>
                            )}
                            <button onClick={() => window.location.href = '/'} className="btn-primary px-8 py-3 rounded-full font-semibold shadow-md hover:shadow-lg transition-all">
                                Return Home
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="text-center mb-10">
                                <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-indigo-800 tracking-tight">No Dues Form</h1>
                                <p className="text-gray-500 mt-2">Submit your placement or higher studies outcome to complete your graduation clearance process.</p>
                                {existingRequest && existingRequest.status === 'Rejected' && (
                                    <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-xl font-medium flex items-center justify-center gap-2 border border-red-100">
                                        <XCircle size={18} />
                                        Your previous request was rejected. Please re-verify your details and submit again.
                                    </div>
                                )}
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6 text-sm">
                                <div className="flex gap-2 p-1 bg-gray-100/80 rounded-xl mb-4 max-w-sm mx-auto">
                                    <button 
                                        type="button"
                                        onClick={() => setFormData({...formData, type: 'Job'})}
                                        className={`flex-1 py-2.5 rounded-lg font-bold text-xs transition-all ${formData.type === 'Job' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        💼 Job Offer
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setFormData({...formData, type: 'Higher Studies'})}
                                        className={`flex-1 py-2.5 rounded-lg font-bold text-xs transition-all ${formData.type === 'Higher Studies' ? 'bg-white text-purple-600 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        🎓 Higher Studies
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-gray-700 font-semibold mb-2">Student Name</label>
                                        <input required type="text" className="glass-input w-full p-3 bg-gray-50/50" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Full Name" />
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 font-semibold mb-2">Roll Number</label>
                                        <input required type="text" className="glass-input w-full p-3 bg-gray-50/50" value={formData.rollNumber} onChange={e => setFormData({...formData, rollNumber: e.target.value})} placeholder="University Roll No." />
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-gray-700 font-semibold mb-2">Branch</label>
                                        <input required type="text" className="glass-input w-full p-3 bg-gray-50/50" value={formData.branch} onChange={e => setFormData({...formData, branch: e.target.value})} placeholder="e.g. CSE, IT" />
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 font-semibold mb-2">Graduation Year</label>
                                        <input required type="text" className="glass-input w-full p-3 bg-gray-50/50" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} placeholder="e.g. 2024" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-gray-700 font-semibold mb-2">{formData.type === 'Higher Studies' ? 'University / Institute' : 'Company'}</label>
                                        <input required type="text" className="glass-input w-full p-3 bg-gray-50/50" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} placeholder={formData.type === 'Higher Studies' ? 'e.g. IIT Delhi' : 'Company Name'} />
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 font-semibold mb-2">{formData.type === 'Higher Studies' ? 'Program / Degree' : 'Package details'}</label>
                                        <input required type="text" className="glass-input w-full p-3 bg-gray-50/50" value={formData.package} onChange={e => setFormData({...formData, package: e.target.value})} placeholder={formData.type === 'Higher Studies' ? 'e.g. M.Tech AI' : 'e.g. 12 LPA'} />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2 pb-1 border-t border-gray-100 pt-4 mt-2">Proof Document Link (Drive/Cloud PDF)</label>
                                    <input required type="url" className="glass-input w-full p-3 bg-gray-50/50" value={formData.letterUrl} onChange={e => setFormData({...formData, letterUrl: e.target.value})} placeholder="https://..." />
                                    <p className="text-xs text-gray-500 mt-2">* Please provide a publicly accessible link to your Offer Letter or Admission Letter.</p>
                                </div>

                                <div className="pt-4">
                                    <button disabled={loading} type="submit" className={`btn-primary w-full py-3.5 text-base rounded-2xl shadow-lg hover:shadow-xl transition-all ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                                        {loading ? 'Submitting...' : 'Submit No Dues Form'}
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                </motion.div>
            </div>
            <Footer />
        </div>
    )
}

export default NoDues
