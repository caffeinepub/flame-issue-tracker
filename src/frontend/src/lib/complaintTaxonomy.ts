import { ComplaintCategory } from '../backend';

export interface CategoryInfo {
  value: ComplaintCategory;
  label: string;
}

export const COMPLAINT_CATEGORIES: CategoryInfo[] = [
  { value: ComplaintCategory.foodServices, label: 'Food Services' },
  { value: ComplaintCategory.professorsAcademics, label: 'Professors & Academics' },
  { value: ComplaintCategory.raggingSafety, label: 'Ragging & Safety' },
  { value: ComplaintCategory.disciplineRules, label: 'Discipline Rules' },
  { value: ComplaintCategory.hostelFacilities, label: 'Hostel & Facilities' },
  { value: ComplaintCategory.administration, label: 'Administration' },
];

export function getCategoryLabel(category: ComplaintCategory): string {
  const found = COMPLAINT_CATEGORIES.find((c) => c.value === category);
  return found ? found.label : 'Unknown Category';
}
