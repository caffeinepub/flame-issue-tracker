import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSubmitComplaint } from '../hooks/useQueries';
import { ComplaintCategory, ExternalBlob } from '../backend';
import { COMPLAINT_CATEGORIES } from '../lib/complaintTaxonomy';
import ProofUploadField from '../components/ProofUploadField';
import SubmitResultBanner from '../components/SubmitResultBanner';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function SubmitComplaintPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const submitComplaint = useSubmitComplaint();

  const [category, setCategory] = useState<ComplaintCategory | ''>('');
  const [description, setDescription] = useState('');
  const [urgencyLevel, setUrgencyLevel] = useState<string>('');
  const [proof, setProof] = useState<ExternalBlob | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string>('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const isAuthenticated = !!identity;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!category) {
      newErrors.category = 'Please select a category';
    }
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }
    if (!urgencyLevel) {
      newErrors.urgencyLevel = 'Please select an urgency level';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess(false);

    if (!validateForm()) {
      return;
    }

    try {
      const complaintId = await submitComplaint.mutateAsync({
        category: category as ComplaintCategory,
        description: description.trim(),
        urgencyLevel,
        proof,
      });

      setSubmitSuccess(true);
      
      // Reset form
      setCategory('');
      setDescription('');
      setUrgencyLevel('');
      setProof(null);
      setErrors({});

      // Navigate to the new complaint after a short delay
      setTimeout(() => {
        navigate({ to: `/complaint/${complaintId}` });
      }, 2000);
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to submit complaint';
      
      // Check for moderation errors
      if (errorMessage.includes('inappropriate language') || errorMessage.includes('Description contains')) {
        setSubmitError('Your complaint contains inappropriate language and cannot be submitted. Please revise your description and try again.');
      } else {
        setSubmitError(errorMessage);
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container max-w-2xl py-16">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You must be logged in to submit a complaint. Please log in using the button in the header.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Submit a Complaint</CardTitle>
          <CardDescription>
            Fill out the form below to submit your complaint. All fields marked with * are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {submitSuccess && (
              <SubmitResultBanner
                type="success"
                title="Complaint Submitted Successfully"
                message="Your complaint has been submitted and will be reviewed by the administration. Redirecting to complaint details..."
              />
            )}

            {submitError && (
              <SubmitResultBanner
                type="error"
                title="Submission Failed"
                message={submitError}
              />
            )}

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={category} onValueChange={(value) => setCategory(value as ComplaintCategory)}>
                <SelectTrigger id="category" className={errors.category ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {COMPLAINT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-destructive">{errors.category}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="urgency">Urgency Level *</Label>
              <Select value={urgencyLevel} onValueChange={setUrgencyLevel}>
                <SelectTrigger id="urgency" className={errors.urgencyLevel ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select urgency level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
              {errors.urgencyLevel && (
                <p className="text-sm text-destructive">{errors.urgencyLevel}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe your complaint in detail..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                className={errors.description ? 'border-destructive' : ''}
              />
              <p className="text-xs text-muted-foreground">
                Minimum 10 characters. Please be respectful and avoid inappropriate language.
              </p>
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description}</p>
              )}
            </div>

            <ProofUploadField value={proof} onChange={setProof} />

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={submitComplaint.isPending}
                className="flex-1"
              >
                {submitComplaint.isPending ? 'Submitting...' : 'Submit Complaint'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: '/' })}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
