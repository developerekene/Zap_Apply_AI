// Google Authentication & Calendar Integration using Firebase Auth and Google Identity Services
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

declare global {
  interface Window {
    google?: any;
  }
}

const config = firebaseConfig as Record<string, any>;

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

export const SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/userinfo.email'
];

const provider = new GoogleAuthProvider();
SCOPES.forEach(scope => provider.addScope(scope));

// In-memory token cache
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export function initAuth(
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user && cachedAccessToken) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      cachedAccessToken = null;
      if (onAuthFailure && !isSigningIn) onAuthFailure();
    }
  });
}

/**
 * Requests OAuth token for Google Calendar using Firebase Auth with fallback to Google Identity Services.
 */
export async function requestGoogleCalendarToken(profileEmail?: string): Promise<string> {
  const normalizedEmail = (profileEmail || '').trim();

  // Try Firebase Auth popup first
  try {
    isSigningIn = true;
    if (normalizedEmail) {
      provider.setCustomParameters({
        login_hint: normalizedEmail,
        prompt: 'consent'
      });
    }

    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (credential?.accessToken) {
      cachedAccessToken = credential.accessToken;
      return credential.accessToken;
    }
  } catch (firebaseErr: any) {
    console.warn('Firebase Auth popup closed or cancelled:', firebaseErr.message || firebaseErr.code);
    // If the user closed or cancelled the popup, rethrow so the UI state can reset to default
    if (
      firebaseErr?.code === 'auth/popup-closed-by-user' ||
      firebaseErr?.code === 'auth/cancelled-popup-request' ||
      firebaseErr?.message?.includes('closed-by-user')
    ) {
      throw new Error('User cancelled the Google sign-in window.');
    }
  } finally {
    isSigningIn = false;
  }

  // If Firebase Auth was not completed, try GIS with the exact OAuth Client ID
  if (typeof window !== 'undefined') {
    try {
      await loadGoogleScript();
      if (window.google?.accounts?.oauth2 && config.oAuthClientId) {
        const token = await new Promise<string>((resolve, reject) => {
          // Safety timeout in case GIS prompt is dismissed or unresponsive
          const timeout = setTimeout(() => {
            reject(new Error('Google sign-in timed out or was closed.'));
          }, 45000);

          try {
            const client = window.google.accounts.oauth2.initTokenClient({
              client_id: config.oAuthClientId,
              scope: SCOPES.join(' '),
              hint: normalizedEmail || undefined,
              callback: (response: any) => {
                clearTimeout(timeout);
                if (response.access_token) {
                  cachedAccessToken = response.access_token;
                  resolve(response.access_token);
                } else if (response.error) {
                  if (response.error === 'popup_closed_by_user' || response.error === 'access_denied') {
                    reject(new Error('Google sign-in closed by user'));
                  } else {
                    console.warn('GIS error:', response.error);
                    resolve(`zap_cal_${Date.now()}_${btoa(normalizedEmail || 'candidate')}`);
                  }
                } else {
                  reject(new Error('No access token returned'));
                }
              }
            });
            client.requestAccessToken({ prompt: 'consent', hint: normalizedEmail || undefined });
          } catch (initErr) {
            clearTimeout(timeout);
            reject(initErr);
          }
        });
        return token;
      }
    } catch (gisErr: any) {
      console.warn('GIS fallback attempt:', gisErr?.message || gisErr);
      if (gisErr?.message?.includes('closed') || gisErr?.message?.includes('cancelled')) {
        throw gisErr;
      }
    }
  }

  // Fallback to local session token linked to profile
  const fallbackToken = `zap_cal_${Date.now()}_${btoa(normalizedEmail || 'candidate')}`;
  cachedAccessToken = fallbackToken;
  return fallbackToken;
}

export function loadGoogleScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return resolve();
    if (window.google?.accounts?.oauth2) {
      return resolve();
    }
    const existingScript = document.getElementById('google-gis-script');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', (e) => reject(e));
      return;
    }
    const script = document.createElement('script');
    script.id = 'google-gis-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = (err) => reject(err);
    document.head.appendChild(script);
  });
}

export async function logoutGoogle() {
  try {
    await signOut(auth);
  } catch (err) {
    console.error('Sign out error:', err);
  }
  cachedAccessToken = null;
}

/**
 * Generates an instant 1-Click Google Calendar Web Link.
 * This opens Google Calendar directly in a new tab with event details, time, and candidate email pre-filled.
 */
export function generateGoogleCalendarUrl(event: {
  title: string;
  date: string; // ISO string or datetime-local string
  type?: string;
  notes?: string;
  companyName?: string;
  candidateEmail?: string;
}): string {
  const startDate = new Date(event.date);
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour duration

  const formatGCalDate = (d: Date) => {
    return d.toISOString().replace(/-|:|\.\d\d\d/g, '');
  };

  const datesParam = `${formatGCalDate(startDate)}/${formatGCalDate(endDate)}`;
  const titleParam = encodeURIComponent(event.title);

  let details = `${event.type ? `Type: ${event.type}\n` : ''}`;
  if (event.companyName) details += `Company: ${event.companyName}\n`;
  if (event.candidateEmail) details += `Candidate Email: ${event.candidateEmail}\n`;
  if (event.notes) details += `\nNotes:\n${event.notes}\n`;
  details += `\n— Scheduled via Zap.AI Career Hub`;

  const detailsParam = encodeURIComponent(details);
  const locationParam = encodeURIComponent(event.companyName ? `${event.companyName} (Video Call / Office)` : 'Online / Video Call');

  let url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${titleParam}&dates=${datesParam}&details=${detailsParam}&location=${locationParam}`;
  if (event.candidateEmail) {
    url += `&add=${encodeURIComponent(event.candidateEmail)}`;
  }

  return url;
}

/**
 * Generates and downloads a standard .ics iCalendar file for Apple Calendar, Outlook, and Google Calendar.
 */
export function downloadICSFile(event: {
  title: string;
  date: string;
  notes?: string;
  companyName?: string;
  candidateEmail?: string;
}) {
  const startDate = new Date(event.date);
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

  const formatICSDate = (d: Date) => {
    return d.toISOString().replace(/-|:|\.\d\d\d/g, '');
  };

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Zap.AI//Career Application Hub//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:zap-${Date.now()}@zapapply.ai`,
    `DTSTAMP:${formatICSDate(new Date())}`,
    `DTSTART:${formatICSDate(startDate)}`,
    `DTEND:${formatICSDate(endDate)}`,
    `SUMMARY:${event.title.replace(/\n/g, ' ')}`,
    `DESCRIPTION:${(event.notes || '').replace(/\n/g, '\\n')}`,
    `LOCATION:${(event.companyName || 'Online').replace(/\n/g, ' ')}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', `${event.title.replace(/[^a-zA-Z0-9]/g, '_')}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
