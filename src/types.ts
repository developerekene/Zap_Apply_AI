export interface ContactInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  address?: string;
  postCode?: string;
  country?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
}

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  achievements: string[];
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  location?: string;
  gpa?: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  link?: string;
}

export interface SkillsCategory {
  technical: string[];
  soft: string[];
  toolsAndFrameworks: string[];
  certifications: string[];
}

export interface ResumeData {
  contact: ContactInfo;
  summary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: SkillsCategory;
  projects: ProjectItem[];
  strengths?: string[];
  totalYearsOfExperience?: string;
  calculatedYears?: number;
  attachedCvFileName?: string;
  attachedCvDate?: string;
  attachedCvSize?: string;
}

export interface AtsAnalysis {
  score: number; // 0 to 100
  matchedKeywords: string[];
  missingKeywords: string[];
  formattingScore: number; // 0 to 100
  impactScore: number; // 0 to 100
  keyRecommendations: string[];
  keywordDensity: Record<string, number>; // word -> frequency
  atsComplianceChecks: {
    title: string;
    passed: boolean;
    reason: string;
  }[];
}

export type ApplicationStatus = 'Saved' | 'Applied' | 'Interview Scheduled' | 'Offer Received' | 'Rejected';

export interface TailoredApplication {
  id: string;
  jobTitle: string;
  companyName: string;
  jobLocation: string;
  rawJobDescription: string;
  dateCreated: string;
  lastUpdated: string;
  status: ApplicationStatus;
  notes: string;
  tailoredResume: ResumeData;
  coverLetter: string;
  personalStatement?: string;
  atsAnalysis: AtsAnalysis;
  salaryExpectation?: string;
  applicationUrl?: string;
  totalYearsOfExperience?: string;
}

export interface JobMatchItem {
  id: string;
  title: string;
  company: string;
  location: string;
  workMode: 'Remote' | 'Hybrid' | 'On-site';
  salaryRange?: string;
  experienceRequired: string;
  matchScore: number;
  description: string;
  matchedSkills: string[];
  applyUrl: string;
  companyCareersUrl?: string;
  isDirectEmployer?: boolean;
  source: string;
  postedDate?: string;
  urgency?: 'Actively Hiring' | 'New' | 'High Match';
  portalLinks?: {
    companySite?: string;
    linkedin?: string;
    indeed?: string;
    googleJobs?: string;
    reed?: string;
  };
}

export interface RecruitmentAgency {
  id: string;
  name: string;
  website: string;
  contactUrl: string;
  specialization: string;
  location: string;
  description: string;
  rolesTypicallyPlaced: string[];
  contactEmail?: string;
  contactPhone?: string;
  directOutreachTip?: string;
}

export type MembershipTier = 'silver' | 'gold' | 'platinum';

export interface MembershipPlan {
  id: MembershipTier;
  name: string;
  price: string;
  priceNumber: number;
  period: string;
  badge: string;
  description: string;
  features: string[];
  highlight?: boolean;
  buttonLabel: string;
}

