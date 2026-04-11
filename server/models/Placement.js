import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
    name: { type: String, required: true },
    rollNumber: { type: String, required: true },
    branch: { type: String, required: true },
    year: { type: String, required: true },
    company: { type: String, required: true },
    package: { type: String, required: true },
    letterUrl: { type: String, default: "" },
    type: { type: String, enum: ['Job', 'Higher Studies'], default: 'Job' },
    date: { type: Number, required: true }
});

const Placement = mongoose.model('Placement', fileSchema);
export default Placement;
