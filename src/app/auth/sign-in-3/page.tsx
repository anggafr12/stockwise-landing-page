import { LoginForm3 } from "./components/login-form-3"
import { LandingFooter } from "@/app/landing/components/footer"

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0B0F19]">
      {/* <main className="flex flex-1 items-center justify-center"> */}
        <LoginForm3 />
      {/* </main> */}
      <footer className="w-full mt-auto">
        <LandingFooter />
      </footer>
    </div>
  )
}
