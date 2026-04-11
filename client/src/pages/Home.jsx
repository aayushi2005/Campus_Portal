import React from 'react'
import Navbar from '../components/Navbar'
import NoticeBanner from '../components/NoticeBanner'
import Hero from '../components/Hero'
import JobListing from '../components/JobListing'
import AppDownload from '../components/AppDownload'
import Footer from '../components/Footer' 

const Home = () => {
  return (
    <div>
      <NoticeBanner />
      <Navbar />
      <Hero/>
      <JobListing/>
      <AppDownload/>
      <Footer/>
    </div>
  )
}

export default Home
