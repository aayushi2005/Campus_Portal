import React from 'react'
import { motion } from 'framer-motion'
import { assets } from '../assets/assets'

const students = [
  {
    name: "Aditi Kesarwani",
    company: "Amazon",
    package: "50 LPA",
    image: assets.user_img,
  },
  {
    name: "Kinjal Gupta",
    company: "Hummingwave",
    package: "13 LPA",
    image: assets.user_img,
  },
  {
    name: "Deepali Sayana",
    company: "BEL",
    package: "12.5 LPA",
    image: assets.user_img,
  },
  {
    name: "Khushi Rawat",
    company: "HUL",
    package: "11 LPA",
    image: assets.user_img,
  }

]

const AppDownload = () => {
  return (
    <div className="px-4 2xl:px-20 my-24 lg:my-32 relative">

      {/* Background Decorative elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-blue-400 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob"></div>
      <div className="absolute top-10 right-10 w-32 h-32 bg-indigo-400 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-2000"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="glass-panel rounded-3xl p-10 md:p-14 text-gray-900 border border-gray-100 shadow-[0_20px_50px_rgb(0,0,0,0.05)] relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-tr from-blue-50/50 to-indigo-50/50 -z-10"></div>

        {/* Heading */}
        <div className="text-center mb-12 relative z-10">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
            Top <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Placements</span> 🎓
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto font-medium">
            Celebrating our exceptional students who secured elite offers from industry-leading organizations.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">

          {students.map((student, index) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              key={index}
              className="bg-white/80 backdrop-blur-md border border-gray-200/50 rounded-3xl p-6 text-center 
              hover-lift shadow-sm hover:shadow-xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
              </div>

              {/* Profile */}
              <div className="relative inline-block mb-5">
                <div className="absolute inset-0 bg-blue-100 rounded-full scale-110 -z-10 group-hover:bg-blue-200 transition-colors"></div>
                <img
                  src={student.image}
                  alt={student.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-sm"
                />
              </div>

              {/* Name */}
              <h3 className="font-bold text-xl text-gray-900">
                {student.name}
              </h3>

              {/* Company */}
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100/80 rounded-full text-sm font-medium text-gray-600">
                {student.company}
              </div>

              {/* 💰 Package */}
              <div className="mt-6 pt-5 border-t border-gray-100">
                <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-indigo-600">
                  {student.package}
                </p>
                <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mt-1">
                  Annual Package
                </p>
              </div>

            </motion.div>
          ))}

        </div>
      </motion.div>
    </div>
  )
}

export default AppDownload