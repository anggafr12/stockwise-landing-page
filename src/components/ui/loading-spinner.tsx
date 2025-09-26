"use client"

import { cn } from "@/lib/utils"
import { Logo } from "@/components/logo"

interface LoadingSpinnerProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

export function LoadingSpinner({ className, size = "md" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-8 w-8", // spinner lebih besar dari logo
    md: "h-16 w-16",
    lg: "h-24 w-24",
  }

  const logoSize = {
    sm: 16,
    md: 32,
    lg: 48,
  }

  return (
    <div className="relative flex items-center justify-center min-h-[200px]">
      {/* Spinner */}
      <div
        className={cn(
          "animate-spin rounded-full border-b-2 border-primary",
          sizeClasses[size],
          className
        )}
      />
      {/* Logo di tengah */}
      <div className="absolute">
        <Logo size={logoSize[size]} />
      </div>
    </div>
  )
}
