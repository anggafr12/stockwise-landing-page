"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/logo"

export function LoginForm3({ className, ...props }: React.ComponentProps<"div">) {
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
      <header className="absolute top-0 left-0 w-full flex justify-between items-center px-10 py-6">
        <div className="flex items-center gap-2">
          <Logo size={36} />
          <span className="text-2xl font-semibold tracking-wide">STOCKWISE</span>
        </div>
        <Button className="bg-gradient-to-r from-blue-500 to-blue-700 hover:opacity-90 px-6 py-2 text-base font-medium">
          Join Now
        </Button>
      </header>

      {/* Login Section (lebih besar & lebar) */}
      <main className="w-full max-w-3xl bg-[#0F1624]/90 backdrop-blur-md rounded-3xl p-16 shadow-2xl border border-blue-900/40 transition-all hover:scale-[1.01] duration-300 mt-20 mb-10">
        <h1 className="text-center text-5xl font-bold mb-10">Login</h1>

        <form className="space-y-8">
          {/* Email */}
          <div className="space-y-3">
            <Label htmlFor="email" className="text-gray-300 text-lg">
              Email or username
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="bg-[#0B1320] border border-blue-800 text-white text-lg placeholder-gray-500 focus:ring-2 focus:ring-blue-600 py-6 px-4"
              required
            />
          </div>

          {/* Password */}
          <div className="space-y-3">
            <Label htmlFor="password" className="text-gray-300 text-lg">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="bg-[#0B1320] border border-blue-800 text-white text-lg placeholder-gray-500 focus:ring-2 focus:ring-blue-600 py-6 px-4"
              required
            />
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between text-base text-gray-400 mt-3">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="accent-blue-600 scale-110" />
              Remember Me
            </label>
            <a href="/auth/forgot-password-3" className="hover:text-blue-400">
              Forgot Password?
            </a>
          </div>

          {/* Login button */}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-blue-700 font-semibold text-2xl py-6 hover:opacity-90 mt-4"
          >
            LOG IN
          </Button>

          {/* Register link */}
          <p className="text-center text-gray-400 text-lg mt-8">
            Don’t have an account yet?{" "}
            <a href="/auth/sign-up-3" className="text-blue-400 hover:underline">
              Register Now
            </a>
          </p>
        </form>
      </main>
    </div>
  )
}
