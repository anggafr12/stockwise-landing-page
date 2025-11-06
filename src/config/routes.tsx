// import { LoginCard } from '@/app/login/components/login'
// import UserPage from '@/app/user/page'
import { lazy } from 'react'
import AppShell from '@/layouts/AppShell'

const AdminPage = lazy(() => import('@/app/admin/page'))
// Lazy load components for better performance
const Landing = lazy(() => import('@/app/landing/page'))
const Calculator = lazy(() => import('@/app/calculator/page'))
const Mail = lazy(() => import('@/app/mail/page'))
const LmsMainPage = lazy(() => import('@/app/lms-main/page'))
const CourseDetailPage = lazy(() => import('@/app/lms-main/course/[id]/page'))
const UserPage = lazy(() => import('@/app/user/page'))
const EventPage = lazy(() => import('@/app/eventpage/page'))
const MembershipPage = lazy(() => import('@/app/membership/page'))
const ReferralDashboard = lazy(() => import('@/app/referral/page'))
const ReferralHistory = lazy(() => import('@/app/referral/history/page'))
const ReferralWithdraw = lazy(() => import('@/app/referral/withdraw/page'))
// Error pages
const Unauthorized = lazy(() => import('@/app/errors/unauthorized/page'))
const Forbidden = lazy(() => import('@/app/errors/forbidden/page'))
const NotFound = lazy(() => import('@/app/errors/not-found/page'))
const InternalServerError = lazy(() => import('@/app/errors/internal-server-error/page'))
const UnderMaintenance = lazy(() => import('@/app/errors/under-maintenance/page'))
// Auth pages
const SignIn = lazy(() => import('@/app/auth/sign-in/page'))
const SignIn2 = lazy(() => import('@/app/auth/sign-in-2/page'))
const SignIn3 = lazy(() => import('@/app/auth/sign-in-3/page'))
const SignUp = lazy(() => import('@/app/auth/sign-up/page'))
const SignUp2 = lazy(() => import('@/app/auth/sign-up-2/page'))
const SignUp3 = lazy(() => import('@/app/auth/sign-up-3/page'))
const ForgotPassword = lazy(() => import('@/app/auth/forgot-password/page'))
const ForgotPassword2 = lazy(() => import('@/app/auth/forgot-password-2/page'))
const ForgotPassword3 = lazy(() => import('@/app/auth/forgot-password-3/page'))
const LoginAdminPage = lazy(() => import('@/app/auth/login-admin/page'))
const Verify = lazy(() => import('@/app/auth/verify/page'))
// User pages
// const Profile = lazy(() => import('@/app/user/components/profile'))
// const Membership = lazy(() => import('@/app/user/components/membership'))
// const MyTickets = lazy(() => import('@/app/user/components/myTickets'))
// const Password = lazy(() => import('@/app/user/components/password'))
// const SideMenu = lazy(() => import('@/app/user/components/sideMenu'))

export interface RouteConfig {
  path: string
  element: React.ReactNode
  children?: RouteConfig[]
}

export const routes: RouteConfig[] = [
  // Default route - redirect to dashboard
  {
    path: "/",
    element: <Landing />
  },
  
  //admin
  {
    path: "/admin",
    element: (
      <AdminPage />
    )
  },

  // Landing Page
  {
    path: "/landing",
    element: <Landing />
  },

  // LMS Page
  {
    path: "/lms-main",
    element: (
      <AppShell>
        <LmsMainPage />
      </AppShell>
    )
  },
  {
    path: "/lms-main/course/:id",
    element: (
      <AppShell>
        <CourseDetailPage />
      </AppShell>
    )
  },

  // User Page
  {
    path: "/user",
    element: (
      <AppShell>
        <UserPage />
      </AppShell>
    )
  },
    // Event Page
  {
    path: "/eventpage",
    element: (
      <AppShell>
        <EventPage />
      </AppShell>
    )
  },

    // Member Page
  {
    path: "/membership",
    element: (
      <AppShell>
        <MembershipPage />
      </AppShell>
    )
  },

  // Referral pages
  {
    path: "/referral",
    element: (
      <AppShell>
        <ReferralDashboard />
      </AppShell>
    )
  },
  {
    path: "/referral/history",
    element: (
      <AppShell>
        <ReferralHistory />
      </AppShell>
    )
  },
  {
    path: "/referral/withdraw",
    element: (
      <AppShell>
        <ReferralWithdraw />
      </AppShell>
    )
  },

  // Application Routes
  {
    path: "/mail",
    element: (
      <AppShell>
        <Mail />
      </AppShell>
    )
  },

  // Error Pages
  {
    path: "/errors/unauthorized",
    element: (
      <AppShell>
        <Unauthorized />
      </AppShell>
    )
  },
  {
    path: "/errors/forbidden",
    element: (
      <AppShell>
        <Forbidden />
      </AppShell>
    )
  },
  {
    path: "/errors/not-found",
    element: (
      <AppShell>
        <NotFound />
      </AppShell>
    )
  },
  {
    path: "/errors/internal-server-error",
    element: (
      <AppShell>
        <InternalServerError />
      </AppShell>
    )
  },
  {
    path: "/errors/under-maintenance",
    element: (
      <AppShell>
        <UnderMaintenance />
      </AppShell>
    )
  },
  {
    path: "/calculator",
    element: (
      <AppShell>
        <Calculator />
      </AppShell>
    )
  },

  // Catch-all route for 404
  {
    path: "*",
    element: (
      <AppShell>
        <NotFound />
      </AppShell>
    )
  },

    // Authentication Routes
  {
    path: "/auth/sign-in",
    element: (
      <AppShell>
        <SignIn />
      </AppShell>
    )
  },
  {
    path: "/auth/sign-in-2",
    element: (
      <AppShell>
        <SignIn2 />
      </AppShell>
    )
  },
  {
    path: "/auth/sign-in-3",
    element: (
      <SignIn3 />
    )
  },
  {
    path: "/auth/sign-up",
    element: (
      <AppShell>
        <SignUp />
      </AppShell>
    )
  },
  {
    path: "/auth/sign-up-2",
    element: (
      <AppShell>
        <SignUp2 />
      </AppShell>
    )
  },
  {
    path: "/auth/sign-up-3",
    element: (
      <AppShell>
        <SignUp3 />
      </AppShell>
    )
  },
  {
    path: "/auth/forgot-password",
    element: (
      <AppShell>
        <ForgotPassword />
      </AppShell>
    )
  },
  {
    path: "/auth/forgot-password-2",
    element: (
      <AppShell>
        <ForgotPassword2 />
      </AppShell>
    )
  },
  {
    path: "/auth/forgot-password-3",
    element: (
      <AppShell>
        <ForgotPassword3 />
      </AppShell>
    )
  },
  {
    path: "/auth/login-admin",
    element: (
      <LoginAdminPage />
    )
  },
  {
    path: "/auth/verify",
    element: (
      <AppShell>
        <Verify />
      </AppShell>
    )
  },

]
