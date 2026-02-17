import { Badge } from '@/components/ui/badge';
import { ComplaintCategory } from '../../backend';
import { getCategoryLabel } from '../../lib/complaintTaxonomy';
import { Link } from '@tanstack/react-router';
import { ExternalLink } from 'lucide-react';

interface RelatedLinksProps {
  relatedCategories: ComplaintCategory[];
  relatedComplaints: bigint[];
}

export default function RelatedLinks({ relatedCategories, relatedComplaints }: RelatedLinksProps) {
  if (relatedCategories.length === 0 && relatedComplaints.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 pt-3 border-t">
      {relatedCategories.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Related Categories:</p>
          <div className="flex flex-wrap gap-2">
            {relatedCategories.map((category) => (
              <Badge key={category} variant="secondary">
                {getCategoryLabel(category)}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {relatedComplaints.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Related Complaints:</p>
          <div className="flex flex-wrap gap-2">
            {relatedComplaints.map((id) => (
              <Link key={id.toString()} to="/complaint/$complaintId" params={{ complaintId: id.toString() }}>
                <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                  #{id.toString()}
                  <ExternalLink className="ml-1 h-3 w-3" />
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
