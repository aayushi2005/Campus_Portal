import express from 'express';
import { 
    getNotices, createNotice, deleteNotice, 
    getCompanies, updateCompanyTag, createCompany, deleteCompany,
    getStudents, toggleBlacklist, getStudentRecords, bulkUploadStudentRecords, deleteStudentRecord, clearStudentRecords,
    getQueries, resolveQuery, deleteQuery,
    getJobs, createJob, toggleJobVisibility, deleteJob,
    getApplications, updateApplicationStatus,
    getPlacements, createPlacement, deletePlacement,
    getNoDuesRequests, approveNoDuesRequest, rejectNoDuesRequest
} from '../controllers/adminController.js';
import { requireAdminAuth } from '../middlewares/clerkAuth.js';

const router = express.Router();

// Base middleware for all admin routes
router.use(requireAdminAuth);

// Notices
router.get('/notices', getNotices);
router.post('/notices', createNotice);
router.delete('/notices/:id', deleteNotice);

// Companies
router.get('/companies', getCompanies);
router.put('/companies/:id/tag', updateCompanyTag);
router.post('/companies', createCompany);
router.delete('/companies/:id', deleteCompany);

// Students Directory
router.get('/students', getStudents);
router.put('/students/:id/blacklist', toggleBlacklist);
router.get('/student-records', getStudentRecords);
router.post('/student-records/bulk', bulkUploadStudentRecords);
router.delete('/student-records/clear', clearStudentRecords);
router.delete('/student-records/:id', deleteStudentRecord);

// Doubts & Queries
router.get('/queries', getQueries);
router.put('/queries/:id/resolve', resolveQuery);
router.delete('/queries/:id', deleteQuery);

// Jobs & Postings
router.get('/jobs', getJobs);
router.post('/jobs', createJob);
router.put('/jobs/:id/visibility', toggleJobVisibility);
router.delete('/jobs/:id', deleteJob);

// Student Applications
router.get('/applications', getApplications);
router.put('/applications/:id/status', updateApplicationStatus);

// Placement / Offer Letters
router.get('/placements', getPlacements);
router.post('/placements', createPlacement);
router.delete('/placements/:id', deletePlacement);

// No Dues
router.get('/no-dues', getNoDuesRequests);
router.put('/no-dues/:id/approve', approveNoDuesRequest);
router.put('/no-dues/:id/reject', rejectNoDuesRequest);

export default router;
