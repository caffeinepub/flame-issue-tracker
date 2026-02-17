import { useState, useMemo } from 'react';
import { useGetPublicComplaints } from '../hooks/useQueries';
import ComplaintListItem from '../components/ComplaintListItem';
import CategoryTabs from '../components/CategoryTabs';
import ComplaintSearchAndFilters, { FilterState } from '../components/ComplaintSearchAndFilters';
import { ComplaintCategory, ComplaintStatus } from '../backend';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function ComplaintBoardPage() {
  const { data: complaints, isLoading, error } = useGetPublicComplaints();
  const [selectedCategory, setSelectedCategory] = useState<ComplaintCategory | 'all'>('all');
  const [filters, setFilters] = useState<FilterState>({
    searchText: '',
    category: 'all',
    status: 'all',
    urgency: 'all',
  });

  const filteredComplaints = useMemo(() => {
    if (!complaints) return [];

    return complaints.filter((complaint) => {
      // Category filter (from tabs)
      if (selectedCategory !== 'all' && complaint.category !== selectedCategory) {
        return false;
      }

      // Additional category filter (from dropdown)
      if (filters.category !== 'all' && complaint.category !== filters.category) {
        return false;
      }

      // Status filter
      if (filters.status !== 'all' && complaint.status !== filters.status) {
        return false;
      }

      // Urgency filter
      if (filters.urgency !== 'all' && complaint.urgencyLevel.toLowerCase() !== filters.urgency) {
        return false;
      }

      // Search filter
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        return complaint.description.toLowerCase().includes(searchLower);
      }

      return true;
    });
  }, [complaints, selectedCategory, filters]);

  // Separate resolved and active complaints
  const activeComplaints = filteredComplaints.filter(c => c.status !== ComplaintStatus.resolved);
  const resolvedComplaints = filteredComplaints.filter(c => c.status === ComplaintStatus.resolved);

  return (
    <div className="container py-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Complaint Board</h1>
        <p className="text-muted-foreground">
          View and track all submitted complaints. Browse by category or use filters to find specific issues.
        </p>
      </div>

      <CategoryTabs value={selectedCategory} onValueChange={setSelectedCategory} />

      <ComplaintSearchAndFilters filters={filters} onFiltersChange={setFilters} />

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load complaints. Please try again later.
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Active Complaints */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">
              Active Complaints ({activeComplaints.length})
            </h2>
            {activeComplaints.length === 0 ? (
              <Alert>
                <AlertDescription>
                  No active complaints found matching your filters.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {activeComplaints.map((complaint) => (
                  <ComplaintListItem key={complaint.id.toString()} complaint={complaint} />
                ))}
              </div>
            )}
          </div>

          {/* Resolved Complaints */}
          {resolvedComplaints.length > 0 && (
            <>
              <Separator />
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-muted-foreground">
                  Resolved Complaints ({resolvedComplaints.length})
                </h2>
                <div className="grid gap-4 md:grid-cols-2 opacity-60">
                  {resolvedComplaints.map((complaint) => (
                    <ComplaintListItem key={complaint.id.toString()} complaint={complaint} />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
