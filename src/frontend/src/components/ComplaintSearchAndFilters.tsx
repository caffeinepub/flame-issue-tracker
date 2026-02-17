import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { ComplaintCategory, ComplaintStatus } from '../backend';
import { COMPLAINT_CATEGORIES } from '../lib/complaintTaxonomy';

export interface FilterState {
  searchText: string;
  category: ComplaintCategory | 'all';
  status: ComplaintStatus | 'all';
  urgency: string;
}

interface ComplaintSearchAndFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export default function ComplaintSearchAndFilters({ filters, onFiltersChange }: ComplaintSearchAndFiltersProps) {
  const hasActiveFilters = filters.searchText || filters.category !== 'all' || filters.status !== 'all' || filters.urgency !== 'all';

  const handleReset = () => {
    onFiltersChange({
      searchText: '',
      category: 'all',
      status: 'all',
      urgency: 'all',
    });
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search complaints..."
          value={filters.searchText}
          onChange={(e) => onFiltersChange({ ...filters, searchText: e.target.value })}
          className="pl-9"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Select
          value={filters.category}
          onValueChange={(value) => onFiltersChange({ ...filters, category: value as ComplaintCategory | 'all' })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {COMPLAINT_CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.status}
          onValueChange={(value) => onFiltersChange({ ...filters, status: value as ComplaintStatus | 'all' })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value={ComplaintStatus.submitted}>Submitted</SelectItem>
            <SelectItem value={ComplaintStatus.underReview}>Under Review</SelectItem>
            <SelectItem value={ComplaintStatus.inProgress}>In Progress</SelectItem>
            <SelectItem value={ComplaintStatus.resolved}>Resolved</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.urgency}
          onValueChange={(value) => onFiltersChange({ ...filters, urgency: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Urgency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Urgency</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <Button variant="outline" size="sm" onClick={handleReset} className="w-full sm:w-auto">
          <X className="h-4 w-4 mr-2" />
          Clear Filters
        </Button>
      )}
    </div>
  );
}
