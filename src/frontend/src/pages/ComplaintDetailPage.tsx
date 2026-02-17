import { useParams, Link } from '@tanstack/react-router';
import { useGetComplaint } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ArrowLeft, Calendar, User, AlertTriangle, FileText } from 'lucide-react';
import StatusTag from '../components/StatusTag';
import { getCategoryLabel } from '../lib/complaintTaxonomy';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export default function ComplaintDetailPage() {
  const { complaintId } = useParams({ from: '/complaint/$complaintId' });
  const { data: complaint, isLoading, error } = useGetComplaint(BigInt(complaintId));

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-8 space-y-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="container max-w-4xl py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error ? 'Failed to load complaint details.' : 'Complaint not found.'}
          </AlertDescription>
        </Alert>
        <Link to="/">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Complaints
          </Button>
        </Link>
      </div>
    );
  }

  const timestamp = new Date(Number(complaint.timestamp) / 1_000_000);

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      <Link to="/">
        <Button variant="outline" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Complaints
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-2xl">
                  Complaint #{complaint.id.toString()}
                </CardTitle>
                <StatusTag status={complaint.status} />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="secondary">{getCategoryLabel(complaint.category)}</Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Submitted:</span>
              <span className="font-medium">{format(timestamp, 'PPP')}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Urgency:</span>
              <Badge variant={
                complaint.urgencyLevel === 'critical' ? 'destructive' :
                complaint.urgencyLevel === 'high' ? 'default' :
                'secondary'
              } className="capitalize">
                {complaint.urgencyLevel}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Description</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {complaint.description}
            </p>
          </div>

          {complaint.proof && (
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Supporting Evidence
              </h3>
              <div className="border rounded-lg p-4 bg-muted/50">
                <a
                  href={complaint.proof.getDirectURL()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center gap-2"
                >
                  View Attached Proof
                  <ArrowLeft className="h-3 w-3 rotate-180" />
                </a>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
