import React from 'react'

const NewsletterBox = () => {

  const onSubmitHandler = (event) => {
    event.preventDefault();
  }

  return (
    <div className='text-center mt-6'>
      <p className='text-2xl md:text-3xl font-medium text-gray-800'>
        Subscribe now & get 20% off
      </p>

      <p className='text-gray-400 mt-3 text-sm md:text-base'>
        Lorem Ipsum is simply dummy text of the printing and typesetting industry.
      </p>

      <form
        onSubmit={onSubmitHandler}
        className='w-full sm:w-2/3 md:w-1/2 flex items-center mx-auto mt-7 border border-gray-200'
      >
        
        <input
          className='w-full flex-1 outline-none px-4 py-3 text-sm'
          type='email'
          placeholder='Enter your email'
          required
        />

        <button
          type='submit'
          className='bg-black text-white text-xs px-10 md:px-12 py-4 tracking-wide'
        >
          SUBSCRIBE
        </button>

      </form>
    </div>
  )
}

export default NewsletterBox
