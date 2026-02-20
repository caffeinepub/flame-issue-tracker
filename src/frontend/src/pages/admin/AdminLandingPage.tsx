import { Link } from '@tanstack/react-router';
import AdminRouteGuard from '../../components/admin/AdminRouteGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Lightbulb, Shield } from 'lucide-react';

export default function AdminLandingPage() {
  return (
    <AdminRouteGuard>
      <div className="container py-8 max-w-4xl">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
            <p className="text-muted-foreground mt-2">
              Manage complaints and publish solutions for the FLAME community
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Link to="/admin/complaints" className="group">
              <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <FileText className="h-6 w-6" />
                    </div>
                    <CardTitle className="group-hover:text-primary transition-colors">
                      Manage Complaints
                    </CardTitle>
                  </div>
                  <CardDescription>
                    Review, update status, and manage all student complaints
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• View all submitted complaints</li>
                    <li>• Update complaint status</li>
                    <li>• Hide or delete inappropriate content</li>
                  </ul>
                </CardContent>
              </Card>
            </Link>

            <Link to="/admin/solutions" className="group">
              <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Lightbulb className="h-6 w-6" />
                    </div>
                    <CardTitle className="group-hover:text-primary transition-colors">
                      Manage Solutions
                    </CardTitle>
                  </div>
                  <CardDescription>
                    Publish solutions and updates for resolved complaints
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Create new solution entries</li>
                    <li>• Link solutions to complaints</li>
                    <li>• Publish updates for students</li>
                  </ul>
                </CardContent>
              </Card>
            </Link>

            <Link to="/admin/access-control" className="group">
              <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Shield className="h-6 w-6" />
                    </div>
                    <CardTitle className="group-hover:text-primary transition-colors">
                      Access Control
                    </CardTitle>
                  </div>
                  <CardDescription>
                    View and manage admin access allowlist
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• View authorized admin principals</li>
                    <li>• Verify admin access configuration</li>
                    <li>• Troubleshoot access issues</li>
                  </ul>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </AdminRouteGuard>
  );
}
