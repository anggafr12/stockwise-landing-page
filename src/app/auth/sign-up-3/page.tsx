import { SignupForm3 } from "./components/signup-form-3"
import { LandingFooter } from "@/app/landing/components/footer"

export default function SignUp3Page() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Area utama full lebar & tinggi */}
      <div className="flex flex-1 items-center justify-center w-full h-full">
        {/* <div className="w-full h-full flex items-center justify-center px-8 py-10"> */}
          <SignupForm3 className="w-full h-full max-w-none" />
        {/* </div> */}
      </div>

      {/* Footer */}
      <LandingFooter />
    </div>
  )
}
