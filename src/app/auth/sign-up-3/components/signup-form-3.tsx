"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/logo"
import { useNavigate } from "react-router-dom"

export function SignupForm3({ className, ...props }: React.ComponentProps<"div">) {
  const [formData, setFormData] = useState({
    username: "",
    fullname: "",
    email: "",
    password: "",
    confirmPassword: "",
    referral: "",
  })

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    if (formData.password !== formData.confirmPassword) {
      setMessage("❌ Passwords do not match")
      setLoading(false)
      return
    }

    try {
      const res = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          name: formData.fullname,
          email: formData.email,
          password: formData.password,
          referred_by: formData.referral || null,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      setMessage("✅ Registration successful!")
      localStorage.setItem("pendingEmail", formData.email);
      navigate("/auth/verify", { state: { email: formData.email } });
      
    } catch (err: any) {
      setMessage(`❌ ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center w-screen min-h-screen bg-[#0B0F19] text-white overflow-x-hidden overflow-y-auto",
        className
      )}
      style={{
        backgroundImage: "url('/vector.png')",
        backgroundSize: "100% 100%",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
      {...props}
    >

      {/* Header */}
      <header className="absolute top-0 left-0 w-full flex justify-between items-center px-10 py-6 z-10">
        <div className="flex items-center gap-2">
          <Logo size={36} />
          <span className="text-2xl font-semibold tracking-wide">STOCKWISE</span>
        </div>
        <Button className="bg-gradient-to-r from-blue-500 to-blue-700 hover:opacity-90 px-6 py-2 text-base font-medium">
          Join!
        </Button>
      </header>

      {/* Signup Section */}
      <main className="w-full max-w-5xl bg-[#0F1624]/90 backdrop-blur-md rounded-3xl p-12 md:p-20 shadow-2xl border border-blue-900/40 transition-all hover:scale-[1.01] duration-300 my-24 mx-4">
        <h1 className="text-center text-5xl font-bold mb-10">Sign Up</h1>

        <form className="space-y-8" onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="space-y-3">
            <Label htmlFor="username" className="text-gray-300 text-lg">
              Username
            </Label>
            <Input
              id="username"
              type="text"
              placeholder="johndoe"
              value={formData.username}
              onChange={handleChange}
              className="bg-[#0B1320] border border-blue-800 text-white text-lg placeholder-gray-500 focus:ring-2 focus:ring-blue-600 py-6 px-4"
              required
            />
          </div>

          {/* Full Name */}
          <div className="space-y-3">
            <Label htmlFor="fullname" className="text-gray-300 text-lg">
              Full Name
            </Label>
            <Input
              id="fullname"
              type="text"
              placeholder="John Doe"
              value={formData.fullname}
              onChange={handleChange}
              className="bg-[#0B1320] border border-blue-800 text-white text-lg placeholder-gray-500 focus:ring-2 focus:ring-blue-600 py-6 px-4"
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-3">
            <Label htmlFor="email" className="text-gray-300 text-lg">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
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
              value={formData.password}
              onChange={handleChange}
              className="bg-[#0B1320] border border-blue-800 text-white text-lg placeholder-gray-500 focus:ring-2 focus:ring-blue-600 py-6 px-4"
              required
            />
          </div>

          {/* Confirm Password */}
          <div className="space-y-3">
            <Label htmlFor="confirmPassword" className="text-gray-300 text-lg">
              Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="bg-[#0B1320] border border-blue-800 text-white text-lg placeholder-gray-500 focus:ring-2 focus:ring-blue-600 py-6 px-4"
              required
            />
          </div>

          {/* Referral Code */}
          <div className="space-y-3">
            <Label htmlFor="referral" className="text-gray-300 text-lg">
              Referral Code (Optional)
            </Label>
            <Input
              id="referral"
              type="text"
              placeholder="REF123"
              value={formData.referral}
              onChange={handleChange}
              className="bg-[#0B1320] border border-blue-800 text-white text-lg placeholder-gray-500 focus:ring-2 focus:ring-blue-600 py-6 px-4"
            />
          </div>

          {/* Status Message */}
          {message && (
            <p
              className={`text-center text-lg ${
                message.includes("✅") ? "text-green-400" : "text-red-400"
              }`}
            >
              {message}
            </p>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-700 font-semibold text-2xl py-6 hover:opacity-90 mt-4"
          >
            {loading ? "Processing..." : "CREATE ACCOUNT"}
          </Button>

          {/* Already have account */}
          <p className="text-center text-gray-400 text-lg mt-8">
            Already have an account?{" "}
            <a href="/auth/sign-in-3" className="text-blue-400 hover:underline">
              Log In
            </a>
          </p>
        </form>
      </main>
    </div>
  )
}
