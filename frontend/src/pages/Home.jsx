 
import React from 'react'
import Hero from '../components/Hero'
import Latestcollection from '../components/Latestcollection'
import BestSeller from '../components/Bestseller'
import OurPolicy from '../components/Ourpollicy'

const Home = () => {
  return (
    <div>
      <Hero />
      <Latestcollection />
      <BestSeller />
      <OurPolicy />
    </div>
  )
}

export default Home
