import { ResumeData, TailoredApplication } from './types';

export const initialMasterProfile: ResumeData = {
  contact: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    portfolio: ''
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

export const sampleApplications: TailoredApplication[] = [];

