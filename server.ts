import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));

// Helper to check Gemini API Key safely
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not configured.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Resilient helper to call Gemini with automatic fallback between candidate models
async function generateWithGeminiFallback(
  ai: GoogleGenAI,
  requestParams: {
    contents: any;
    config?: any;
  }
) {
  // Ordered by current health, speed, and availability
  const models = [
    'gemini-3.1-flash-lite',
    'gemini-flash-latest',
    'gemini-3.8-flash',
    'gemini-3.6-flash'
  ];

  let lastError: any = null;
  for (const model of models) {
    try {
      console.log(`[Gemini] Attempting call with model: ${model}...`);
      const response = await ai.models.generateContent({
        ...requestParams,
        model
      });
      console.log(`[Gemini] Model ${model} succeeded.`);
      return response;
    } catch (err: any) {
      console.warn(`[Gemini] Model ${model} failed (${err?.message || err}). Trying fallback model...`);
      lastError = err;
    }
  }

  throw lastError || new Error('All Gemini candidate models failed to generate content.');
}

// Clean and parse JSON strictly from AI output
function extractJsonFromResponse(rawText: string): any {
  if (!rawText) return {};
  const cleaned = rawText
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (initialErr) {
    // If there is preamble or postamble text, extract outermost JSON object { ... }
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      const jsonSubstr = cleaned.substring(start, end + 1);
      return JSON.parse(jsonSubstr);
    }
    throw initialErr;
  }
}

// Normalize extracted CV data to ensure all 5 core sections are completely populated
function normalizeParsedResume(data: any) {
  if (!data || typeof data !== 'object') {
    data = {};
  }

  const contact = data.contact || {};
  const normalizedContact = {
    fullName: typeof contact.fullName === 'string' ? contact.fullName.trim() : '',
    email: typeof contact.email === 'string' ? contact.email.trim() : '',
    phone: typeof contact.phone === 'string' ? contact.phone.trim() : '',
    location: typeof contact.location === 'string' ? contact.location.trim() : '',
    address: typeof contact.address === 'string' ? contact.address.trim() : '',
    postCode: typeof contact.postCode === 'string' ? contact.postCode.trim() : '',
    country: typeof contact.country === 'string' ? contact.country.trim() : '',
    linkedin: typeof contact.linkedin === 'string' ? contact.linkedin.trim() : '',
    github: typeof contact.github === 'string' ? contact.github.trim() : '',
    portfolio: typeof contact.portfolio === 'string' ? contact.portfolio.trim() : ''
  };

  const summary = typeof data.summary === 'string' ? data.summary.trim() : '';

  const rawExperience = Array.isArray(data.experience) ? data.experience : [];
  const normalizedExperience = rawExperience.map((item: any, idx: number) => ({
    id: item.id || `exp-${idx + 1}-${Date.now()}`,
    company: typeof item.company === 'string' ? item.company.trim() : 'Company',
    role: typeof item.role === 'string' ? item.role.trim() : 'Role',
    location: typeof item.location === 'string' ? item.location.trim() : '',
    startDate: typeof item.startDate === 'string' ? item.startDate.trim() : '',
    endDate: typeof item.endDate === 'string' ? item.endDate.trim() : 'Present',
    current: Boolean(item.current || item.endDate?.toLowerCase() === 'present'),
    achievements: Array.isArray(item.achievements)
      ? item.achievements.map((a: any) => String(a).trim()).filter(Boolean)
      : (typeof item.achievements === 'string' ? [item.achievements.trim()] : [])
  }));

  const rawEducation = Array.isArray(data.education) ? data.education : [];
  const normalizedEducation = rawEducation.map((item: any, idx: number) => ({
    id: item.id || `edu-${idx + 1}-${Date.now()}`,
    institution: typeof item.institution === 'string' ? item.institution.trim() : '',
    degree: typeof item.degree === 'string' ? item.degree.trim() : '',
    fieldOfStudy: typeof item.fieldOfStudy === 'string' ? item.fieldOfStudy.trim() : '',
    startDate: typeof item.startDate === 'string' ? item.startDate.trim() : '',
    endDate: typeof item.endDate === 'string' ? item.endDate.trim() : '',
    location: typeof item.location === 'string' ? item.location.trim() : '',
    gpa: typeof item.gpa === 'string' ? item.gpa.trim() : ''
  }));

  const rawSkills = data.skills || {};
  const normalizedSkills = {
    technical: Array.isArray(rawSkills.technical)
      ? rawSkills.technical.map((s: any) => String(s).trim()).filter(Boolean)
      : [],
    soft: Array.isArray(rawSkills.soft)
      ? rawSkills.soft.map((s: any) => String(s).trim()).filter(Boolean)
      : [],
    toolsAndFrameworks: Array.isArray(rawSkills.toolsAndFrameworks)
      ? rawSkills.toolsAndFrameworks.map((s: any) => String(s).trim()).filter(Boolean)
      : [],
    certifications: Array.isArray(rawSkills.certifications)
      ? rawSkills.certifications.map((s: any) => String(s).trim()).filter(Boolean)
      : []
  };

  const rawProjects = Array.isArray(data.projects) ? data.projects : [];
  const normalizedProjects = rawProjects.map((p: any, idx: number) => ({
    id: p.id || `proj-${idx + 1}-${Date.now()}`,
    name: typeof p.name === 'string' ? p.name.trim() : 'Project',
    description: typeof p.description === 'string' ? p.description.trim() : '',
    technologies: Array.isArray(p.technologies)
      ? p.technologies.map((t: any) => String(t).trim()).filter(Boolean)
      : [],
    link: typeof p.link === 'string' ? p.link.trim() : ''
  }));

  const rawStrengths = Array.isArray(data.strengths)
    ? data.strengths.map((s: any) => String(s).trim()).filter(Boolean)
    : [];

  return {
    contact: normalizedContact,
    summary,
    experience: normalizedExperience,
    education: normalizedEducation,
    skills: normalizedSkills,
    projects: normalizedProjects,
    strengths: rawStrengths
  };
}

// --------------------------------------------------------
// API ROUTE 1: Parse Raw Resume Text or PDF/Doc File
// --------------------------------------------------------
app.post('/api/gemini/parse-resume', async (req, res) => {
  try {
    const { rawText, fileBase64, fileMimeType } = req.body;
    if (!rawText && !fileBase64) {
      return res.status(400).json({ error: 'rawText or fileBase64 is required.' });
    }

    const ai = getGeminiClient();
    const promptText = `
You are an expert ATS (Applicant Tracking System) parser and professional CV/Resume analyzer.
Examine the provided resume (PDF document or text) and parse all candidate information into a structured JSON object matching this exact schema:

{
  "contact": {
    "fullName": "Full Name",
    "email": "Email Address",
    "phone": "Phone Number",
    "location": "City, State / Country",
    "address": "Street Address if present",
    "postCode": "Post Code / Zip if present",
    "country": "Country if present",
    "linkedin": "LinkedIn URL or handle",
    "github": "GitHub URL or handle",
    "portfolio": "Portfolio or website URL"
  },
  "summary": "Professional summary or bio",
  "experience": [
    {
      "id": "exp-1",
      "company": "Company Name",
      "role": "Job Title",
      "location": "Location",
      "startDate": "YYYY-MM or YYYY",
      "endDate": "YYYY-MM or Present",
      "current": true,
      "achievements": [
        "Quantified achievement or bullet point starting with action verb"
      ]
    }
  ],
  "education": [
    {
      "id": "edu-1",
      "institution": "University / School Name",
      "degree": "Degree Name",
      "fieldOfStudy": "Field of Study",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM",
      "location": "Location",
      "gpa": "GPA if mentioned"
    }
  ],
  "skills": {
    "technical": ["Skill 1", "Skill 2"],
    "soft": ["Skill 1", "Skill 2"],
    "toolsAndFrameworks": ["Tool 1", "Tool 2"],
    "certifications": ["Certification 1"]
  },
  "projects": [
    {
      "id": "proj-1",
      "name": "Project Name",
      "description": "Short project description",
      "technologies": ["Tech 1", "Tech 2"],
      "link": "URL if available"
    }
  ],
  "strengths": [
    "Key candidate highlight or core strength 1",
    "Key candidate highlight or core strength 2",
    "Key candidate highlight or core strength 3"
  ]
}

Ensure all IDs are unique strings (e.g. exp-1, exp-2, edu-1, proj-1).
If any field is missing from the CV, fill it with empty strings or empty arrays.
Respond strictly with valid JSON only. Do not include markdown code blocks (\`\`\`json) or conversational text.
`;

    let contentsPayload: any[];
    if (fileBase64) {
      contentsPayload = [
        {
          inlineData: {
            mimeType: fileMimeType || 'application/pdf',
            data: fileBase64
          }
        },
        { text: promptText }
      ];
    } else {
      contentsPayload = [promptText + `\n\nRAW RESUME TEXT:\n${rawText}`];
    }

    const response = await generateWithGeminiFallback(ai, {
      contents: contentsPayload,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const parsedData = extractJsonFromResponse(response.text || '{}');
    const normalized = normalizeParsedResume(parsedData);
    return res.json({ success: true, data: normalized });
  } catch (error: any) {
    console.error('Error in parse-resume:', error);
    return res.status(500).json({
      error: error.message || 'Failed to parse resume file using Gemini AI.'
    });
  }
});

// --------------------------------------------------------
// API ROUTE 2: Tailor Application (Resume + Cover Letter + ATS Analysis)
// --------------------------------------------------------
app.post('/api/gemini/tailor-application', async (req, res) => {
  try {
    const { masterProfile, jobDescription, jobTitle, companyName, customPrompt } = req.body;

    if (!masterProfile || !jobDescription) {
      return res.status(400).json({ error: 'masterProfile and jobDescription are required.' });
    }

    const ai = getGeminiClient();

    const prompt = `
You are an elite executive career strategist, ATS expert, and recruiting algorithm specialist.
Your task is to take a candidate's Master Resume Profile and a target Job Details text to produce a tightly optimized, executive-level application.

CRITICAL ATS FORMATTING, COMPANY NAME & COVER LETTER INSTRUCTIONS:
- Tailor the candidate's full professional background specifically for high ATS relevance against the job description.
- Retain all relevant work experience roles from the candidate's master profile, providing 4-6 strong, metric-driven achievements per role starting with powerful action verbs.
- Include all key technical skills, tools, domain competencies, projects, and education credentials.
- Ensure standard ATS section headings ("PROFESSIONAL SUMMARY", "CORE COMPETENCIES & SKILLS", "PROFESSIONAL EXPERIENCE", "SELECTED PROJECTS", "EDUCATION").

COMPANY NAME CRITICAL RULE:
- If you CANNOT find or determine the explicit company name from the job description or explicit details provided, DO NOT use or invent the string/phrase "Target Company" or "Unknown". Set extractedCompanyName to "" or the actual detected company name.
- NEVER add or mention the phrase "Target Company" inside the cover letter text. If company name is not found, address the letter professionally to "Dear Hiring Manager," or "Dear Selection Committee," and refer to "your organization", "the hiring team", or "the company" instead of "Target Company".

COVER LETTER CANDIDATE CONTACT DETAILS INSTRUCTION:
- At the top of the cover letter text, generate a clean applicant contact block including all available user contact details from the candidate profile:
  Full Name
  Street Address (if present in candidate contact)
  Post Code / Zip (if present in candidate contact)
  Country (if present in candidate contact)
  Phone Number
  Email Address
  City, State / Location
- Followed by the date and salutation, then the body of the cover letter.

PERSONAL STATEMENT (SUPPORTING STATEMENT) INSTRUCTIONS:
- Generate a comprehensive, evidence-based Personal Statement / Supporting Statement explicitly tailored to the role.
- Identify all essential skills, competencies, and experience criteria specified in the job description / advert.
- For EVERY essential skill or criteria identified, map all relevant candidate experiences using the STAR method:
  * Situation (S): Context or organizational background of the project/role.
  * Task (T): Essential challenge or target objective.
  * Action (A): Specific actions taken, technologies utilized, methodologies, and leadership demonstrated.
  * Result (R): Measurable impact, performance metrics, efficiency gains, or successful delivery.
- Begin the Personal Statement with candidate contact details at the top (Full Name, Address, Post Code, Country, Phone, Email), followed by a brief executive opening summary, and then structured STAR evidence sections for each essential criterion.

JOB DETAILS / POSTING TEXT:
${jobDescription}

${jobTitle ? `Explicit Job Title: ${jobTitle}` : ''}
${companyName ? `Explicit Company Name: ${companyName}` : ''}

CANDIDATE MASTER PROFILE:
${JSON.stringify(masterProfile, null, 2)}

${customPrompt ? `CUSTOM USER INSTRUCTION: ${customPrompt}` : ''}

Respond STRICTLY with valid JSON matching this schema:
{
  "extractedJobTitle": "string (Job Title extracted from job posting)",
  "extractedCompanyName": "string (Company Name extracted from job posting)",
  "extractedJobLocation": "string (Location extracted from job posting)",
  "tailoredResume": {
    "contact": {
      "fullName": "string",
      "email": "string",
      "phone": "string",
      "location": "string",
      "linkedin": "string",
      "github": "string",
      "portfolio": "string"
    },
    "summary": "Tailored summary aligned with job description",
    "experience": [
      {
        "id": "exp-1",
        "company": "string",
        "role": "string",
        "location": "string",
        "startDate": "string",
        "endDate": "string",
        "current": boolean,
        "achievements": ["Tailored bullet point 1 with metrics and keywords", "Tailored bullet point 2"]
      }
    ],
    "education": [
      {
        "id": "edu-1",
        "institution": "string",
        "degree": "string",
        "fieldOfStudy": "string",
        "startDate": "string",
        "endDate": "string",
        "location": "string",
        "gpa": "string"
      }
    ],
    "skills": {
      "technical": ["string"],
      "soft": ["string"],
      "toolsAndFrameworks": ["string"],
      "certifications": ["string"]
    },
    "projects": [
      {
        "id": "proj-1",
        "name": "string",
        "description": "string",
        "technologies": ["string"],
        "link": "string"
      }
    ],
    "strengths": ["Key tailored strength 1", "Key tailored strength 2", "Key tailored strength 3"]
  },
  "coverLetter": "Full persuasive cover letter text...",
  "personalStatement": "Comprehensive Personal Statement / Supporting Statement mapping essential skills criteria using STAR format (Situation, Task, Action, Result)...",
  "atsAnalysis": {
    "score": 92,
    "matchedKeywords": ["Keyword 1", "Keyword 2", "Keyword 3"],
    "missingKeywords": ["Missing term 1", "Missing term 2"],
    "formattingScore": 96,
    "impactScore": 90,
    "keyRecommendations": ["Specific actionable recommendation 1", "Recommendation 2"],
    "keywordDensity": {
      "Keyword1": 4,
      "Keyword2": 3
    },
    "atsComplianceChecks": [
      { "title": "Standard Section Headings", "passed": true, "reason": "Uses standard headings recognized by ATS systems." },
      { "title": "Keyword Density Optimization", "passed": true, "reason": "Core requirements naturally integrated without keyword stuffing." },
      { "title": "Quantified Impact Verbs", "passed": true, "reason": "Experience bullets feature measurable outcomes and metrics." },
      { "title": "Clean Parsable Contact Block", "passed": true, "reason": "Contact details clean and free of table nested traps." }
    ]
  }
}
`;

    const response = await generateWithGeminiFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const resultJson = extractJsonFromResponse(response.text || '{}');
    return res.json({ success: true, data: resultJson });
  } catch (error: any) {
    console.error('Error in tailor-application:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate tailored application.'
    });
  }
});

// --------------------------------------------------------
// Start Express Server / Vite Integration
// --------------------------------------------------------
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ZAP Apply server running on http://localhost:${PORT}`);
  });
}

start();
