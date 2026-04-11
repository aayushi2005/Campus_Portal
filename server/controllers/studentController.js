import User from '../models/User.js';
import ForumQuery from '../models/ForumQuery.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import NoDuesRequest from '../models/NoDuesRequest.js';
import StudentRecord from '../models/StudentRecord.js';

// Get Current User Profile
export const getProfile = async (req, res) => {
    try {
        const { userId } = req.auth; 
        let user = await User.findOne({ userId });
        res.json({ success: true, user });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
}

// Sync Clerk Verified User to DB with Master Ledger Auto-Population
export const syncUser = async (req, res) => {
    try {
        const { userId } = req.auth;
        const { name, email, image } = req.body;

        // Extract Roll Number dynamically: "200521014@ietlucknow.ac.in" -> "200521014"
        const rollNumber = email.split('@')[0].toUpperCase();

        // Check if student exists in Master Ledger
        const ledgerRecord = await StudentRecord.findOne({ rollNumber });

        let branch = '';
        if(ledgerRecord) {
            branch = ledgerRecord.branch;
        }

        // Upsert securely saves profile (creates if missing, updates if exists)
        const user = await User.findOneAndUpdate(
            { userId },
            { 
                userId, 
                name, 
                email, 
                image, 
                rollNumber,
                branch
            },
            { new: true, upsert: true }
        );

        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// Student Submits a Doubt
export const submitDoubt = async (req, res) => {
    try {
        const { userId } = req.auth;
        const { query } = req.body;
        
        const user = await User.findOne({ userId });

        const newQuery = new ForumQuery({
            studentId: userId,
            studentName: user ? user.name : "Student User",
            query
        });
        await newQuery.save();
        res.json({ success: true, message: "Query submitted to Coordinator portal!" });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
}

// Get Student's Past Doubts
export const getMyDoubts = async (req, res) => {
    try {
        const { userId } = req.auth;
        const queries = await ForumQuery.find({ studentId: userId }).sort({ createdAt: -1 });
        res.json({ success: true, queries });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
}

// Student Applies to a Job
export const applyForJob = async (req, res) => {
    try {
        const { userId } = req.auth;
        const { jobId, company, jobTitle, location, name, rollNumber, branch, year, resume } = req.body;
        
        // Prevent duplicate applications
        const exists = await Application.findOne({ userId, jobId });
        if (exists) return res.status(400).json({ success: false, message: "Already applied!" });

        const app = new Application({
            userId,
            name: name || "Student User",
            rollNumber, branch, year, company, jobTitle, location, resume,
            date: Date.now(), jobId
        });
        await app.save();

        res.json({ success: true, message: "Application submitted securely!" });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
}

// Get Student's Own Applications
export const getMyApplications = async (req, res) => {
    try {
        const { userId } = req.auth;
        const applications = await Application.find({ userId }).sort({ date: -1 });
        res.json({ success: true, applications });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
}

// Submit No Dues Form
export const submitNoDues = async (req, res) => {
    try {
        const { userId } = req.auth;
        const { name, rollNumber, branch, year, company, package: pkg, letterUrl, type } = req.body;
        
        // Ensure student doesn't have a pending request already (optional but good practice)
        const existing = await NoDuesRequest.findOne({ userId, status: 'Pending' });
        if (existing) {
            return res.status(400).json({ success: false, message: "You already have a pending No Dues request." });
        }

        const newRequest = new NoDuesRequest({
            userId, name, rollNumber, branch, year, company, package: pkg, letterUrl, type, date: Date.now()
        });

        await newRequest.save();
        res.json({ success: true, message: "No Dues Request submitted successfully! Please wait for Coordinator approval." });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
}

// Get No Dues Status
export const getNoDuesStatus = async (req, res) => {
    try {
        const { userId } = req.auth;
        const request = await NoDuesRequest.findOne({ userId }).sort({ date: -1 });
        res.json({ success: true, request });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
}
