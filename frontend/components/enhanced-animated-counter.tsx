"use client"

import { useEffect, useState, useRef } from "react"

interface EnhancedAnimatedCounterProps {
  end: number
  duration?: number
  suffix?: string
  prefix?: string
  decimals?: number
  enableGlow?: boolean
  enableParticles?: boolean
  className?: string
}

export function EnhancedAnimatedCounter({
  end,
  duration = 2000,
  suffix = "",
  prefix = "",
  decimals = 0,
  enableGlow = false,
  enableParticles = false,
  className = ""
}: EnhancedAnimatedCounterProps) {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [particles, setParticles] = useState<Array<{ id: number, x: number, y: number, opacity: number }>>([])
  const counterRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (counterRef.current) {
      observer.observe(counterRef.current)
    }

    return () => observer.disconnect()
  }, [isVisible])

  useEffect(() => {
    if (!isVisible) return

    let startTime: number
    let animationFrame: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)

      // Enhanced easing function for more dynamic animation
      const easeOutElastic = (t: number): number => {
        const c4 = (2 * Math.PI) / 3
        return t === 0
          ? 0
          : t === 1
            ? 1
            : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1
      }

      const easedProgress = progress < 0.8
        ? easeOutElastic(progress / 0.8) * 0.8
        : 0.8 + (progress - 0.8) * 5 // Final smooth approach

      setCount(end * Math.min(easedProgress, 1))

      // Generate particles during animation
      if (enableParticles && progress < 1 && Math.random() < 0.3) {
        const newParticle = {
          id: Date.now() + Math.random(),
          x: Math.random() * 100 - 50,
          y: Math.random() * 50 - 25,
          opacity: 1
        }
        setParticles(prev => [...prev.slice(-10), newParticle])
      }

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [end, duration, isVisible, enableParticles])

  // Update particles
  useEffect(() => {
    if (!enableParticles) return

    const interval = setInterval(() => {
      setParticles(prev =>
        prev.map(p => ({
          ...p,
          y: p.y - 2,
          opacity: p.opacity - 0.05
        })).filter(p => p.opacity > 0)
      )
    }, 50)

    return () => clearInterval(interval)
  }, [enableParticles])

  const formatNumber = (num: number) => {
    const rounded = decimals > 0 ? num.toFixed(decimals) : Math.floor(num)
    return Number(rounded).toLocaleString()
  }

  return (
    <span
      ref={counterRef}
      className={`relative inline-block ${enableGlow ? 'animate-text-glow' : ''} ${className}`}
    >
      {enableParticles && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute w-1 h-1 bg-blue-400 rounded-full"
              style={{
                left: `calc(50% + ${particle.x}px)`,
                top: `calc(50% + ${particle.y}px)`,
                opacity: particle.opacity,
                transform: 'translate(-50%, -50%)'
              }}
            />
          ))}
        </div>
      )}

      <span className={enableGlow ? 'text-shadow-glow' : ''}>
        {prefix}{formatNumber(count)}{suffix}
      </span>
    </span>
  )
}