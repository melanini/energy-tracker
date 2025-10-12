import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function Hero() {
  return (
    <section className="relative h-[90vh] overflow-hidden">
      {/* Full Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="/assets/hero-header.png"
          alt="Hero background"
          fill
          className="object-cover object-top"
          priority
          style={{ objectPosition: '50% 20%' }}
        />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center -mt-20">
          {/* Badge */}
          <div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8 backdrop-blur-sm"
            style={{ backgroundColor: 'rgba(245, 229, 224, 0.9)', color: '#953599' }}
          >
            <Sparkles className="h-4 w-4" />
            Discover Your Energy Patterns
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 flex flex-col gap-4">
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
          <p className="text-lg text-neutral-900 leading-relaxed max-w-2xl mx-auto mb-8">
            Track your daily inputs, uncover patterns, to help you understand 
            what drain you and what gives your energy a boost.
          </p>

          {/* CTA Button */}
          <div className="flex justify-center">
            <Link href="/home">
              <Button 
                size="lg" 
                className="text-white shadow-lg hover:shadow-xl hover:opacity-90 transition-all px-8 py-6 text-lg"
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

