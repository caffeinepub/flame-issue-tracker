import { useState } from 'react';
import AdminRouteGuard from '../../components/admin/AdminRouteGuard';
import { useAddSolution, useGetPublicComplaints } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ComplaintCategory } from '../../backend';
import { COMPLAINT_CATEGORIES } from '../../lib/complaintTaxonomy';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';

function AdminSolutionsContent() {
  const addSolution = useAddSolution();
  const { data: complaints } = useGetPublicComplaints();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<ComplaintCategory[]>([]);
  const [selectedComplaints, setSelectedComplaints] = useState<bigint[]>([]);

  const handleCategoryToggle = (category: ComplaintCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleComplaintToggle = (complaintId: bigint) => {
    setSelectedComplaints((prev) =>
      prev.some((id) => id === complaintId)
        ? prev.filter((id) => id !== complaintId)
        : [...prev, complaintId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      toast.error('Title and description are required');
      return;
    }

    try {
      await addSolution.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        relatedCategories: selectedCategories,
        relatedComplaints: selectedComplaints,
      });

      toast.success('Solution published successfully');
      
      // Reset form
      setTitle('');
      setDescription('');
      setSelectedCategories([]);
      setSelectedComplaints([]);
    } catch (error: any) {
      toast.error(error.message || 'Failed to publish solution');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Solution/Update</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Enter solution title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe the solution or update in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              required
            />
          </div>

          <Separator />

          <div className="space-y-3">
            <Label>Related Categories (Optional)</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {COMPLAINT_CATEGORIES.map((category) => (
                <div key={category.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.value}`}
                    checked={selectedCategories.includes(category.value)}
                    onCheckedChange={() => handleCategoryToggle(category.value)}
                  />
                  <label
                    htmlFor={`category-${category.value}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {category.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label>Related Complaints (Optional)</Label>
            <p className="text-xs text-muted-foreground">
              Select complaints that this solution addresses
            </p>
            <div className="max-h-64 overflow-y-auto border rounded-md p-4 space-y-2">
              {complaints && complaints.length > 0 ? (
                complaints.slice(0, 20).map((complaint) => (
                  <div key={complaint.id.toString()} className="flex items-start space-x-2">
                    <Checkbox
                      id={`complaint-${complaint.id}`}
                      checked={selectedComplaints.some((id) => id === complaint.id)}
                      onCheckedChange={() => handleComplaintToggle(complaint.id)}
                    />
                    <label
                      htmlFor={`complaint-${complaint.id}`}
                      className="text-sm leading-tight cursor-pointer flex-1"
                    >
                      <span className="font-medium">#{complaint.id.toString()}</span> -{' '}
                      {complaint.description.substring(0, 100)}
                      {complaint.description.length > 100 ? '...' : ''}
                    </label>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No complaints available</p>
              )}
            </div>
          </div>

          <Button type="submit" disabled={addSolution.isPending} className="w-full">
            {addSolution.isPending ? 'Publishing...' : 'Publish Solution'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function AdminSolutionsPage() {
  return (
    <AdminRouteGuard>
      <div className="container max-w-3xl py-8 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Admin: Manage Solutions</h1>
          <p className="text-muted-foreground">
            Create and publish official solutions and updates for common issues.
          </p>
        </div>

        <AdminSolutionsContent />
      </div>
    </AdminRouteGuard>
  );
}
