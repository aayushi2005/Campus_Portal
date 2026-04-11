import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Paperclip } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth, useUser } from '@clerk/react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';

const ApplicationFormModal = ({ isOpen, onClose, job }) => {
  const { getToken } = useAuth();
  const { user } = useUser();
  const { backendUrl } = useContext(AppContext);

  const [formData, setFormData] = useState({
    rollNumber: '',
    branch: '',
    year: '',
    gpa: '',
    coverLetter: '',
    resumeLink: '',
    agreed: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.agreed) {
      toast.error('You must agree to the terms.');
      return;
    }
    
    // Resume Link Validation
    if (!formData.resumeLink.startsWith('http://') && !formData.resumeLink.startsWith('https://')) {
      toast.error('Please enter a valid URL starting with http:// or https://');
      return;
    }
    
    try {
        const token = await getToken();
        if (!token) return toast.error("Please login to apply");
        
        const { data } = await axios.post(`${backendUrl}/api/student/apply`, {
            jobId: job._id,
            company: job.company || job.companyId?.name || "General Company",
            jobTitle: job.title,
            location: job.location,
            name: user?.fullName || "Student",
            rollNumber: formData.rollNumber,
            branch: formData.branch,
            year: formData.year,
            resume: formData.resumeLink
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (data.success) {
            toast.success('Your application has been submitted successfully! 🎉');
            onClose();
        }
    } catch (error) {
        toast.error(error.response?.data?.message || error.message);
    }
  };

  if (!isOpen || !job) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="glass-panel w-full max-w-lg rounded-2xl shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto mt-4 mb-4"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white/80 backdrop-blur-md p-6 border-b border-gray-100 flex items-start justify-between z-20">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Apply for Role</h2>
              <p className="text-sm text-gray-500 mt-1">{job.title} at {job.companyId?.name}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number *</label>
                <input 
                  type="text" 
                  name="rollNumber"
                  required
                  value={formData.rollNumber}
                  onChange={handleChange}
                  placeholder="e.g. 210430001"
                  className="glass-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current GPA *</label>
                <input 
                  type="number" 
                  name="gpa"
                  step="0.01"
                  min="0"
                  max="10"
                  required
                  value={formData.gpa}
                  onChange={handleChange}
                  placeholder="e.g. 8.5"
                  className="glass-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Branch *</label>
                <select 
                  name="branch"
                  required
                  value={formData.branch}
                  onChange={handleChange}
                  className="glass-input"
                >
                  <option value="" disabled>Select Branch</option>
                  <option value="CSE">CSE</option>
                  <option value="IT">IT</option>
                  <option value="ECE">ECE</option>
                  <option value="EE">EE</option>
                  <option value="ME">ME</option>
                  <option value="CE">CE</option>
                  <option value="CHE">CHE</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Passing Year *</label>
                <select 
                  name="year"
                  required
                  value={formData.year}
                  onChange={handleChange}
                  className="glass-input"
                >
                  <option value="" disabled>Select Year</option>
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                  <option value="2028">2028</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio or Resume Link *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Paperclip size={16} className="text-gray-400" />
                </div>
                <input 
                  type="url" 
                  name="resumeLink"
                  required
                  value={formData.resumeLink}
                  onChange={handleChange}
                  placeholder="https://drive.google.com/..."
                  className="glass-input pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cover Letter *</label>
              <textarea 
                name="coverLetter"
                required
                rows={3}
                value={formData.coverLetter}
                onChange={handleChange}
                placeholder="Briefly pitch yourself for this role..."
                className="glass-input resize-none"
              />
            </div>

            <div className="flex items-start gap-2 pt-2">
              <input 
                type="checkbox" 
                name="agreed"
                id="agreed"
                checked={formData.agreed}
                onChange={handleChange}
                className="mt-1 w-4 h-4 text-indigo-600 rounded border-gray-300 cursor-pointer"
              />
              <label htmlFor="agreed" className="text-sm text-gray-600 leading-tight cursor-pointer">
                I verify that the information provided is accurate and matches my academic records.
              </label>
            </div>

            <div className="pt-4 flex justify-end gap-3 sticky bottom-0 bg-white/80 backdrop-blur-md p-2 -mx-6 -mb-6 border-t border-gray-100">
              <button type="button" onClick={onClose} className="btn-secondary py-2 px-5 text-sm">Cancel</button>
              <button type="submit" className="btn-primary flex items-center gap-2 py-2 px-6 text-sm">
                <Send size={16} /> Submit
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ApplicationFormModal;
