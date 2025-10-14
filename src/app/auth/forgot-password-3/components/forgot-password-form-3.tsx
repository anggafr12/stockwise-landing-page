"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/logo"

export function ForgotPasswordForm3({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center min-h-screen bg-[#0B0F19] text-white p-8 bg-cover bg-left bg-no-repeat",
        className
      )}
      style={{
        backgroundImage: "url('/vector.png')",
      }}
      {...props}
    >
      {/* Header */}
      <header className="absolute top-0 left-0 w-full flex justify-between items-center px-8 py-6">
        <div className="flex items-center gap-2">
          <Logo size={32} />
          <span className="text-xl font-semibold tracking-wide">STOCKWISE</span>
        </div>
        <Button className="bg-gradient-to-r from-blue-500 to-blue-700 hover:opacity-90 px-5 py-2 text-sm font-medium">
          Join Now
        </Button>
      </header>

      {/* Main Form (Center vertically and horizontally) */}
      <main className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-md sm:max-w-lg bg-[#0F1624]/90 backdrop-blur-md rounded-2xl p-8 sm:p-10 shadow-2xl border border-blue-900/40">
          <div className="flex flex-col items-center text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">Forgot Password?</h1>
            <p className="text-gray-400 text-base sm:text-lg max-w-md">
              Enter your registered email address and we’ll send you a link to reset your password.
            </p>
          </div>

          <form className="space-y-6 w-full">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300 text-base sm:text-lg">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="bg-[#0B1320] border border-blue-800 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-600 py-4 px-4 text-base sm:text-lg"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-blue-700 font-semibold text-lg sm:text-xl py-4 sm:py-5 hover:opacity-90 mt-2"
            >
              Send Reset Link
            </Button>

            <p className="text-center text-gray-400 text-base mt-6">
              Remember your password?{" "}
              <a href="/auth/sign-in-3" className="text-blue-400 hover:underline">
                Back to Sign In
              </a>
            </p>
          </form>
        </div>
      </main>

      {/* Footer Agreement */}
      <footer className="text-gray-500 text-sm text-center py-4">
        By clicking continue, you agree to our{" "}
        <a href="#" className="text-blue-400 hover:underline">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="text-blue-400 hover:underline">
          Privacy Policy
        </a>
        .
      </footer>
    </div>
  )
}
