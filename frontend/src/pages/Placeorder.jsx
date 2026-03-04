import React, { useContext, useMemo, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import { ShopContext } from '../context/Shopcontext'

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })

const Placeorder = () => {
  const navigate = useNavigate()
  const { products, cartItems, currency, delivery_fee, backendUrl, token, getUserCart } = useContext(ShopContext)
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [address, setAddress] = useState({
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zipcode: '',
    country: '',
    phone: '',
  })

  const orderItems = useMemo(() => {
    const items = []

    for (const itemId in cartItems) {
      const productData = products.find((product) => product._id === itemId)
      if (!productData) continue

      for (const size in cartItems[itemId]) {
        const quantity = cartItems[itemId][size]

        if (quantity > 0) {
          items.push({
            productId: itemId,
            name: productData.name,
            price: Number(productData.price),
            quantity: Number(quantity),
            size,
            image: Array.isArray(productData.image) ? productData.image[0] : productData.image,
          })
        }
      }
    }

    return items
  }, [cartItems, products])

  const cartSubtotal = useMemo(
    () => orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [orderItems]
  )

  const shippingFee = delivery_fee
  const totalAmount = cartSubtotal === 0 ? 0 : cartSubtotal + shippingFee

  const paymentOptions = [
    {
      value: 'stripe',
      label: 'Stripe',
      logo: assets.stripe_logo,
      logoAlt: 'Stripe',
    },
    {
      value: 'razorpay',
      label: 'Razorpay',
      logo: assets.razorpay_logo,
      logoAlt: 'Razorpay',
    },
    {
      value: 'cod',
      label: 'CASH ON DELIVERY',
      logo: null,
      logoAlt: '',
    },
  ]

  const inputClassName =
    'w-full rounded-sm border border-gray-300 px-3.5 py-2.5 text-sm text-gray-700 outline-none transition focus:border-gray-500'

  const getAuthConfig = () => ({
    headers: {
      token,
      Authorization: `Bearer ${token}`,
    },
  })

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setAddress((prev) => ({ ...prev, [name]: value }))
  }

  const handlePlaceOrder = async (event) => {
    event.preventDefault()

    if (isSubmitting) return

    if (!token) {
      toast.error('Please login to place an order.')
      navigate('/login')
      return
    }

    if (orderItems.length === 0) {
      toast.error('Your cart is empty.')
      return
    }

    if (!backendUrl) {
      toast.error('Backend URL is missing. Set VITE_BACKEND_URL in frontend .env')
      return
    }

    const orderData = {
      address,
      items: orderItems,
      amount: totalAmount,
    }

    try {
      setIsSubmitting(true)

      if (paymentMethod === 'cod') {
        const response = await axios.post(`${backendUrl}/api/order/place`, orderData, getAuthConfig())
        if (response.data?.success) {
          await getUserCart()
          toast.success('Order placed successfully')
          navigate('/orders')
        } else {
          toast.error(response.data?.message || 'Failed to place COD order')
        }
        return
      }

      if (paymentMethod === 'stripe') {
        const response = await axios.post(`${backendUrl}/api/order/stripe`, orderData, getAuthConfig())
        if (response.data?.success && response.data?.session_url) {
          window.location.replace(response.data.session_url)
          return
        }
        toast.error(response.data?.message || 'Failed to start Stripe checkout')
        return
      }

      if (paymentMethod === 'razorpay') {
        const razorpayLoaded = await loadRazorpayScript()
        if (!razorpayLoaded) {
          toast.error('Razorpay SDK failed to load. Check your internet and try again.')
          return
        }

        const response = await axios.post(`${backendUrl}/api/order/razorpay`, orderData, getAuthConfig())
        if (!response.data?.success) {
          toast.error(response.data?.message || 'Failed to create Razorpay order')
          return
        }

        const razorpayOrder = response.data.order
        const orderId = response.data.orderId
        const razorpayKey = response.data.key

        if (!razorpayOrder?.id || !orderId || !razorpayKey) {
          toast.error('Invalid Razorpay order response from backend')
          return
        }

        const options = {
          key: razorpayKey,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: 'Forever',
          description: 'Order Payment',
          order_id: razorpayOrder.id,
          prefill: {
            name: `${address.firstName} ${address.lastName}`.trim(),
            email: address.email,
            contact: address.phone,
          },
          notes: {
            address: `${address.street}, ${address.city}, ${address.state}, ${address.country}, ${address.zipcode}`,
          },
          handler: async (razorpayResponse) => {
            try {
              const verifyResponse = await axios.post(
                `${backendUrl}/api/order/verifyRazorpay`,
                {
                  orderId,
                  razorpay_order_id: razorpayResponse.razorpay_order_id,
                  razorpay_payment_id: razorpayResponse.razorpay_payment_id,
                  razorpay_signature: razorpayResponse.razorpay_signature,
                },
                getAuthConfig()
              )

              if (verifyResponse.data?.success) {
                await getUserCart()
                toast.success('Payment successful')
                navigate('/orders')
              } else {
                toast.error(verifyResponse.data?.message || 'Payment verification failed')
              }
            } catch (verifyError) {
              toast.error(verifyError.response?.data?.message || 'Unable to verify Razorpay payment')
            }
          },
          modal: {
            ondismiss: () => {
              toast.info('Razorpay payment cancelled')
            },
          },
          theme: {
            color: '#111111',
          },
        }

        const razorpayInstance = new window.Razorpay(options)
        razorpayInstance.open()
      }
    } catch (error) {
      const backendData = error.response?.data
      const errorMessage =
        (typeof backendData === 'string' ? backendData : backendData?.message || backendData?.error?.description) ||
        error.message ||
        'Unable to place order'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handlePlaceOrder} className='min-h-[80vh] border-t pt-14'>
      <div className='flex flex-col gap-14 lg:flex-row lg:items-start lg:gap-20'>
        <div className='w-full max-w-[620px]'>
          <div className='mb-6 text-2xl'>
            <Title text1={'DELIVERY'} text2={'INFORMATION'} />
          </div>

          <div className='flex flex-col gap-4'>
            <div className='flex flex-col gap-4 sm:flex-row'>
              <input
                required
                type='text'
                name='firstName'
                value={address.firstName}
                onChange={handleInputChange}
                className={inputClassName}
                placeholder='First name'
              />
              <input
                required
                type='text'
                name='lastName'
                value={address.lastName}
                onChange={handleInputChange}
                className={inputClassName}
                placeholder='Last name'
              />
            </div>

            <input
              required
              type='email'
              name='email'
              value={address.email}
              onChange={handleInputChange}
              className={inputClassName}
              placeholder='Email address'
            />
            <input
              required
              type='text'
              name='street'
              value={address.street}
              onChange={handleInputChange}
              className={inputClassName}
              placeholder='Street'
            />

            <div className='flex flex-col gap-4 sm:flex-row'>
              <input
                required
                type='text'
                name='city'
                value={address.city}
                onChange={handleInputChange}
                className={inputClassName}
                placeholder='City'
              />
              <input
                required
                type='text'
                name='state'
                value={address.state}
                onChange={handleInputChange}
                className={inputClassName}
                placeholder='State'
              />
            </div>

            <div className='flex flex-col gap-4 sm:flex-row'>
              <input
                required
                type='text'
                name='zipcode'
                value={address.zipcode}
                onChange={handleInputChange}
                className={inputClassName}
                placeholder='Zipcode'
              />
              <input
                required
                type='text'
                name='country'
                value={address.country}
                onChange={handleInputChange}
                className={inputClassName}
                placeholder='Country'
              />
            </div>

            <input
              required
              type='tel'
              name='phone'
              value={address.phone}
              onChange={handleInputChange}
              className={inputClassName}
              placeholder='Phone'
            />
          </div>
        </div>

        <div className='w-full lg:max-w-[470px] lg:ml-auto'>
          <div className='text-2xl'>
            <Title text1={'CART'} text2={'TOTALS'} />
          </div>

          <div className='mt-2 flex flex-col text-sm'>
            <div className='flex justify-between border-b py-2 text-gray-700'>
              <p>Subtotal</p>
              <p className='font-medium'>
                {currency}
                {cartSubtotal.toFixed(2)}
              </p>
            </div>

            <div className='flex justify-between border-b py-2 text-gray-700'>
              <p>Shipping Fee</p>
              <p className='font-medium'>
                {currency}
                {shippingFee.toFixed(2)}
              </p>
            </div>

            <div className='flex justify-between py-2 text-base font-semibold text-gray-900'>
              <p>Total</p>
              <p>
                {currency}
                {totalAmount.toFixed(2)}
              </p>
            </div>
          </div>

          <div className='mt-10'>
            <div className='text-2xl'>
              <Title text1={'PAYMENT'} text2={'METHOD'} />
            </div>

            <div className='mt-2 flex flex-col gap-3 sm:flex-row'>
              {paymentOptions.map((option) => (
                <button
                  key={option.value}
                  type='button'
                  onClick={() => setPaymentMethod(option.value)}
                  className='flex min-h-12 flex-1 items-center gap-3 border border-gray-300 px-4 py-3'
                >
                  <span
                    className={`h-3.5 w-3.5 rounded-full border ${
                      paymentMethod === option.value ? 'border-green-500 bg-green-500' : 'border-gray-300'
                    }`}
                  />
                  {option.logo ? (
                    <img src={option.logo} alt={option.logoAlt} className='h-5 object-contain' />
                  ) : (
                    <p className='text-xs font-medium uppercase tracking-wide text-gray-700'>{option.label}</p>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className='mt-10 flex justify-end'>
            <button
              type='submit'
              disabled={isSubmitting}
              className='w-full bg-black px-14 py-3 text-xs font-medium tracking-wide text-white transition hover:bg-gray-900 sm:w-auto'
            >
              {isSubmitting ? 'PLACING...' : 'PLACE ORDER'}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}

export default Placeorder
