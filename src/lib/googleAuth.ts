// Helper to interact with Google Identity Services for client-side OAuth token acquisition

declare global {
  interface Window {
    google?: any;
  }
}

export interface GoogleAuthToken {
  accessToken: string;
  expiresIn: number;
  obtainedAt: number;
}

let tokenClient: any = null;

export function loadGoogleScript(): Promise<void> {
  return new Promise((resolve, reject) => {
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

export async function requestGoogleCalendarToken(): Promise<string> {
  await loadGoogleScript();

  return new Promise((resolve, reject) => {
    try {
      if (!window.google?.accounts?.oauth2) {
        return reject(new Error('Google Identity Services client failed to load.'));
      }

      // Initialize token client without needing hardcoded secret
      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: '86845c19-92fa-4295-907a-9fcd21acd169.apps.googleusercontent.com', // AI Studio workspace OAuth client ID placeholder or implicit scope prompt
        scope: 'https://www.googleapis.com/auth/calendar.events',
        callback: (response: any) => {
          if (response.error) {
            return reject(new Error(response.error_description || response.error));
          }
          if (response.access_token) {
            resolve(response.access_token);
          } else {
            reject(new Error('No access token received from Google.'));
          }
        },
      });

      tokenClient.requestAccessToken({ prompt: 'consent' });
    } catch (err) {
      reject(err);
    }
  });
}
