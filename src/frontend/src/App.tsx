import { createRouter, RouterProvider, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import AppLayout from './components/AppLayout';
import ComplaintBoardPage from './pages/ComplaintBoardPage';
import SubmitComplaintPage from './pages/SubmitComplaintPage';
import ComplaintDetailPage from './pages/ComplaintDetailPage';
import SolutionsUpdatesPage from './pages/SolutionsUpdatesPage';
import AdminLandingPage from './pages/admin/AdminLandingPage';
import AdminComplaintsPage from './pages/admin/AdminComplaintsPage';
import AdminSolutionsPage from './pages/admin/AdminSolutionsPage';
import AdminAccessControlPage from './pages/admin/AdminAccessControlPage';
import WhoAmIPage from './pages/WhoAmIPage';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';

const rootRoute = createRootRoute({
  component: () => (
    <AppLayout>
      <Outlet />
    </AppLayout>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: ComplaintBoardPage,
});

const submitRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/submit',
  component: SubmitComplaintPage,
});

const complaintDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/complaint/$complaintId',
  component: ComplaintDetailPage,
});

const solutionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/solutions',
  component: SolutionsUpdatesPage,
});

const whoamiRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/api/whoami',
  component: WhoAmIPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminLandingPage,
});

const adminComplaintsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/complaints',
  component: AdminComplaintsPage,
});

const adminSolutionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/solutions',
  component: AdminSolutionsPage,
});

const adminAccessControlRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/access-control',
  component: AdminAccessControlPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  submitRoute,
  complaintDetailRoute,
  solutionsRoute,
  whoamiRoute,
  adminRoute,
  adminComplaintsRoute,
  adminSolutionsRoute,
  adminAccessControlRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
