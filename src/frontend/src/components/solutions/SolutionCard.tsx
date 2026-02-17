import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SolutionUpdate } from '../../backend';
import { formatDistanceToNow } from 'date-fns';
import { Clock } from 'lucide-react';
import RelatedLinks from './RelatedLinks';

interface SolutionCardProps {
  solution: SolutionUpdate;
}

export default function SolutionCard({ solution }: SolutionCardProps) {
  const timestamp = new Date(Number(solution.timestamp) / 1_000_000);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-lg">{solution.title}</CardTitle>
          <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
            <Clock className="h-3 w-3" />
            <span>{formatDistanceToNow(timestamp, { addSuffix: true })}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
          {solution.description}
        </p>
        <RelatedLinks
          relatedCategories={solution.relatedCategories}
          relatedComplaints={solution.relatedComplaints}
        />
      </CardContent>
    </Card>
  );
}
