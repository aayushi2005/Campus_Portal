import { createContext, useEffect, useState } from "react";
import { jobsData, initialOfferLetters } from '../assets/assets'
import axios from 'axios'

export const AppContext = createContext()

export const AppContextProvider = (props) => {
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'

    const [searchFilter, setSearchFilter] = useState({
        title: '',
        location: ''
    })

    const [isSearched, setIsSearched] = useState(false)
    const [jobs, setJobs] = useState([])
    const [showRecruiterLogin, setShowRecruiterLogin] = useState(false)

    const [companyToken, setCompanyToken] = useState(null)
    const [companyData, setCompanyData] = useState(null)

    // Feature States
    const [notices, setNotices] = useState([])
    const [companies, setCompanies] = useState([])
    const [offerLetters, setOfferLetters] = useState([])
    const [students, setStudents] = useState([])
    const [studentRecords, setStudentRecords] = useState([])
    const [queries, setQueries] = useState([])
    const [noDuesRequests, setNoDuesRequests] = useState([])

    const [applications, setApplications] = useState([])

    // Fetch mock data (stuff not in DB yet)
    const fetchJobs = async () => {
        setOfferLetters(initialOfferLetters)
    }

    // Fetch Database data
    const fetchBackendData = async () => {
        try {
            const [noticesRes, companiesRes, studentsRes, recordsRes, queriesRes, jobsRes, appsRes, placementsRes, noDuesRes] = await Promise.all([
                axios.get(`${backendUrl}/api/admin/notices`),
                axios.get(`${backendUrl}/api/admin/companies`),
                axios.get(`${backendUrl}/api/admin/students`),
                axios.get(`${backendUrl}/api/admin/student-records`),
                axios.get(`${backendUrl}/api/admin/queries`),
                axios.get(`${backendUrl}/api/admin/jobs`),
                axios.get(`${backendUrl}/api/admin/applications`),
                axios.get(`${backendUrl}/api/admin/placements`),
                axios.get(`${backendUrl}/api/admin/no-dues`)
            ])
            setNotices(noticesRes.data.notices || [])
            setCompanies(companiesRes.data.companies || [])
            setStudents(studentsRes.data.students || [])
            setStudentRecords(recordsRes.data.records || [])
            setQueries(queriesRes.data.queries || [])
            setJobs(jobsRes.data.jobs || [])
            setApplications(appsRes.data.applications || [])
            setOfferLetters(placementsRes.data.placements || [])
            setNoDuesRequests(noDuesRes.data.requests || [])
        } catch (error) {
            console.error("Backend DB Error:", error)
        }
    }

    useEffect(() => {
        fetchJobs()
        fetchBackendData()
    }, [])

    const value = {
        backendUrl, fetchBackendData,
        setSearchFilter, searchFilter,
        isSearched, setIsSearched,
        jobs, setJobs,
        showRecruiterLogin, setShowRecruiterLogin,
        companyToken, setCompanyToken,
        companyData, setCompanyData,
        notices, setNotices,
        companies, setCompanies,
        offerLetters, setOfferLetters,
        students, setStudents,
        studentRecords, setStudentRecords,
        queries, setQueries,
        applications, setApplications,
        noDuesRequests, setNoDuesRequests
    }

    return <AppContext.Provider value={value}>
        {props.children}
    </AppContext.Provider>
}