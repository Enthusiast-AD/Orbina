import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  Github, 
  Twitter, 
  Linkedin, 
  Instagram,
  BookOpen,
  MessageCircle,
  Users,
  Shield,
  FileText,
  HelpCircle,
  ArrowUp,
  Star,
  Zap
} from 'lucide-react';

function Footer() {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-900 border-t border-slate-800 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/5 to-blue-900/5"></div>
      <div className="absolute top-0 left-1/4 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl"></div>
      <div className="absolute bottom-0 right-1/4 w-24 h-24 bg-blue-500/5 rounded-full blur-xl"></div>
      
      <div className="relative z-10">
        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">Blogger</span>
              </div>
              <p className="text-slate-400 mb-6 leading-relaxed">
                Empowering writers to share their stories, connect with readers, 
                and build a vibrant community around great content.
              </p>
              
              {/* Social Links */}
              <div className="flex items-center gap-3">
                <a 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-slate-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 group"
                >
                  <Twitter className="w-5 h-5 text-slate-400 group-hover:text-white" />
                </a>
                <a 
                  href="https://github.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-slate-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 group"
                >
                  <Github className="w-5 h-5 text-slate-400 group-hover:text-white" />
                </a>
                <a 
                  href="https://linkedin.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-slate-800 hover:bg-blue-700 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 group"
                >
                  <Linkedin className="w-5 h-5 text-slate-400 group-hover:text-white" />
                </a>
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-slate-800 hover:bg-pink-600 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 group"
                >
                  <Instagram className="w-5 h-5 text-slate-400 group-hover:text-white" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-400" />
                Quick Links
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link 
                    to="/" 
                    className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    Home
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/all-posts" 
                    className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    All Stories
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/add-post" 
                    className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    Write Story
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/messages" 
                    className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    Messages
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/profile" 
                    className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    Profile
                  </Link>
                </li>
              </ul>
            </div>

            {/* Community */}
            <div>
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                Community
              </h3>
              <ul className="space-y-3">
                <li>
                  <a 
                    href="#" 
                    className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    Featured Writers
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    Writing Guidelines
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    Community Rules
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    Events & Contests
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    Discord Community
                  </a>
                </li>
              </ul>
            </div>

            {/* Support & Legal */}
            <div>
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-green-400" />
                Support & Legal
              </h3>
              <ul className="space-y-3 mb-6">
                <li>
                  <a 
                    href="#" 
                    className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    Help Center
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    Contact Us
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    Cookie Policy
                  </a>
                </li>
              </ul>

              {/* Contact Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-400">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">hello@blogger.com</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Globe className="w-4 h-4" />
                  <span className="text-sm">Available Worldwide</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-12 ">
            

            {/* Newsletter Signup */}
            <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-xl p-6 mb-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-center md:text-left">
                  <h3 className="text-white font-semibold mb-1 flex items-center gap-2 justify-center md:justify-start">
                    <Star className="w-5 h-5 text-yellow-400" />
                    Stay Updated
                  </h3>
                  <p className="text-slate-400 text-sm">
                    Get the latest stories and writing tips delivered to your inbox.
                  </p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <input
                    type="email"
                    placeholder="Enter your email..."
                    className="flex-1 md:w-64 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <button className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-colors whitespace-nowrap">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 bg-slate-950/50">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-slate-400 text-sm">
                <span>© {currentYear} Blogger. All rights reserved.</span>
                <div className="flex items-center gap-1">
                  <span>Made with</span>
                  <Heart className="w-4 h-4 text-red-500 animate-pulse" />
                  <span>by developers</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span>Secure & Private</span>
                </div>
                
                <button
                  onClick={scrollToTop}
                  className="w-10 h-10 bg-slate-800 hover:bg-purple-600 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 group"
                  title="Back to top"
                >
                  <ArrowUp className="w-5 h-5 text-slate-400 group-hover:text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;