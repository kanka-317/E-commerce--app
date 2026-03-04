 
 
import React, { useContext, useState } from 'react'
import { assets } from '../assets/assets'
import { Link, NavLink } from 'react-router-dom'
import { ShopContext } from '../context/Shopcontext'

const navItems = [
  { label: 'Home', path: '/', end: true },
  { label: 'Collection', path: '/collection' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' },
]

const Navbar = () => {
  const [visible, setVisible] = useState(false)
  const { setShowSearch, getCartCount, token, setToken, navigate } = useContext(ShopContext)

  const logout = () => {
    setToken('')
    navigate('/login')
  }

  return (
    <header className='relative grid grid-cols-[1fr_auto_1fr] items-center py-6 font-medium'>
      <div className='justify-self-start'>
       <Link to='/'>
         <img src={assets.logo} className='w-36 shrink-0' alt='Forever logo' />
       </Link>
      </div>

      <nav className='hidden justify-self-center sm:block'>
        <ul className='flex items-center gap-8 text-[13px] text-gray-700'>
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.end}
                className='flex flex-col items-center gap-1 uppercase tracking-wide'
              >
                <p>{item.label}</p>
                <hr className='hidden h-[1.5px] w-2/4 border-none bg-gray-700' />
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className='flex items-center justify-self-end gap-6 text-gray-700'>
        <img onClick={()=>setShowSearch(true)} src={assets.search_icon} className='w-5 cursor-pointer' alt='Search' />

        <div className='group relative'>
          {!token ? (
            <Link to='/login'>
              <img className='w-5 cursor-pointer' src={assets.profile_icon} alt='Profile' />
            </Link>
          ) : (
            <img className='w-5 cursor-pointer' src={assets.profile_icon} alt='Profile' />
          )}

          {token && (
            <div className='absolute right-0 top-6 z-20 hidden pt-4 group-hover:block'>
              <div className='flex w-32 flex-col gap-2 rounded bg-slate-100 px-4 py-3 text-gray-500'>
                <p className='cursor-pointer hover:text-black'>My Profile</p>
                <p onClick={() => navigate('/orders')} className='cursor-pointer hover:text-black'>Orders</p>
                <p onClick={logout} className='cursor-pointer hover:text-black'>Logout</p>
              </div>
            </div>
          )}
        </div>

        <Link to='/cart' className='relative'>
          <img className='w-5 cursor-pointer' src={assets.cart_icon} alt='Cart' />
          <div className='absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white'>
            {getCartCount()}
          </div>
        </Link>

        <button
          type='button'
          onClick={() => setVisible(true)}
          className='justify-self-end sm:hidden'
          aria-label='Open menu'
        >
          <img src={assets.menu_icon} className='w-5 cursor-pointer' alt='Menu' />
        </button>
      </div>

      <div
        className={`fixed inset-0 z-30 bg-white transition-transform duration-300 sm:hidden ${
          visible ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className='flex h-full flex-col text-gray-700'>
          <button
            onClick={() => setVisible(false)}
            className='flex items-center gap-4 border-b border-gray-200 p-3 text-left'
            type='button'
          >
            <img className='h-4 rotate-180' src={assets.dropdown_icon} alt='Back' />
            <p>Back</p>
          </button>

          {navItems.map((item) => (
            <NavLink
              key={`mobile-${item.path}`}
              to={item.path}
              end={item.end}
              onClick={() => setVisible(false)}
              className='border-b border-gray-200 px-6 py-3 text-sm uppercase tracking-wide'
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>
    </header>
  )
}

export default Navbar
