"use client"

import { Logo } from "@/components/logo"
import { CalculatorCard } from "./components/calc"

export default function Page() {
  return (
    <div className="bg-muted flex min-h-screen flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-lg flex-col gap-6">
        {/* Logo Header */}
        <a href="/" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex h-9 w-9 items-center justify-center rounded-md">
            <Logo size={24} />
          </div>
          STOCKWISE
        </a>

        {/* Calculator Card */}
        <CalculatorCard />
      </div>
    </div>
  )
}
