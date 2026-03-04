import React, { useContext } from 'react'
import { ShopContext } from '../context/Shopcontext'
import { Link } from 'react-router-dom'

const ProductItem = ({ id, name, image, price }) => {
  const { currency } = useContext(ShopContext)
  const imageSrc = Array.isArray(image) ? image[0] : image

  return (
    <Link to={`/product/${id}`} className='block text-gray-700'>
      <div className='overflow-hidden bg-gray-100'>
        <img
          src={imageSrc}
          alt={name}
          className='h-64 w-full object-cover transition-transform duration-300 hover:scale-105'
        />
      </div>
      <p className='pt-3 text-sm'>{name}</p>
      <p className='pt-1 text-sm font-medium'>
        {currency}
        {price}
      </p>
    </Link>
  )
}

export default ProductItem
