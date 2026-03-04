/* eslint-disable react-hooks/set-state-in-effect */
import React, { useContext, useEffect, useMemo, useState } from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import Title from '../components/Title'
import { ShopContext } from '../context/Shopcontext'

const Cart = () => {
  const navigate = useNavigate()
  const { products, currency, delivery_fee, cartItems, updateCartQuantity, removeFromCart } = useContext(ShopContext)
  const [cartData, setCartData] = useState([])

  useEffect(() => {
    const tempData = []

    for (const itemId in cartItems) {
      for (const size in cartItems[itemId]) {
        const quantity = cartItems[itemId][size]

        if (quantity > 0) {
          tempData.push({
            _id: itemId,
            size,
            quantity,
          })
        }
      }
    }

    setCartData(tempData)
  }, [cartItems])

  const cartSubtotal = useMemo(() => {
    return cartData.reduce((total, item) => {
      const productData = products.find((product) => product._id === item._id)
      if (!productData) return total
      return total + productData.price * item.quantity
    }, 0)
  }, [cartData, products])

  const shippingFee = cartData.length > 0 ? delivery_fee : 0
  const cartTotal = cartSubtotal + shippingFee

  return (
    <div className='border-t pt-14'>
      <div className='mb-3 text-2xl'>
        <Title text1={'YOUR'} text2={'CART'} />
      </div>

      <div>
        {cartData.length === 0 ? (
          <p className='py-6 text-gray-500'>Your cart is empty.</p>
        ) : (
          cartData.map((item) => {
            const productData = products.find((product) => product._id === item._id)

            if (!productData) return null

            return (
              <div
                key={`${item._id}-${item.size}`}
                className='grid grid-cols-[3fr_1.4fr_1fr_auto] items-center gap-4 border-y py-4 text-sm text-gray-700 md:text-base'
              >
                <div className='flex items-start gap-6'>
                  <img className='w-16 sm:w-20' src={productData.image[0]} alt={productData.name} />

                  <div>
                    <p className='font-medium'>{productData.name}</p>

                    <div className='mt-2 flex items-center gap-3'>
                      <p>
                        {currency}
                        {productData.price}
                      </p>

                      <p className='border bg-slate-50 px-2 sm:px-3 sm:py-1'>{item.size}</p>
                    </div>
                  </div>
                </div>

                <div className='flex w-fit items-center border border-gray-300'>
                  <button
                    type='button'
                    onClick={() => updateCartQuantity(item._id, item.size, item.quantity - 1)}
                    className='px-3 py-1 text-lg leading-none hover:bg-gray-100'
                    aria-label='Decrease quantity'
                  >
                    -
                  </button>
                  <p className='min-w-8 text-center'>{item.quantity}</p>
                  <button
                    type='button'
                    onClick={() => updateCartQuantity(item._id, item.size, item.quantity + 1)}
                    className='px-3 py-1 text-lg leading-none hover:bg-gray-100'
                    aria-label='Increase quantity'
                  >
                    +
                  </button>
                </div>

                <p>
                  {currency}
                  {item.quantity * productData.price}
                </p>

                <button
                  type='button'
                  onClick={() => removeFromCart(item._id, item.size)}
                  className='w-5 justify-self-center'
                  aria-label='Remove item'
                >
                  <img src={assets.bin_icon} alt='Delete' />
                </button>
              </div>
            )
          })
        )}
      </div>

      <div className='my-20 flex justify-end'>
        <div className='w-full sm:w-[450px]'>
          <div className='text-2xl'>
            <Title text1={'CART'} text2={'TOTALS'} />
          </div>

          <div className='mt-2 flex flex-col text-sm'>
            <div className='flex justify-between border-b py-2'>
              <p>Subtotal</p>
              <p>
                {currency}
                {cartSubtotal.toFixed(2)}
              </p>
            </div>

            <div className='flex justify-between border-b py-2'>
              <p>Shipping Fee</p>
              <p>
                {currency}
                {shippingFee.toFixed(2)}
              </p>
            </div>

            <div className='flex justify-between py-2 font-semibold'>
              <p>Total</p>
              <p>
                {currency}
                {cartTotal.toFixed(2)}
              </p>
            </div>
          </div>

          <div className='mt-8 flex justify-end'>
            <button
              type='button'
              onClick={() => navigate('/place-order')}
              className='bg-black px-8 py-3 text-xs text-white sm:px-12'
            >
              PROCEED TO CHECKOUT
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
