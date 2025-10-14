import { ForgotPasswordForm3 } from "./components/forgot-password-form-3"
import { LandingFooter } from "@/app/landing/components/footer"

export default function ForgotPassword3Page() {
  return (
    <div className="flex flex-col min-h-screen w-full bg-[#0B0F19]">
      {/* Konten utama (form di tengah) */}
      {/* <main className="flex-1 flex items-center justify-center"> */}
        <ForgotPasswordForm3 className="w-full h-full" />
      {/* </main> */}

      {/* Footer di bawah */}
      <footer className="border-t border-blue-900/40">
        <LandingFooter />
      </footer>
    </div>
  )
}
