import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    image: { type: String, required: true },
    rollNumber: { type: String, default: "" },
    branch: { type: String, default: "" },
    phone: { type: String, default: "" },
    degree: { type: String, default: "B.Tech" },
    passingYear: { type: String, default: "" },
    isBlacklisted: { type: Boolean, default: false },
    blacklistReason: { type: String, default: "" }
}, { timestamps: true });

const User = mongoose.model('User', fileSchema);
export default User;
