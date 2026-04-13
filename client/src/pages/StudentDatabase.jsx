import React, { useContext, useState, useRef } from 'react'
import { AppContext } from '../context/AppContext'
import { motion } from 'framer-motion'
import { Search, UserX, UserCheck, ShieldAlert, Filter, Upload, FileSpreadsheet, Users, Briefcase, Trash2 } from 'lucide-react'
import { toast } from 'react-toastify'
import axios from 'axios'

const StudentDatabase = () => {
    const { students, studentRecords, offerLetters, backendUrl, fetchBackendData } = useContext(AppContext)
    const [search, setSearch] = useState('')
    const [branchFilter, setBranchFilter] = useState('All')
    const [statusFilter, setStatusFilter] = useState('All')
    const [yearFilter, setYearFilter] = useState('All')
    const [placementStatusFilter, setPlacementStatusFilter] = useState('All')

    const [activeTab, setActiveTab] = useState('registered') // 'registered' | 'ledger' | 'placement_status'
    const fileInputRef = useRef(null)

    const handleToggleBlacklist = async (id) => {
        try {
            const res = await axios.put(`${backendUrl}/api/admin/students/${id}/blacklist`)
            fetchBackendData()
            if (res.data.isBlacklisted) toast.error("Student has been blacklisted.")
            else toast.success("Student blacklist lifted.")
        } catch (error) {
            toast.error(error.message)
        }
    }

    const handleClearLedger = async () => {
        if (!window.confirm("Are you ABSOLUTELY sure you want to clear the entire Master Ledger? This action cannot be undone.")) return;
        try {
            await axios.delete(`${backendUrl}/api/admin/student-records/clear`)
            fetchBackendData()
            toast.success("Master ledger has been completely cleared.")
        } catch (error) { toast.error("Failed to clear ledger.") }
    }

    const handleDeleteLedgerRecord = async (id) => {
        if (!window.confirm("Delete this student record from the ledger?")) return;
        try {
            await axios.delete(`${backendUrl}/api/admin/student-records/${id}`)
            fetchBackendData()
            toast.success("Record deleted successfully.")
        } catch (error) { toast.error("Failed to delete record.") }
    }

    const filteredStudents = students.filter(s => {
        const matchesSearch = (s.name || '').toLowerCase().includes(search.toLowerCase()) || (s.rollNumber || '').includes(search)
        const matchesBranch = branchFilter === 'All' || s.branch === branchFilter
        const matchesStatus = statusFilter === 'All' ||
            (statusFilter === 'Active' && !s.isBlacklisted) ||
            (statusFilter === 'Blacklisted' && s.isBlacklisted)

        return matchesSearch && matchesBranch && matchesStatus
    })

    const branches = activeTab === 'registered'
        ? ['All', ...new Set(students.map(s => s.branch))]
        : ['All', ...new Set(studentRecords.map(s => s.branch))]

    const years = ['All', ...new Set(studentRecords.filter(s => s.year).map(s => s.year))]

    // Placement Ledger Data Processing
    const placementData = studentRecords.map(record => {
        let offer = offerLetters.find(o => o.rollNumber === record.rollNumber) || null
        if (offer) {
            offer = { ...offer }
            if (!offer.type) offer.type = 'Job'; // legacy fallback
        }
        return { ...record, offer }
    })

    const filteredPlacementData = placementData.filter(s => {
        const matchesSearch = (s.name || '').toLowerCase().includes(search.toLowerCase()) || (s.rollNumber || '').includes(search)
        const matchesBranch = branchFilter === 'All' || s.branch === branchFilter
        const matchesYear = yearFilter === 'All' || s.year === yearFilter
        const matchesStatus = placementStatusFilter === 'All' ||
            (placementStatusFilter === 'Job' && s.offer?.type === 'Job') ||
            (placementStatusFilter === 'Higher Studies' && s.offer?.type === 'Higher Studies') ||
            (placementStatusFilter === 'Pending' && !s.offer)

        return matchesSearch && matchesBranch && matchesYear && matchesStatus
    })

    const totalStudents = filteredPlacementData.length;
    const uploadedCount = filteredPlacementData.filter(s => s.offer).length;
    const pendingCount = totalStudents - uploadedCount;

    const handleFileUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        try {
            const text = await file.text()
            const rows = text.split('\n').map(r => r.trim()).filter(r => r.length > 0)
            if (rows.length < 2) return toast.error("File is empty or missing headers")

            // Resilient CSV parser to handle commas inside quotes
            const parseCsvRow = (row) => {
                const cols = [];
                let current = '';
                let inQuotes = false;
                for (let i = 0; i < row.length; i++) {
                    if (row[i] === '"') {
                        inQuotes = !inQuotes;
                    } else if (row[i] === ',' && !inQuotes) {
                        cols.push(current.trim().replace(/^"|"$/g, ''));
                        current = '';
                    } else {
                        current += row[i];
                    }
                }
                cols.push(current.trim().replace(/^"|"$/g, ''));
                return cols;
            };

            const headers = parseCsvRow(rows[0]).map(h => h.toLowerCase())

            const rollIdx = headers.findIndex(h => h.includes('roll'))
            const nameIdx = headers.findIndex(h => h.includes('name'))
            const emailIdx = headers.findIndex(h => h.includes('email'))
            const branchIdx = headers.findIndex(h => h.includes('branch'))
            const degreeIdx = headers.findIndex(h => h.includes('degree'))
            const yearIdx = headers.findIndex(h => h.includes('year'))

            if (rollIdx === -1 || nameIdx === -1 || branchIdx === -1 || yearIdx === -1) {
                return toast.error("CSV Headers missing. Required: Roll, Name, Branch, Year. Found: " + headers.join(',').substring(0, 50));
            }

            const records = rows.slice(1).map(row => {
                const cols = parseCsvRow(row);
                let rRoll = cols[rollIdx] ? cols[rollIdx].trim() : '';
                let rName = cols[nameIdx] ? cols[nameIdx].trim() : '';

                // Fallback for corrupted CSVs where Roll Number was pasted into the Name column (e.g. "22043... Abhay Kumar")
                if (!rRoll && rName) {
                    const match = rName.match(/^(\d+|\d\.\d+E\+\d+)\s+(.+)$/i);
                    if (match) {
                        rRoll = match[1];
                        rName = match[2];
                    }
                }

                return {
                    rollNumber: rRoll,
                    name: rName,
                    email: emailIdx !== -1 ? cols[emailIdx] : '',
                    branch: cols[branchIdx] ? cols[branchIdx].trim() : '',
                    degree: (degreeIdx !== -1 && cols[degreeIdx]) ? cols[degreeIdx].trim() : 'B.Tech',
                    year: cols[yearIdx] ? cols[yearIdx].trim() : ''
                }
            }).filter(r => r.rollNumber && r.name && r.branch && r.year)

            if (records.length === 0) {
                return toast.error("No valid records found in the CSV. Make sure each row has Roll, Name, Branch, and strictly includes the Year.");
            }

            await axios.post(`${backendUrl}/api/admin/student-records/bulk`, { records })
            toast.success(`Successfully processed ${records.length} valid records! Duplicate IDs skipped.`)
            fetchBackendData()
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to parse or upload CSV: " + err.message)
            console.error(err)
        }

        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className='container mx-auto p-2 sm:p-4'
        >
            <div className="flex border-b border-gray-200 mb-6 gap-6">
                <button
                    onClick={() => setActiveTab('registered')}
                    className={`flex items-center gap-2 pb-3 font-semibold transition-colors ${activeTab === 'registered' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <Users size={18} /> Registered Accounts
                </button>
                <button
                    onClick={() => setActiveTab('ledger')}
                    className={`flex items-center gap-2 pb-3 font-semibold transition-colors ${activeTab === 'ledger' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <FileSpreadsheet size={18} /> Master Ledger
                </button>
                <button
                    onClick={() => setActiveTab('placement_status')}
                    className={`flex items-center gap-2 pb-3 font-semibold transition-colors ${activeTab === 'placement_status' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <Briefcase size={18} /> Placement Matcher
                </button>
            </div>

            <div className='glass-panel p-6 rounded-3xl mb-8 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 shadow-sm border border-gray-100'>
                <div>
                    <h2 className='text-2xl font-bold text-gray-800 tracking-tight flex items-center gap-3'>
                        {activeTab === 'registered' && 'Student Directory'}
                        {activeTab === 'ledger' && 'Official Batch Ledger'}
                        {activeTab === 'placement_status' && 'Offer Letter Matcher'}
                    </h2>
                    {activeTab === 'registered' && studentRecords.length > 0 && (
                        <div className="mt-3 flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-lg text-sm font-bold text-indigo-700 w-fit shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            {students.length} / {studentRecords.length} Master Ledger Students Registered
                        </div>
                    )}
                    <p className='text-gray-500 text-sm mt-3'>
                        {activeTab === 'registered' && 'Manage registered candidates and enforce strict disciplinary actions.'}
                        {activeTab === 'ledger' && 'Upload official CSVs and track the entire enrolled branch.'}
                        {activeTab === 'placement_status' && 'Cross-reference master ledger to track students pending offer letter uploads.'}
                    </p>
                </div>

                <div className='flex flex-wrap items-center gap-3 w-full xl:w-auto'>
                    <div className="relative flex-grow sm:flex-grow-0 sm:w-56">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={16} className="text-gray-400" />
                        </div>
                        <input
                            placeholder="Search Name or Roll No..."
                            className="glass-input pl-9 pr-4 py-2.5 text-sm w-full font-medium"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Filter size={14} className="text-gray-400" />
                        </div>
                        <select
                            value={branchFilter}
                            onChange={(e) => setBranchFilter(e.target.value)}
                            className="glass-input pl-9 pr-4 py-2.5 text-sm font-medium min-w-[130px]"
                        >
                            {branches.map(b => (
                                <option key={`branch-${b}`} value={b}>{b === 'All' ? 'All Branches' : b}</option>
                            ))}
                        </select>
                    </div>

                    {activeTab === 'placement_status' && (
                        <select
                            value={yearFilter}
                            onChange={(e) => setYearFilter(e.target.value)}
                            className="glass-input px-4 py-2.5 text-sm font-medium min-w-[110px]"
                        >
                            {years.map(y => (
                                <option key={`year-${y}`} value={y}>{y === 'All' ? 'All Years' : y}</option>
                            ))}
                        </select>
                    )}

                    {activeTab === 'registered' && (
                        <div className="relative">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="glass-input px-4 py-2.5 text-sm font-medium min-w-[130px]"
                            >
                                <option value="All">All Statuses</option>
                                <option value="Active">🟢 Active Only</option>
                                <option value="Blacklisted">🔴 Blacklisted</option>
                            </select>
                        </div>
                    )}

                    {activeTab === 'placement_status' && (
                        <div className="relative">
                            <select
                                value={placementStatusFilter}
                                onChange={(e) => setPlacementStatusFilter(e.target.value)}
                                className="glass-input px-4 py-2.5 text-sm font-medium min-w-[150px]"
                            >
                                <option value="All">All Statuses</option>
                                <option value="Job">💼 Job Offers</option>
                                <option value="Higher Studies">🎓 Higher Studies</option>
                                <option value="Pending">⌛ Pending</option>
                            </select>
                        </div>
                    )}

                    {activeTab === 'ledger' && (
                        <div className="relative flex gap-2">
                            <button
                                onClick={handleClearLedger}
                                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl shadow-sm font-semibold text-sm text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors border border-gray-200 bg-white cursor-pointer"
                                title="Clear Entire Ledger"
                            >
                                <Trash2 size={16} /> Clear
                            </button>
                            <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="btn-primary flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl shadow-md"
                            >
                                <Upload size={16} /> Import CSV
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {activeTab === 'placement_status' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                    <div className="glass-panel p-5 rounded-2xl border border-gray-100 flex items-center gap-4 bg-white/60">
                        <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">{totalStudents}</div>
                        <div><p className="text-sm font-semibold text-gray-500">Total in Scope</p><p className="text-xl font-bold text-gray-800">Master List</p></div>
                    </div>
                    <div className="glass-panel p-5 rounded-2xl border border-green-100 flex items-center gap-4 bg-green-50/30">
                        <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-lg">{uploadedCount}</div>
                        <div><p className="text-sm font-semibold text-green-600">Verified</p><p className="text-xl font-bold text-green-800">Uploaded</p></div>
                    </div>
                    <div className="glass-panel p-5 rounded-2xl border border-red-100 flex items-center gap-4 bg-red-50/30">
                        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-lg">{pendingCount}</div>
                        <div><p className="text-sm font-semibold text-red-600">Defaulters</p><p className="text-xl font-bold text-red-800">Pending</p></div>
                    </div>
                </div>
            )}

            <div className='glass-panel rounded-3xl overflow-hidden border border-gray-100 bg-white/50 shadow-sm'>
                <div className='overflow-x-auto'>
                    <table className='w-full text-sm text-left whitespace-nowrap'>
                        <thead className='bg-gray-50/80 border-b border-gray-100 text-gray-600 font-bold uppercase tracking-wider text-xs'>
                            <tr>
                                <th className='py-4 px-6'>Roll Number</th>
                                <th className='py-4 px-6'>Full Name</th>
                                <th className='py-4 px-6'>{(activeTab === 'ledger' || activeTab === 'placement_status') ? 'Course Details' : 'Branch'}</th>
                                {activeTab === 'registered' && <th className='py-4 px-6 text-center'>Account Status</th>}
                                {activeTab === 'placement_status' && <th className='py-4 px-6 text-center'>Offer Letter Status</th>}
                                {activeTab !== 'placement_status' && <th className='py-4 px-6 text-center'>{activeTab === 'ledger' ? 'Verification & Actions' : 'Quick Action'}</th>}
                            </tr>
                        </thead>
                        <tbody className='divide-y divide-gray-100'>
                            {activeTab === 'registered' && filteredStudents.map((student, index) => (
                                <tr key={index} className={`transition-colors ${student.isBlacklisted ? 'bg-red-50/30 hover:bg-red-50/50' : 'hover:bg-blue-50/20'}`}>
                                    <td className='py-3 px-6 font-semibold text-gray-600'>
                                        {student.rollNumber}
                                    </td>
                                    <td className='py-3 px-6'>
                                        <span className={`font-bold ${student.isBlacklisted ? 'text-red-700' : 'text-gray-800'}`}>
                                            {student.name}
                                        </span>
                                    </td>
                                    <td className='py-3 px-6'>
                                        <span className="text-gray-500 font-medium">
                                            {student.branch}
                                        </span>
                                    </td>
                                    <td className='py-3 px-6 text-center'>
                                        {student.isBlacklisted ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                                                <ShieldAlert size={12} /> BANNED
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                                                <UserCheck size={12} /> ACTIVE
                                            </span>
                                        )}
                                    </td>
                                    <td className='py-3 px-6 text-center'>
                                        <div className="flex items-center justify-center">
                                            <button
                                                onClick={() => handleToggleBlacklist(student._id)}
                                                title={student.isBlacklisted ? "Lift Ban" : "Blacklist Student"}
                                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm ${student.isBlacklisted
                                                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
                                                        : 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white'
                                                    }`}
                                            >
                                                {student.isBlacklisted ? <UserCheck size={14} /> : <UserX size={14} />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {activeTab === 'ledger' && studentRecords.filter(s =>
                                ((s.name || '').toLowerCase().includes(search.toLowerCase()) || (s.rollNumber || '').includes(search)) &&
                                (branchFilter === 'All' || s.branch === branchFilter)
                            ).map((record, index) => {
                                const isRegistered = students.some(rs => rs.rollNumber === record.rollNumber);
                                return (
                                    <tr key={index} className='hover:bg-blue-50/20 transition-colors'>
                                        <td className='py-3 px-6 font-semibold text-gray-600'>{record.rollNumber}</td>
                                        <td className='py-3 px-6 font-bold text-gray-800 break-words'>{record.name}</td>
                                        <td className='py-3 px-6'>
                                            <div className='flex flex-col'>
                                                <span className="text-gray-700 font-semibold text-xs">{record.degree} - {record.branch}</span>
                                                <span className="text-gray-400 text-xs text-left">Graduation Year {record.year}</span>
                                            </div>
                                        </td>
                                        <td className='py-3 px-6 text-center'>
                                            <div className="flex items-center justify-center gap-3">
                                                {isRegistered ?
                                                    <span className='inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-600 border border-indigo-100'>Registered</span> :
                                                    <span className='inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-500 border border-gray-200'>Unregistered</span>
                                                }
                                                <button
                                                    onClick={() => handleDeleteLedgerRecord(record._id)}
                                                    title="Delete Ledger Record"
                                                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all bg-red-50 text-red-500 hover:bg-red-500 hover:text-white"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}

                            {activeTab === 'placement_status' && filteredPlacementData.map((record, index) => (
                                <tr key={index} className={`transition-colors ${record.offer ? 'hover:bg-green-50/10' : 'bg-red-50/10 hover:bg-red-50/30'}`}>
                                    <td className='py-3 px-6 font-semibold text-gray-600'>{record.rollNumber}</td>
                                    <td className='py-3 px-6 font-bold text-gray-800 break-words'>{record.name}</td>
                                    <td className='py-3 px-6'>
                                        <div className='flex flex-col'>
                                            <span className="text-gray-700 font-semibold text-xs">{record.degree} - {record.branch}</span>
                                            <span className="text-gray-400 text-xs text-left">Class of {record.year}</span>
                                        </div>
                                    </td>
                                    <td className='py-3 px-6 text-center'>
                                        {record.offer ?
                                            (record.offer.type === 'Higher Studies' ?
                                                <span className='inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-600 border border-purple-100'>🎓 Higher Ed</span> :
                                                <span className='inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200'>✅ Placed</span>
                                            )
                                            :
                                            <span className='inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-200'>⌛ Pending</span>
                                        }
                                    </td>
                                </tr>
                            ))}

                            {((activeTab === 'registered' && filteredStudents.length === 0) || (activeTab === 'ledger' && studentRecords.length === 0) || (activeTab === 'placement_status' && filteredPlacementData.length === 0)) && (
                                <tr>
                                    <td colSpan="5" className="py-12 text-center text-gray-500 font-medium">
                                        No students perfectly matched your filters, or database is empty.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    )
}

export default StudentDatabase
