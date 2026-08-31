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

export interface CalendarEvent {
  id: string;
  calendarEventId?: string;
  title: string;
  date: string;
  type: 'Interview' | 'Follow-up' | 'Assessment';
  notes?: string;
  syncedToGoogle?: boolean;
}

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
  events: CalendarEvent[];
  salaryExpectation?: string;
  applicationUrl?: string;
}

export interface GoogleUserInfo {
  email: string;
  name: string;
  picture?: string;
}
