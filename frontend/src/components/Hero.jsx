import React from 'react'
import { assets } from '../assets/assets'

const Hero = () => {
  return (
    <section className='border border-gray-300'>
      <div className='flex flex-col md:flex-row'>
        <div className='flex w-full items-center bg-[#f8f8f8] px-8 py-14 sm:px-12 md:w-1/2 md:px-16 lg:px-24'>
          <div className='text-[#414141]'>
            <div className='mb-5 flex items-center gap-3'>
              <p className='h-0.5 w-10 bg-[#414141] md:w-12'></p>
              <p className='text-xs font-medium tracking-wide sm:text-sm'>OUR BESTSELLERS</p>
            </div>

            <h1 className='prata-regular text-4xl leading-tight sm:text-5xl lg:text-6xl'>Latest Arrivals</h1>

            <div className='mt-5 flex items-center gap-3'>
              <p className='text-xs font-semibold tracking-wide sm:text-sm'>SHOP NOW</p>
              <p className='h-0.5 w-10 bg-[#414141] md:w-12'></p>
            </div>
          </div>
        </div>

        <div className='w-full md:w-1/2'>
          <img className='h-full w-full object-cover' src={assets.hero_img} alt='Latest arrivals' />
        </div>
      </div>
    </section>
  )
}

export default Hero
