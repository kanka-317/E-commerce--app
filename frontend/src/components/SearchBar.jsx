/* eslint-disable react-hooks/exhaustive-deps */
 
 
import React, { useContext, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { ShopContext } from '../context/Shopcontext'
import { assets } from '../assets/assets'

const SearchBar = () => {

  const { search, setSearch, showSearch, setShowSearch } = useContext(ShopContext);
  const location = useLocation();
  useEffect(() => {
   if(location.pathname.includes('collection')&& !showSearch){
    setShowSearch(true);
   }
   
   else{
    setShowSearch(false);
   }
},[location])

  return showSearch ? (
    <div className='border-y border-gray-200 bg-gray-50'>
      <div className='mx-auto my-5 flex w-full max-w-5xl items-center justify-center gap-3 px-4'>
        <div className='flex w-full max-w-[560px] items-center rounded-full border border-gray-400 bg-transparent px-5 py-2'>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='flex-1 bg-inherit text-sm outline-none'
            type='text'
            placeholder='Search'
          />
          <img className='w-4' src={assets.search_icon} alt='Search icon' />
        </div>
        <img
          onClick={() => setShowSearch(false)}
          className='w-3 cursor-pointer'
          src={assets.cross_icon}
          alt='Close search'
        />
      </div>
    </div>
  ) : null

}

export default SearchBar
