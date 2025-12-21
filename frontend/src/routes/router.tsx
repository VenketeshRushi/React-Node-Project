import { Suspense, lazy } from "react";
import { createBrowserRouter } from "react-router-dom";

import PublicRoute from "@/routes/PublicRoute";
import PrivateRoute from "@/routes/PrivateRoute";
// import RoleGuard from "@/routes/RoleGuard";

import PrivateLayout from "@/layouts/PrivateLayout";
import PublicLayout from "@/layouts/PublicLayout";

import { Spinner } from "@/components/ui/spinner";

// Public Pages
const NotFound = lazy(() => import("@/pages/NotFound"));
const Login = lazy(() => import("@/pages/Login"));
const OAuthCallback = lazy(() => import("@/pages/OAuthCallback"));
const Home = lazy(() => import("@/pages/Home"));
const About = lazy(() => import("@/pages/About"));
const Contact = lazy(() => import("@/pages/Contact"));
const Faq = lazy(() => import("@/pages/Faq"));

const Onboarding = lazy(() => import("@/pages/Onboarding"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));

// Admin Pages
// const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
// const AdminUsers = lazy(() => import("@/pages/admin/Users"));

const FullPageLoader = (
  <div className='flex items-center justify-center w-screen h-screen'>
    <Spinner />
  </div>
);

const router = createBrowserRouter([
  {
    path: "/",
    errorElement: (
      <Suspense fallback={FullPageLoader}>
        <NotFound />
      </Suspense>
    ),
    children: [
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
              {
                index: true,
                element: <Home />,
              },
              {
                path: "login",
                element: (
                  <Suspense fallback={FullPageLoader}>
                    <Login />
                  </Suspense>
                ),
              },
              {
                path: "auth/callback",
                element: (
                  <Suspense fallback={FullPageLoader}>
                    <OAuthCallback />
                  </Suspense>
                ),
              },
              {
                path: "about",
                element: (
                  <Suspense fallback={FullPageLoader}>
                    <About />
                  </Suspense>
                ),
              },
              {
                path: "contact",
                element: (
                  <Suspense fallback={FullPageLoader}>
                    <Contact />
                  </Suspense>
                ),
              },
              {
                path: "faq",
                element: (
                  <Suspense fallback={FullPageLoader}>
                    <Faq />
                  </Suspense>
                ),
              },
            ],
          },
        ],
      },

      {
        element: (
          <Suspense fallback={FullPageLoader}>
            <PrivateRoute />
          </Suspense>
        ),
        children: [
          {
            path: "onboarding",
            element: (
              <Suspense fallback={FullPageLoader}>
                <Onboarding />
              </Suspense>
            ),
          },

          {
            element: <PrivateLayout />,
            children: [
              {
                path: "dashboard",
                element: (
                  <Suspense fallback={FullPageLoader}>
                    <Dashboard />
                  </Suspense>
                ),
              },
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
      //       path: "admin",
      //       element: (
      //         <RoleGuard allowedRoles={["admin", "superadmin"]}>
      //           <AdminLayout />
      //         </RoleGuard>
      //       ),
      //       children: [
      //         {
      //           index: true,
      //           element: <Navigate to="/admin/dashboard" replace />,
      //         },
      //         {
      //           path: "dashboard",
      //           element: (
      //             <Suspense fallback={FullPageLoader}>
      //               <AdminDashboard />
      //             </Suspense>
      //           ),
      //         },
      //         {
      //           path: "users",
      //           element: (
      //             <Suspense fallback={FullPageLoader}>
      //               <AdminUsers />
      //             </Suspense>
      //           ),
      //         },
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
