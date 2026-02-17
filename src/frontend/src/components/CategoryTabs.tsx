import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ComplaintCategory } from '../backend';
import { COMPLAINT_CATEGORIES } from '../lib/complaintTaxonomy';

interface CategoryTabsProps {
  value: ComplaintCategory | 'all';
  onValueChange: (value: ComplaintCategory | 'all') => void;
}

export default function CategoryTabs({ value, onValueChange }: CategoryTabsProps) {
  return (
    <Tabs value={value} onValueChange={onValueChange as any} className="w-full">
      <TabsList className="w-full flex-wrap h-auto gap-2 bg-muted/50 p-2">
        <TabsTrigger value="all" className="flex-1 min-w-[100px]">
          All
        </TabsTrigger>
        {COMPLAINT_CATEGORIES.map((category) => (
          <TabsTrigger 
            key={category.value} 
            value={category.value}
            className="flex-1 min-w-[100px]"
          >
            {category.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
