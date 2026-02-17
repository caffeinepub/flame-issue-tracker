import { createRouter, RouterProvider, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import AppLayout from './components/AppLayout';
import ComplaintBoardPage from './pages/ComplaintBoardPage';
import SubmitComplaintPage from './pages/SubmitComplaintPage';
import ComplaintDetailPage from './pages/ComplaintDetailPage';
import SolutionsUpdatesPage from './pages/SolutionsUpdatesPage';
import AdminComplaintsPage from './pages/admin/AdminComplaintsPage';
import AdminSolutionsPage from './pages/admin/AdminSolutionsPage';
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

const routeTree = rootRoute.addChildren([
  indexRoute,
  submitRoute,
  complaintDetailRoute,
  solutionsRoute,
  adminComplaintsRoute,
  adminSolutionsRoute,
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
