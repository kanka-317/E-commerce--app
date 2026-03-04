import React from 'react'
import { assets } from '../assets/assets'
import Title from '../components/Title'

const Contact = () => {
  return (
    <div>
      <div className='border-t pb-2 pt-8 text-center text-2xl'>
        <Title text1='CONTACT' text2='US' />
      </div>

      <div className='my-10 mb-28 flex flex-col justify-center gap-10 md:flex-row'>
        <img className='w-full md:max-w-[480px]' src={assets.contact_img} alt='Contact desk setup' />

        <div className='flex flex-col items-start justify-center gap-6 text-gray-600'>
          <p className='text-2xl font-semibold'>Our Store</p>

          <p>
            54709 Willms Station
            <br />
            Suite 350, Washington, USA
          </p>

          <p>
            Tel: (415) 555-0132
            <br />
            Email: admin@forever.com
          </p>

          <p className='text-2xl font-semibold'>Careers at Forever</p>
          <p>Learn more about our teams and job openings.</p>

          <button
            type='button'
            className='border border-black px-8 py-4 text-sm text-black transition-all duration-500 hover:bg-black hover:text-white'
          >
            Explore Jobs
          </button>
        </div>
      </div>
    </div>
  )
}

export default Contact
