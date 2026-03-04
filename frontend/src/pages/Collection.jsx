 
 
/* eslint-disable react-hooks/exhaustive-deps */
 
 
import React, { useContext, useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import Title from '../components/Title'
import { ShopContext } from '../context/Shopcontext'
import ProductItem from '../components/Production'

const Collection = () => {
  const { products, search, showSearch } = useContext(ShopContext);
  const [showFilter, setShowFilter] = useState(false);
  const [filterProducts, setFilterProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [sortType, setSortType] = useState('relevant');

  const toggleCategory = (e) => {
    const { value } = e.target;
    setCategory((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  }

  const toggleSubCategory = (e) => {
    const { value } = e.target;
    setSubCategory((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  }

  const applyFilterAndSort = () => {
    let productsCopy = products.slice();
    if (showSearch && search) {
      productsCopy = productsCopy.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );

    }

    if (category.length > 0) {
      productsCopy = productsCopy.filter((item) => category.includes(item.category));
    }

    if (subCategory.length > 0) {
      productsCopy = productsCopy.filter((item) => subCategory.includes(item.subCategory));
    }

    switch (sortType) {
      case "low-high":
        productsCopy.sort((a, b) => a.price - b.price);
        break;
      case "high-low":
        productsCopy.sort((a, b) => b.price - a.price);
        break;
      default:
        break;
    }

    setFilterProducts(productsCopy);
  };

  useEffect(() => {
    applyFilterAndSort();
  }, [products, category, subCategory, sortType, search, showSearch]);

  return (
    <div className='flex flex-col gap-8 pt-10 sm:flex-row sm:gap-10'>

      {/* Filter Options */}
      <div className='w-full sm:w-60 sm:flex-none'>

        <p
          onClick={() => setShowFilter((prev) => !prev)}
          className='my-2 flex cursor-pointer items-center gap-2 text-xl sm:cursor-default'
        >
          FILTERS
          <img
            src={assets.dropdown_icon}
            className={`h-3 transition-transform sm:hidden ${showFilter ? 'rotate-90' : ''}`}
            alt='Toggle filters'
          />
        </p>

        {/* Category Filter */}
        <div className={`mt-6 border border-gray-300 py-3 pl-5 ${showFilter ? '' : 'hidden'} sm:block`}>
          
          <p className='mb-3 text-sm font-medium'>CATEGORIES</p>

          <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>

            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={'Men'} onChange={toggleCategory} /> Men
            </p>

            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={'Women'} onChange={toggleCategory} /> Women
            </p>

            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={'Kids'} onChange={toggleCategory} /> Kids
            </p>

          </div>

        </div>

        {/* Type Filter */}
        <div className={`my-5 border border-gray-300 py-3 pl-5 ${showFilter ? '' : 'hidden'} sm:block`}>
          <p className='mb-3 text-sm font-medium'>TYPE</p>

          <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            <p className='flex gap-2'>
              <input className='w-3' type='checkbox' value={'Topwear'} onChange={toggleSubCategory} /> Topwear
            </p>

            <p className='flex gap-2'>
              <input className='w-3' type='checkbox' value={'Bottomwear'} onChange={toggleSubCategory}  /> Bottomwear
            </p>
    
            <p className='flex gap-2'>
              <input className='w-3' type='checkbox' value={'Winterwear'} onChange={toggleSubCategory} /> Winterwear
            </p>
          </div>
        </div>

      </div>

     {/* Right Side */}
<div className='flex-1'>

  <div className='mb-6 flex items-center justify-between gap-4'>
    
    <Title text1={'ALL'} text2={'COLLECTIONS'} className='mb-0 text-base sm:text-2xl' />

    {/* Product Sort */}
    <select onChange={(e)=>setSortType(e.target.value)} className='h-10 border border-gray-300 px-3 text-sm text-gray-700'>
      <option value="relevant">Sort by: Relevant</option>
      <option value="low-high">Sort by: Low to High</option>
      <option value="high-low">Sort by: High to Low</option>
    </select>

  </div>

<div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6'> 

{
  filterProducts.map((item)=>(
    <ProductItem key={item._id} name={item.name} id={item._id} price={item.price} image={item.image} />
  ))
}
</div>
</div>
     
    </div>
  )
}

export default Collection
