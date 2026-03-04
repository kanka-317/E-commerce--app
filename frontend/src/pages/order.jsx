import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import Title from '../components/Title'
import { ShopContext } from '../context/Shopcontext'

const formatOrderDate = (dateValue) => {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateValue))
}

const formatPrice = (value) => {
  const price = Number(value || 0)
  return Number.isInteger(price) ? price : price.toFixed(2)
}

const Order = () => {
  const { currency, backendUrl, token } = useContext(ShopContext)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const loadOrders = async (showLoader = true) => {
    if (!token || !backendUrl) {
      setOrders([])
      setLoading(false)
      return
    }

    if (showLoader) {
      setLoading(true)
    }

    try {
      const response = await axios.post(
        `${backendUrl}/api/order/userorders`,
        {},
        {
          headers: {
            token,
            Authorization: `Bearer ${token}`,
          }
        }
      )

      if (response.data?.success) {
        setOrders(Array.isArray(response.data.orders) ? response.data.orders : [])
      } else {
        toast.error(response.data?.message || 'Failed to load orders')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backendUrl, token])

  return (
    <div className='min-h-[70vh] border-t pt-12'>
      <div className='text-2xl'>
        <Title text1={'MY'} text2={'ORDERS'} />
      </div>

      {!token ? (
        <p className='py-10 text-sm text-gray-500'>Please login to view your orders.</p>
      ) : loading ? (
        <p className='py-10 text-sm text-gray-500'>Loading orders...</p>
      ) : orders.length === 0 ? (
        <p className='py-10 text-sm text-gray-500'>You do not have any orders yet.</p>
      ) : (
        <div className='mt-4 border-t'>
          {orders.map((order) =>
            (Array.isArray(order.items) ? order.items : []).map((item, index) => (
              <div
                key={`${order._id}-${item?.productId || index}`}
                className='grid grid-cols-1 gap-4 border-b py-4 text-sm text-gray-700 md:grid-cols-[2fr_1fr_1fr] md:items-center md:gap-6'
              >
                <div className='flex items-start gap-4'>
                  <img className='w-16 sm:w-20' src={item?.image || ''} alt={item?.name || 'Product'} />

                  <div>
                    <p className='font-medium text-gray-800'>{item?.name || 'Product'}</p>

                    <div className='mt-1 flex flex-wrap items-center gap-x-3 gap-y-1'>
                      <p className='text-base text-gray-900'>
                        {currency}
                        {formatPrice(item?.price)}
                      </p>
                      <p>Quantity: {Number(item?.quantity || 0)}</p>
                      <p>Size: {item?.size || '-'}</p>
                    </div>

                    <p className='mt-1'>Date: {formatOrderDate(order.date)}</p>
                    <p className='mt-1'>Payment: {order.paymentMethod || (order.payment ? 'Done' : 'Pending')}</p>
                  </div>
                </div>

                <div className='flex items-center gap-2'>
                  <span className='h-2.5 w-2.5 rounded-full bg-green-500' />
                  <p className='text-gray-600'>{order.status || 'Order Placed'}</p>
                </div>

                <div className='justify-self-start md:justify-self-end'>
                  <button
                    type='button'
                    onClick={() => loadOrders(false)}
                    className='border px-5 py-2 text-xs font-medium text-gray-700 sm:text-sm'
                  >
                    Track Order
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default Order
