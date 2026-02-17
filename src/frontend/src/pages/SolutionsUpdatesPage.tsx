import { useGetSolutions } from '../hooks/useQueries';
import SolutionCard from '../components/solutions/SolutionCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Lightbulb } from 'lucide-react';

export default function SolutionsUpdatesPage() {
  const { data: solutions, isLoading, error } = useGetSolutions();

  return (
    <div className="container py-8 space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Solutions & Updates</h1>
        </div>
        <p className="text-muted-foreground">
          Official responses and common solutions to frequently reported issues.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load solutions. Please try again later.
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : solutions && solutions.length > 0 ? (
        <div className="space-y-4">
          {solutions.map((solution) => (
            <SolutionCard key={solution.id.toString()} solution={solution} />
          ))}
        </div>
      ) : (
        <Alert>
          <AlertDescription>
            No solutions or updates have been published yet. Check back later for official responses to common issues.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
