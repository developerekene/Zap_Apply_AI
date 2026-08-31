import { ResumeData, TailoredApplication } from './types';

export const ADMIN_EMAILS = ['seniordevekene@gmail.com'];

export function checkIsAdmin(email?: string): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return ADMIN_EMAILS.some(adminEmail => adminEmail.toLowerCase() === normalized);
}

export const emptyMasterProfile: ResumeData = {
  contact: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    portfolio: '',
    address: '',
    postCode: '',
    country: ''
  },
  summary: '',
  experience: [],
  education: [],
  skills: {
    technical: [],
    soft: [],
    toolsAndFrameworks: [],
    certifications: []
  },
  projects: [],
  strengths: []
};

export const initialMasterProfile: ResumeData = {
  ...emptyMasterProfile
};

export const sampleApplications: TailoredApplication[] = [];


