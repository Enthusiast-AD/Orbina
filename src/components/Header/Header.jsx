"use client"

import { useState } from "react"
import { Container, LogoutBtn } from "../index"
import { Link } from "react-router-dom"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { Menu, X, User, Shield } from "lucide-react"
import orbina from "../../assets/orbina.svg"
import Search from "./Search"

const ADMIN_EMAILS = [
  "ansh@orbina.net",
  "admin@orbina.net",
  "enthusiast.ad@gmail.com"
]

function Header() {
  const authStatus = useSelector((state) => state.auth.status)
  const userData = useSelector((state) => state.auth.userData)
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const isAdmin = userData && ADMIN_EMAILS.includes(userData.email?.toLowerCase())

  const navItems = [
    {
      name: "Home",
      slug: "/",
      active: true,
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
    // You could add more nav items here
  ]

  const authItems = [
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
  ]

  return (
    <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50 sticky top-0 z-50">
      <Container>
        <nav className="flex items-center justify-between h-16">
          {/* Left Section - Logo & Navigation */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <img src={orbina} alt="Orbina Logo" height={40} width={40} />
              <div className="text-2xl font-bold text-white">Orbina</div>
            </Link>

            {/* Desktop Navigation */}
            <ul className="hidden md:flex items-center space-x-6">
              {navItems.map((item) =>
                item.active ? (
                  <li key={item.name}>
                    <button
                      onClick={() => navigate(item.slug)}
                      className="text-slate-300 hover:text-white font-medium transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-slate-800/50 cursor-pointer active:bg-slate-800/50"
                    >
                      {item.name}
                    </button>
                  </li>
                ) : null,
              )}
            </ul>
          </div>

          {/* Center Section - Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative">
              <Search />
            </div>
          </div>

          {/* Right Section - Auth & Profile */}
          <div className="flex items-center space-x-4">
            {/* Desktop Auth Section */}
            <div className="hidden md:flex items-center space-x-3">
              {authStatus ? (
                <>
                  <button
                    onClick={() => navigate("/profile")}
                    className="flex items-center space-x-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors duration-200 cursor-pointer active:bg-slate-800/50"
                  >
                    <User className="w-4 h-4 " />
                    <span>Profile</span>
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => navigate("/admin")}
                      className="flex items-center space-x-2 px-3 py-2 text-yellow-300 hover:text-white hover:bg-yellow-600/60 rounded-lg transition-colors duration-200 cursor-pointer font-semibold"
                    >
                      <Shield className="w-4 h-4" />
                      <span>Admin Panel</span>
                    </button>
                  )}
                  <LogoutBtn />
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  {authItems.map((item) =>
                    item.active ? (
                      <button
                        key={item.name}
                        onClick={() => navigate(item.slug)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 cursor-pointer ${
                          item.name === "Signup"
                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                            : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                        }`}
                      >
                        {item.name}
                      </button>
                    ) : null,
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors duration-200"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-700/50 bg-slate-900/95 backdrop-blur-md">
            <div className="px-4 py-4 space-y-4">
              {/* Mobile Search */}
              <div className="relative">
                <Search />
              </div>

              {/* Mobile Navigation */}
              <div className="space-y-2">
                {navItems.map((item) =>
                  item.active ? (
                    <button
                      key={item.name}
                      onClick={() => {
                        navigate(item.slug)
                        setIsMobileMenuOpen(false)
                      }}
                      className="block w-full text-left px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors duration-200"
                    >
                      {item.name}
                    </button>
                  ) : null,
                )}
              </div>

              {/* Mobile Auth Section */}
              <div className="pt-4 border-t border-slate-700/50 space-y-2">
                {authStatus ? (
                  <>
                    <button
                      onClick={() => {
                        navigate("/profile")
                        setIsMobileMenuOpen(false)
                      }}
                      className="flex items-center space-x-2 w-full px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors duration-200"
                    >
                      <User className="w-4 h-4" />
                      <span>Profile</span>
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => {
                          navigate("/admin")
                          setIsMobileMenuOpen(false)
                        }}
                        className="flex items-center space-x-2 w-full px-3 py-2 text-yellow-300 hover:text-white hover:bg-yellow-600/60 rounded-lg transition-colors duration-200 font-semibold"
                      >
                        <Shield className="w-4 h-4" />
                        <span>Admin Panel</span>
                      </button>
                    )}
                    <div className="px-3">
                      <LogoutBtn />
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    {authItems.map((item) =>
                      item.active ? (
                        <button
                          key={item.name}
                          onClick={() => {
                            navigate(item.slug)
                            setIsMobileMenuOpen(false)
                          }}
                          className={`block w-full px-3 py-2 rounded-lg font-medium transition-colors duration-200 ${
                            item.name === "Signup"
                              ? "bg-purple-600 hover:bg-purple-700 text-white text-center"
                              : "text-slate-300 hover:text-white hover:bg-slate-800/50 text-left"
                          }`}
                        >
                          {item.name}
                        </button>
                      ) : null,
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Container>
    </header>
  )
}

export default Header