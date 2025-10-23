"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, Zap } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav 
      className="fixed top-0 w-full backdrop-blur-md border-b border-neutral-200 z-50"
      style={{ backgroundColor: 'rgba(248, 245, 242, 0.8)' }}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl sm:text-2xl">
            <span 
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(90deg, #f5855f 0%, #960047 50%, #953599 100%)' }}
            >
              RYZE
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            <Link href="#features" className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">
              How It Works
            </Link>
            <Link href="#faq" className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">
              FAQ
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/home">
                <Button 
                  size="sm" 
                  className="text-white hover:opacity-90 text-sm px-4 py-2"
                  style={{ backgroundColor: '#953599' }}
                >
                  Get Started
                </Button>
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 -mr-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5 sm:h-6 sm:w-6 text-neutral-600" />
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-3 border-t border-neutral-200">
            <Link 
              href="#features" 
              className="block text-sm font-medium text-neutral-600 hover:text-neutral-900 py-3 px-2 rounded-lg hover:bg-neutral-50 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link 
              href="#how-it-works" 
              className="block text-sm font-medium text-neutral-600 hover:text-neutral-900 py-3 px-2 rounded-lg hover:bg-neutral-50 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              How It Works
            </Link>
            <Link 
              href="#faq" 
              className="block text-sm font-medium text-neutral-600 hover:text-neutral-900 py-3 px-2 rounded-lg hover:bg-neutral-50 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              FAQ
            </Link>
            <div className="flex flex-col gap-2 pt-4 border-t border-neutral-200">
              <Link href="/home" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                <Button 
                  size="sm" 
                  className="w-full text-white hover:opacity-90 text-sm py-3"
                  style={{ backgroundColor: '#953599' }}
                >
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

