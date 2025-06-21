import React from 'react'
import { Container, Logo, LogoutBtn } from '../index'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Search from './Search'

function Header() {
  const authStatus = useSelector((state) => state.auth.status)
  const navigate = useNavigate()

  const navItems = [
    {
      name: 'Home',
      slug: "/",
      active: true
    },
    {
      name: "Login",
      slug: "/login",
      active: !authStatus,
    },
    {
      name: "Signup",
      slug: "/signup",
      active: !authStatus,
    },
    {
      name: "All Posts",
      slug: "/all-posts",
      active: authStatus,
    },
    {
      name: "Add Post",
      slug: "/add-post",
      active: authStatus,
    },
  ]


  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 transition-colors duration-300">
      <Container>
        <nav className='flex items-center justify-between h-16'>
          <div className='flex items-center space-x-8'>
            <div className='flex items-center space-x-2'>
              <Link to='/'>
                <Logo />
              </Link>
            </div>
            <ul className='hidden md:flex space-x-6'>
              {navItems.map((item) =>
                item.active ? (
                  <li key={item.name}>
                    <button
                      onClick={() => navigate(item.slug)}
                      className='text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium transition-colors cursor-pointer'
                    >{item.name}</button>
                  </li>
                ) : null
              )}
            </ul>
          </div>
          <div className='flex items-center space-x-4'>
            <Search />
            <div className='flex items-center space-x-2'>
            {authStatus && (
              <LogoutBtn />
            )}
            </div>
          </div>
        </nav>
      </Container>
    </header>
  )
}

export default Header