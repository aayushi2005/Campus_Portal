import mongoose from "mongoose";

const noDuesSchema = new mongoose.Schema({
    userId: { $type: String, required: true },
    name: { $type: String, required: true },
    rollNumber: { $type: String, required: true },
    branch: { $type: String, required: true },
    year: { $type: String, required: true },
    company: { $type: String, required: true },
    package: { $type: String, required: true },
    letterUrl: { $type: String, default: "" },
    type: { $type: String, enum: ['Job', 'Higher Studies'], default: 'Job' },
    status: { $type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    date: { $type: Number, required: true }
}, { typeKey: '$type', timestamps: true });

const NoDuesRequest = mongoose.models.NoDuesRequest || mongoose.model('NoDuesRequest', noDuesSchema);
export default NoDuesRequest;
