import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import "./LandingPage.css";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white via-sky-50 to-blue-100">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-10 py-5 bg-white/80 backdrop-blur-md shadow-sm fixed top-0 left-0 right-0 z-50">
        <h1 className="text-2xl font-extrabold tracking-tight text-[#0284C7]">
          Campus<span className="text-[#0EA5E9]">Connect</span>
        </h1>
        <div className="flex gap-8 text-md font-semibold text-gray-800">
          <a href="#about" className="hover:text-[#0284C7] transition-colors">
            About Us
          </a>
          <a href="#contact" className="hover:text-[#0284C7] transition-colors">
            Contact Us
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col items-center justify-center text-center flex-grow mt-32 px-6"
      >
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4 animated-wave-text">
          Welcome to CampusConnect
        </h1>

        {/* Underline accent */}
        <div className="w-40 h-1 bg-gradient-to-r from-sky-400 to-blue-500 rounded-full mb-6"></div>

        <p className="text-gray-600 text-lg md:text-xl max-w-2xl">
          Empowering campus life through innovation, connection, and seamless
          digital experiences.
        </p>

        <Link
          to="/login"
          className="mt-10 bg-gradient-to-r from-sky-500 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold text-lg shadow-md hover:from-sky-600 hover:to-blue-700 transition-all hover:scale-105"
        >
          Get Started
        </Link>
      </motion.div>

      {/* Footer */}
      <footer
        id="contact"
        className="py-4 text-center text-gray-500 text-sm border-t border-gray-200"
      >
        © 2025 CampusConnect · Built by{" "}
        <span className="text-sky-600 font-semibold">Team Maverick Minds</span>
      </footer>
    </div>
  );
}
