import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Full Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="/assets/hero-img.png"
          alt="Hero background"
          fill
          className="object-cover object-top"
          priority
          style={{ objectPosition: '50% 20%' }}
        />
      </div>

      {/* Content */}
      <div className="relative min-h-screen flex flex-col items-center justify-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
          {/* Badge */}
          <div 
            className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 rounded-full text-xs sm:text-sm font-medium mb-6 sm:mb-8 backdrop-blur-sm"
            style={{ backgroundColor: 'rgba(245, 229, 224, 0.9)', color: '#953599' }}
          >
            <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Discover Your Energy Patterns</span>
            <span className="xs:hidden">Energy Tracking</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 flex flex-col gap-2 sm:gap-4">
            <span className="text-neutral-900">Optimize Your</span>
            <span>
              <span 
                className="bg-clip-text text-transparent"
                style={{ 
                  backgroundImage: 'linear-gradient(90deg, #FF6B6B 0%, #953599 50%, #953599 100%)'
                }}
              >
                Physical & Cognitive
              </span>
              {" "}
              <span className="text-neutral-900">Energy</span>
            </span>
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg text-neutral-900 leading-relaxed max-w-2xl mx-auto mb-6 sm:mb-8 px-4">
            Track your daily inputs, uncover patterns, to help you understand 
            what drain you and what gives your energy a boost.
          </p>

          {/* CTA Button */}
          <div className="flex justify-center px-4">
            <Link href="/home">
              <Button 
                size="lg" 
                className="text-white shadow-lg hover:shadow-xl hover:opacity-90 transition-all px-6 py-4 sm:px-8 sm:py-6 text-base sm:text-lg w-full max-w-xs sm:w-auto"
                style={{ backgroundColor: '#953599' }}
              >
                Start tracking for free
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

