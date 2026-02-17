import { useState } from 'react';
import AdminRouteGuard from '../../components/admin/AdminRouteGuard';
import { useGetAllComplaints, useUpdateComplaintStatus, useHideComplaint, useDeleteComplaint } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Eye, EyeOff, Trash2 } from 'lucide-react';
import { ComplaintStatus, Complaint } from '../../backend';
import StatusTag from '../../components/StatusTag';
import { getCategoryLabel } from '../../lib/complaintTaxonomy';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

function AdminComplaintsContent() {
  const { data: complaints, isLoading, error } = useGetAllComplaints();
  const updateStatus = useUpdateComplaintStatus();
  const hideComplaint = useHideComplaint();
  const deleteComplaint = useDeleteComplaint();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [complaintToDelete, setComplaintToDelete] = useState<bigint | null>(null);

  const handleStatusChange = async (complaintId: bigint, newStatus: ComplaintStatus) => {
    try {
      await updateStatus.mutateAsync({ complaintId, newStatus });
      toast.success('Complaint status updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  const handleToggleHidden = async (complaint: Complaint) => {
    try {
      await hideComplaint.mutateAsync(complaint.id);
      toast.success(complaint.hidden ? 'Complaint unhidden' : 'Complaint hidden');
    } catch (error: any) {
      toast.error(error.message || 'Failed to toggle visibility');
    }
  };

  const handleDeleteClick = (complaintId: bigint) => {
    setComplaintToDelete(complaintId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!complaintToDelete) return;

    try {
      await deleteComplaint.mutateAsync(complaintToDelete);
      toast.success('Complaint deleted successfully');
      setDeleteDialogOpen(false);
      setComplaintToDelete(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete complaint');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load complaints. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {complaints && complaints.length > 0 ? (
          complaints.map((complaint) => {
            const timestamp = new Date(Number(complaint.timestamp) / 1_000_000);
            
            return (
              <Card key={complaint.id.toString()} className={complaint.hidden ? 'opacity-50' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle className="text-lg">
                          #{complaint.id.toString()} - {getCategoryLabel(complaint.category)}
                        </CardTitle>
                        <StatusTag status={complaint.status} />
                        {complaint.hidden && (
                          <span className="text-xs text-muted-foreground">(Hidden)</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Submitted: {format(timestamp, 'PPP')} • Urgency: {complaint.urgencyLevel}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">{complaint.description}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    <Select
                      value={complaint.status}
                      onValueChange={(value) => handleStatusChange(complaint.id, value as ComplaintStatus)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ComplaintStatus.submitted}>Submitted</SelectItem>
                        <SelectItem value={ComplaintStatus.underReview}>Under Review</SelectItem>
                        <SelectItem value={ComplaintStatus.inProgress}>In Progress</SelectItem>
                        <SelectItem value={ComplaintStatus.resolved}>Resolved</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleHidden(complaint)}
                      disabled={hideComplaint.isPending}
                    >
                      {complaint.hidden ? (
                        <>
                          <Eye className="h-4 w-4 mr-2" />
                          Unhide
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-4 w-4 mr-2" />
                          Hide
                        </>
                      )}
                    </Button>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteClick(complaint.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Alert>
            <AlertDescription>No complaints found.</AlertDescription>
          </Alert>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the complaint from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default function AdminComplaintsPage() {
  return (
    <AdminRouteGuard>
      <div className="container py-8 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Admin: Manage Complaints</h1>
          <p className="text-muted-foreground">
            Review, update status, hide, or delete complaints. Changes are reflected immediately on the public board.
          </p>
        </div>

        <AdminComplaintsContent />
      </div>
    </AdminRouteGuard>
  );
}
