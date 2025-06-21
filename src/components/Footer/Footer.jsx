import {Link} from "react-router-dom"
// import { Building2 } from "lucide-react"

export default function Footer() {
  return (
    <footer className="relative bg-slate-900 text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
      <div className="relative z-10">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            {/* Logo and Description */}
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-2 mb-6">
                {/* <Building2 className="h-8 w-8 text-blue-400" /> */}
                <span className="text-2xl font-bold text-white">Blogger</span>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                Building beautiful, accessible, and performant user interfaces for the modern web.
              </p>
              <p className="text-xs text-slate-400">© {new Date().getFullYear()} Blogger. All rights reserved.</p>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">Company</h3>
              <ul className="space-y-4">
                <li>
                  <Link
                    href="/features"
                    className="text-slate-300 hover:text-white transition-colors duration-200 text-sm"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="text-slate-300 hover:text-white transition-colors duration-200 text-sm"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/affiliate"
                    className="text-slate-300 hover:text-white transition-colors duration-200 text-sm"
                  >
                    Affiliate Program
                  </Link>
                </li>
                <li>
                  <Link
                    href="/press"
                    className="text-slate-300 hover:text-white transition-colors duration-200 text-sm"
                  >
                    Press Kit
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">Support</h3>
              <ul className="space-y-4">
                <li>
                  <Link
                    href="/account"
                    className="text-slate-300 hover:text-white transition-colors duration-200 text-sm"
                  >
                    Account
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="text-slate-300 hover:text-white transition-colors duration-200 text-sm">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-slate-300 hover:text-white transition-colors duration-200 text-sm"
                  >
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/support"
                    className="text-slate-300 hover:text-white transition-colors duration-200 text-sm"
                  >
                    Customer Support
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">Legal</h3>
              <ul className="space-y-4">
                <li>
                  <Link
                    href="/terms"
                    className="text-slate-300 hover:text-white transition-colors duration-200 text-sm"
                  >
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-slate-300 hover:text-white transition-colors duration-200 text-sm"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/licensing"
                    className="text-slate-300 hover:text-white transition-colors duration-200 text-sm"
                  >
                    Licensing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cookies"
                    className="text-slate-300 hover:text-white transition-colors duration-200 text-sm"
                  >
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Border */}
        <div className="border-t border-slate-700">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
              <div className="flex space-x-6">
                <Link
                  href="/sitemap"
                  className="text-xs text-slate-400 hover:text-slate-300 transition-colors duration-200"
                >
                  Sitemap
                </Link>
                <Link
                  href="/accessibility"
                  className="text-xs text-slate-400 hover:text-slate-300 transition-colors duration-200"
                >
                  Accessibility
                </Link>
                <Link
                  href="/status"
                  className="text-xs text-slate-400 hover:text-slate-300 transition-colors duration-200"
                >
                  Status
                </Link>
              </div>
              <p className="text-xs text-slate-400">Made with ❤️ for developers worldwide</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
