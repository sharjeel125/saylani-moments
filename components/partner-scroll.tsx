"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import { partnerImages } from "../data/image"

type Partner = {
  id: number;
  src: any; // Using 'any' for static image imports
  alt: string;
};

export function PartnerScroll() {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scrollContainer = scrollRef.current
    if (!scrollContainer) return

    let animationId: number
    let scrollPosition = 0

    const scroll = () => {
      if (!scrollContainer) return

      scrollPosition += 0.5
      if (scrollPosition >= scrollContainer.scrollWidth / 2) {
        scrollPosition = 0
      }

      scrollContainer.scrollLeft = scrollPosition
      animationId = requestAnimationFrame(scroll)
    }

    animationId = requestAnimationFrame(scroll)

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <div className="w-full overflow-hidden">
      <div ref={scrollRef} className="flex items-center gap-8 py-4 overflow-x-hidden whitespace-nowrap">
        {/* Display original partners */}
        {partnerImages.map((partner) => (
          <div key={partner.id} className="flex-shrink-0">
            <div className="relative h-12 w-36">
              <Image 
                src={partner.src}
                alt={partner.alt}
                fill
                className="object-contain"
              />
            </div>
          </div>
        ))}
        
        {/* Optional: Duplicate for seamless looping */}
        {partnerImages.map((partner) => (
          <div key={`duplicate-${partner.id}`} className="flex-shrink-0">
            <div className="relative h-12 w-36">
              <Image 
                src={partner.src}
                alt={`${partner.alt} (copy)`}
                fill
                className="object-contain"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}