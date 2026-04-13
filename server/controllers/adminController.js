import Notice from '../models/Notice.js';
import Company from '../models/Company.js';
import Placement from '../models/Placement.js';
import User from '../models/User.js';
import ForumQuery from '../models/ForumQuery.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import StudentRecord from '../models/StudentRecord.js';
import NoDuesRequest from '../models/NoDuesRequest.js';
import { uploadToCloudinary } from '../config/cloudinary.js';

// --- NOTICES ---
export const getNotices = async (req, res) => {
    try {
        const notices = await Notice.find().sort({ date: -1 });
        res.json({ success: true, notices });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
}

export const createNotice = async (req, res) => {
    try {
        const { title, content, urgency } = req.body;
        const newNotice = new Notice({ title, content, urgency, date: Date.now() });
        await newNotice.save();
        res.json({ success: true, message: "Notice broadcasted!" });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
}

export const deleteNotice = async (req, res) => {
    try {
        await Notice.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Notice deleted" });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
}

// --- COMPANIES ---
export const getCompanies = async (req, res) => {
    try {
        const companies = await Company.find();
        res.json({ success: true, companies });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
}

export const updateCompanyTag = async (req, res) => {
    try {
        const { tag } = req.body;
        await Company.findByIdAndUpdate(req.params.id, { tag });
        res.json({ success: true, message: "Company status updated" });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
}

export const createCompany = async (req, res) => {
    try {
        const newCompany = new Company({ ...req.body });
        await newCompany.save();
        res.json({ success: true, message: "Company Added!" });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
}

export const deleteCompany = async (req, res) => {
    try {
        await Company.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Company Deleted!" });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
}

// --- STUDENTS ---
export const getStudents = async (req, res) => {
    try {
        const students = await User.find();
        res.json({ success: true, students });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
}

export const toggleBlacklist = async (req, res) => {
    try {
        const student = await User.findById(req.params.id);
        student.isBlacklisted = !student.isBlacklisted;
        await student.save();
        res.json({ success: true, message: "Blacklist toggled", isBlacklisted: student.isBlacklisted });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
}

export const getStudentRecords = async (req, res) => {
    try {
        const records = await StudentRecord.find();
        res.json({ success: true, records });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
}

export const bulkUploadStudentRecords = async (req, res) => {
    try {
        const { records } = req.body; // Array of items
        
        // Use insertMany with ordered: false to skip duplicate rollNumbers without aborting the whole process
        await StudentRecord.insertMany(records, { ordered: false })
            .catch(err => {
                // Ignore duplicate key errors, as we just want to skip existing students
                if (err.code !== 11000) throw err;
            });
            
        // Retroactively sync branch info to any previously registered users missing it
        if (records && records.length > 0) {
            const bulkUserOps = records.map(record => ({
                updateOne: {
                    filter: { rollNumber: record.rollNumber },
                    update: { $set: { branch: record.branch, name: record.name } }
                }
            }));
            await User.bulkWrite(bulkUserOps, { ordered: false }).catch(err => console.error("Sync partial error:", err));
        }
            
        res.json({ success: true, message: "Bulk upload executed & registered users synced!" });
    } catch (error) { 
        res.status(500).json({ success: false, message: "Server error during bulk upload" }); 
    }
}

export const deleteStudentRecord = async (req, res) => {
    try {
        await StudentRecord.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Ledger record deleted" });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
}

export const clearStudentRecords = async (req, res) => {
    try {
        await StudentRecord.deleteMany({});
        res.json({ success: true, message: "Master ledger completely cleared" });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
}

// --- QUERIES ---
export const getQueries = async (req, res) => {
    try {
        const queries = await ForumQuery.find().sort({ createdAt: -1 });
        res.json({ success: true, queries });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
}

export const resolveQuery = async (req, res) => {
    try {
        const { reply } = req.body;
        await ForumQuery.findByIdAndUpdate(req.params.id, { 
            reply: reply || "", 
            isResolved: true 
        });
        res.json({ success: true, message: "Query resolved successfully" });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
}

export const deleteQuery = async (req, res) => {
    try {
        await ForumQuery.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Query deleted" });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
}

// --- JOBS ---
export const getJobs = async (req, res) => {
    try {
        const jobs = await Job.find().sort({ date: -1 });
        res.json({ success: true, jobs });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
}

export const createJob = async (req, res) => {
    try {
        const newJob = new Job({ ...req.body, date: Date.now() });
        await newJob.save();
        res.json({ success: true, message: "Job Posted!" });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
}

export const toggleJobVisibility = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        job.visible = !job.visible;
        await job.save();
        res.json({ success: true, message: "Job visibility toggled!" });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
}

export const deleteJob = async (req, res) => {
    try {
        await Job.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Job deleted!" });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
}

// --- APPLICATIONS ---
export const getApplications = async (req, res) => {
    try {
        const applications = await Application.find().sort({ date: -1 });
        res.json({ success: true, applications });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
}

export const updateApplicationStatus = async (req, res) => {
    try {
        const { status } = req.body;
        await Application.findByIdAndUpdate(req.params.id, { status });
        res.json({ success: true, message: "Applicant status updated" });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
}

// --- PLACEMENTS ---
export const getPlacements = async (req, res) => {
    try {
        const placements = await Placement.find().sort({ date: -1 });
        res.json({ success: true, placements });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
}

export const createPlacement = async (req, res) => {
    try {
        let letterUrl = req.body.letterUrl || "";
        
        if (req.file) {
            try {
                letterUrl = await uploadToCloudinary(req.file.buffer, 'placements');
            } catch (err) {
                return res.status(500).json({ success: false, message: "File upload failed", error: err.message });
            }
        }

        const newPlacement = new Placement({ ...req.body, letterUrl, date: Date.now() });
        await newPlacement.save();
        res.json({ success: true, message: "Placement Record added!", record: newPlacement });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
}

export const deletePlacement = async (req, res) => {
    try {
        await Placement.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Placement Record deleted!" });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
}

// --- NO DUES REQUESTS ---
export const getNoDuesRequests = async (req, res) => {
    try {
        const requests = await NoDuesRequest.find().sort({ date: -1 });
        res.json({ success: true, requests });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
}

export const approveNoDuesRequest = async (req, res) => {
    try {
        const request = await NoDuesRequest.findById(req.params.id);
        if (!request) return res.status(404).json({ success: false, message: "Request not found" });
        if (request.status !== 'Pending') return res.status(400).json({ success: false, message: "Request already processed" });

        request.status = 'Approved';
        await request.save();

        // Add to Placement archive
        const newPlacement = new Placement({
            name: request.name,
            rollNumber: request.rollNumber,
            branch: request.branch,
            year: request.year,
            company: request.company,
            package: request.package,
            letterUrl: request.letterUrl,
            type: request.type,
            date: Date.now()
        });
        await newPlacement.save();

        res.json({ success: true, message: "Request Approved and added to Outgoing records!" });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
}

export const rejectNoDuesRequest = async (req, res) => {
    try {
        const request = await NoDuesRequest.findById(req.params.id);
        if (!request) return res.status(404).json({ success: false, message: "Request not found" });
        if (request.status !== 'Pending') return res.status(400).json({ success: false, message: "Request already processed" });

        request.status = 'Rejected';
        await request.save();

        res.json({ success: true, message: "Request Rejected!" });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
}
