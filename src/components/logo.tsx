import * as React from "react"

interface LogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  size?: number
}

export function Logo({ size = 40, className, ...props }: LogoProps) {
  return (
    <img
      src="/favicon-dark.png"
      alt="Stockwise Logo"
      width={size}
      height={size}
      className={className}
      {...props}
    />
  )
}
