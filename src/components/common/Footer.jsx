import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo/Course_logo.png';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaYoutube } from 'react-icons/fa';
import { IoLocationSharp, IoCall, IoMail, IoLogoWhatsapp } from "react-icons/io5";
import { MdOutlineSupportAgent } from "react-icons/md";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Gradient Top Border */}
      <div className="h-1 bg-gradient-to-r from-cyan-500 to-blue-600"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Newsletter Section */}
        <div className="px-6 py-12 border-b border-gray-800 flex flex-col lg:flex-row justify-between items-center gap-8 bg-gray-800/50 rounded-xl my-8">
          <div className="text-center lg:text-left">
            <h3 className="text-2xl font-bold text-white mb-2">Join Our Learning Community</h3>
            <p className="text-gray-400 max-w-md">
              Subscribe to get exclusive course updates, learning resources, and special offers.
            </p>
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); e.target.reset() }}
            className="flex flex-col sm:flex-row gap-3 w-full max-w-md"
          >
            <input
              type="email"
              placeholder="Your email address"
              required
              className="flex-grow px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-gray-700 text-white placeholder-gray-400"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg font-medium text-white transition-all duration-300"
            >
              Subscribe
            </button>
          </form>
        </div>
        {/* Main Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 py-12">
          {/* Column 1: Brand Info */}
          <div className="space-y-6">
            <div className="flex items-center">
              <img src={logo} alt="Stride Logo" className="w-12 h-12 mr-3" />
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
                Stride
              </span>
            </div>
            <p className="text-gray-400">
              Empowering learners worldwide with high-quality, accessible education for all skill levels.
            </p>

            <div className="flex items-center space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800 hover:bg-blue-600 rounded-full transition-colors">
                <FaFacebookF className="text-lg text-gray-300 hover:text-white" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800 hover:bg-blue-400 rounded-full transition-colors">
                <FaTwitter className="text-lg text-gray-300 hover:text-white" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800 hover:bg-pink-600 rounded-full transition-colors">
                <FaInstagram className="text-lg text-gray-300 hover:text-white" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800 hover:bg-blue-700 rounded-full transition-colors">
                <FaLinkedinIn className="text-lg text-gray-300 hover:text-white" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800 hover:bg-red-600 rounded-full transition-colors">
                <FaYoutube className="text-lg text-gray-300 hover:text-white" />
              </a>
            </div>
          </div>

          {/* Column 2: Explore Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 border-b border-gray-700 pb-2">Explore</h3>
            <ul className="space-y-3">
              <li><Link to="/" className="text-gray-400 hover:text-cyan-400 transition-colors">Home</Link></li>
              <li><Link to="/instructors" className="text-gray-400 hover:text-cyan-400 transition-colors">Instructors</Link></li>
              <li><Link to="/blog" className="text-gray-400 hover:text-cyan-400 transition-colors">Blog</Link></li>
              <li><Link to="/events" className="text-gray-400 hover:text-cyan-400 transition-colors">Events</Link></li>
            </ul>
          </div>

          {/* Column 3: Courses Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 border-b border-gray-700 pb-2">Courses</h3>
            <ul className="space-y-3">
              <li><Link to="/courses" className="text-gray-400 hover:text-cyan-400 transition-colors">All Courses</Link></li>
              <li><Link to="/add-course" className="text-gray-400 hover:text-cyan-400 transition-colors">Add Course</Link></li>
              <li><Link to="/manage-courses" className="text-gray-400 hover:text-cyan-400 transition-colors">Manage Courses</Link></li>
              <li><Link to="/my-courses" className="text-gray-400 hover:text-cyan-400 transition-colors">My Enrolled Courses</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 border-b border-gray-700 pb-2">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <IoLocationSharp className="text-cyan-400 mt-1 mr-3 flex-shrink-0" />
                <span className="text-gray-400">
                  610 cairo-street, sidi besh, alexandria
                </span>
              </li>
              <li className="flex items-center">
                <IoCall className="text-cyan-400 mr-3" />
                <a href="tel:+201121193709" className="text-gray-400 hover:text-cyan-400 transition-colors">
                  +20 1121193709
                </a>
              </li>
              <li className="flex items-center">
                <IoMail className="text-cyan-400 mr-3" />
                <a href="mailto:support@stride.com" className="text-gray-400 hover:text-cyan-400 transition-colors">
                  support@stride.com
                </a>
              </li>
              <li className="flex items-center">
                <MdOutlineSupportAgent className="text-cyan-400 mr-3" />
                <span className="text-gray-400">24/7 Support Center</span>
              </li>
              <li className="flex items-center">
                <IoLogoWhatsapp className="text-cyan-400 mr-3" />
                <a href="https://wa.me/8801234567890" className="text-gray-400 hover:text-cyan-400 transition-colors">
                  Chat on WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright Bar */}
        <div className="border-t border-gray-800 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} Stride. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link to="/privacy-policy" className="text-gray-500 hover:text-purple-400 text-sm transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="text-gray-500 hover:text-purple-400 text-sm transition-colors">Terms</Link>
              <Link to="/sitemap" className="text-gray-500 hover:text-purple-400 text-sm transition-colors">Sitemap</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;