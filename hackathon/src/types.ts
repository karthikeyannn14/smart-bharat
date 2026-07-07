export type LanguageCode = "en" | "hi" | "ta" | "te" | "ml" | "bn";

export interface Message {
  sender: "user" | "bot";
  text: string;
  matchedServiceId?: string | null;
}

export interface Complaint {
  id: string;
  category: string;
  originalDescription: string;
  formalComplaint: string;
  location: string;
  status: "Submitted" | "Under review" | "Resolved";
  timestamp: string;
  estimatedCompletion: string;
  holdReason?: string | null;
  actionableNextStep?: string | null;
  likelyIssueType?: string | null;
  imageUrl?: string | null;
}

export interface UploadedDocument {
  id: string;
  name: string; // original file name e.g. "aadhaar.jpg"
  mimeType: string;
  verifiedType: string; // e.g. "Aadhaar Card", "PAN Card", etc.
  status: "Clear image" | "Please re-upload, image unclear" | "Verifying..." | "Failed";
  fields: {
    name?: string | null;
    dob?: string | null;
    idNumber?: string | null;
    issueDate?: string | null;
    address?: string | null;
  };
  reason: string;
  timestamp: string;
  previewUrl: string;
}

export interface GovtService {
  id: string;
  name: string;
  description: string;
  eligibility: string;
  documents: string[];
  steps: string[];
  fees: string;
  processingTime: string;
  officialWebsite: string;
  actions: { label: string; url: string }[];
  icon: string;
}
