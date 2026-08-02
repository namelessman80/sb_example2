export interface Hospital {
  id: number;
  name: string;
  city: string;
  district: string | null;
  department: string;
  specialty: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  verified: string | null;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
  relatesTo: string[];
  supportType: string;
  seekProfessionalWhen: string;
  gentleSuggestion: string;
  isFallback: boolean;
}

export interface CheckinAnalyzeResult {
  categories: Category[];
  matchedCount: number;
  isFallback: boolean;
}

export interface Feedback {
  id: number;
  name: string;
  email: string;
  category: string;
  message: string;
  status: "new" | "reviewed" | "resolved";
  createdAt: string;
}
