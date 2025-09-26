import { lazy } from 'react'

// Lazy load components for better performance
const Landing = lazy(() => import('@/app/landing/page'))
const Calculator = lazy(() => import('@/app/calculator/page'))
const Mail = lazy(() => import('@/app/mail/page'))
const Tasks = lazy(() => import('@/app/tasks/page'))
const Calendar = lazy(() => import('@/app/calendar/page'))
const Users = lazy(() => import('@/app/users/page'))
const FAQs = lazy(() => import('@/app/faqs/page'))
const Pricing = lazy(() => import('@/app/pricing/page'))

// Error pages
const Unauthorized = lazy(() => import('@/app/errors/unauthorized/page'))
const Forbidden = lazy(() => import('@/app/errors/forbidden/page'))
const NotFound = lazy(() => import('@/app/errors/not-found/page'))
const InternalServerError = lazy(() => import('@/app/errors/internal-server-error/page'))
const UnderMaintenance = lazy(() => import('@/app/errors/under-maintenance/page'))

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

  // Landing Page
  {
    path: "/landing",
    element: <Landing />
  },

  // Application Routes
  {
    path: "/mail",
    element: <Mail />
  },
  {
    path: "/tasks",
    element: <Tasks />
  },
  {
    path: "/calendar",
    element: <Calendar />
  },

  // Content Pages
  {
    path: "/users",
    element: <Users />
  },
  {
    path: "/faqs",
    element: <FAQs />
  },
  {
    path: "/pricing",
    element: <Pricing />
  },
  // Error Pages
  {
    path: "/errors/unauthorized",
    element: <Unauthorized />
  },
  {
    path: "/errors/forbidden",
    element: <Forbidden />
  },
  {
    path: "/errors/not-found",
    element: <NotFound />
  },
  {
    path: "/errors/internal-server-error",
    element: <InternalServerError />
  },
  {
    path: "/errors/under-maintenance",
    element: <UnderMaintenance />
  },
  {
    path: "/calculator",
    element: <Calculator />
  },

  // Catch-all route for 404
  {
    path: "*",
    element: <NotFound />
  }
]
