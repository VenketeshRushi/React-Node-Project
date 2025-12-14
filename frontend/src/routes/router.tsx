import { Suspense, lazy } from "react";
import { createBrowserRouter } from "react-router-dom";

import PublicRoute from "@/routes/PublicRoute";
import PrivateRoute from "@/routes/PrivateRoute";
import RoleGuard from "@/routes/RoleGuard";

import PrivateLayout from "@/layouts/PrivateLayout";
import PublicLayout from "@/layouts/PublicLayout";

import { Spinner } from "@/components/ui/spinner";

const NotFound = lazy(() => import("@/pages/NotFound"));
const Login = lazy(() => import("@/pages/Login"));
const OAuthCallback = lazy(() => import("@/pages/OAuthCallback"));
const Home = lazy(() => import("@/pages/Home"));
const About = lazy(() => import("@/pages/About"));
const Contact = lazy(() => import("@/pages/Contact"));
const Faq = lazy(() => import("@/pages/Faq"));

const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Onboarding = lazy(() => import("@/pages/Onboarding"));

const FullPageLoader = (
  <div className='flex items-center justify-center w-screen h-screen'>
    <Spinner />
  </div>
);

const router = createBrowserRouter([
  {
    path: "/",
    children: [
      /* ========== PUBLIC ROUTES ========== */
      {
        element: (
          <Suspense fallback={FullPageLoader}>
            <PublicRoute />
          </Suspense>
        ),
        children: [
          {
            element: <PublicLayout />,
            children: [
              { index: true, element: <Home /> },
              { path: "login", element: <Login /> },
              { path: "/auth/callback", element: <OAuthCallback /> },
              { path: "about", element: <About /> },
              { path: "contact", element: <Contact /> },
              { path: "faq", element: <Faq /> },
            ],
          },
        ],
      },

      /* ========== PROTECTED ROUTES (USER) ========== */
      {
        element: (
          <Suspense fallback={FullPageLoader}>
            <PrivateRoute />
          </Suspense>
        ),
        children: [
          {
            element: (
              <RoleGuard allowedRoles={["user", "admin"]}>
                <PrivateLayout />
              </RoleGuard>
            ),
            children: [
              { path: "dashboard", element: <Dashboard /> },
              { path: "onboarding", element: <Onboarding /> },
            ],
          },
        ],
      },

      /* ========== ADMIN ROUTES ========== */
      // {
      //   element: (
      //     <Suspense fallback={FullPageLoader}>
      //       <PrivateRoute />
      //     </Suspense>
      //   ),
      //   children: [
      //     {
      //       element: (
      //         <RoleGuard allowedRoles={["admin"]}>
      //           <AdminLayout />
      //         </RoleGuard>
      //       ),
      //       children: [
      //         { path: "admin/dashboard", element: <AdminDashboard /> },
      //       ],
      //     },
      //   ],
      // },

      /* ========== 404 NOT FOUND ========== */
      {
        path: "*",
        element: (
          <Suspense fallback={FullPageLoader}>
            <NotFound />
          </Suspense>
        ),
      },
    ],
  },
]);

export default router;
