import React from 'react'
import { assets } from '../assets/assets'

const OurPolicy = () => {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-3 gap-12 sm:gap-6 text-center py-20'>

      <div>
        <img src={assets.exchange_icon} className='w-12 mx-auto mb-5' alt='Exchange policy icon' />
        <p className='text-base font-semibold'>Easy Exchange Policy</p>
        <p className='text-sm text-gray-500'>We offer hassle free exchange policy</p>
      </div>

      <div>
        <img src={assets.quality_icon} className='w-12 mx-auto mb-5' alt='Return policy icon' />
        <p className='text-base font-semibold'>7 Days Return Policy</p>
        <p className='text-sm text-gray-500'>We provide 7 days free return policy</p>
      </div>

      <div>
        <img src={assets.support_img} className='w-12 mx-auto mb-5' alt='Customer support icon' />
        <p className='text-base font-semibold'>Best customer support</p>
        <p className='text-sm text-gray-500'>We provide 24/7 customer support</p>
      </div>

    </div>
  )
}

export default OurPolicy
