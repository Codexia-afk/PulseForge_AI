const LOCAL_API_BASE_URL = 'http://127.0.0.1:8000';
const LOCAL_FALLBACK_API_BASE_URLS = [
  LOCAL_API_BASE_URL,
  'http://127.0.0.1:8001',
  'http://127.0.0.1:8002',
  'http://127.0.0.1:8011'
];

const configuredApiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/$/, '');
const isDevelopment = import.meta.env.DEV;

export const isApiBaseUrlConfigured = Boolean(configuredApiBaseUrl);
export let API_BASE_URL = configuredApiBaseUrl || (isDevelopment ? LOCAL_API_BASE_URL : '');
export const API_BASE_URL_LABEL = API_BASE_URL || 'Not configured';

const getCandidateApiBaseUrls = () => {
  if (configuredApiBaseUrl) {
    return [configuredApiBaseUrl];
  }

  if (!isDevelopment) {
    return [];
  }

  return Array.from(new Set(LOCAL_FALLBACK_API_BASE_URLS.map((url) => url.replace(/\/$/, ''))));
};

export const apiUrl = (path: string) => {
  if (!API_BASE_URL) {
    throw new Error('Backend URL is not configured. Set VITE_API_BASE_URL to enable Live Intelligence.');
  }

  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
};

export interface BackendHealthResult {
  ok: boolean;
  status: 'online' | 'offline';
  checkedAt: string;
  baseUrl: string;
  data?: any;
  error?: string;
}

export const fetchWithTimeout = async (
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeoutMs = 5000
) => {
  const controller = new AbortController();
  const abortFromCaller = () => controller.abort();
  if (init.signal) {
    if (init.signal.aborted) {
      controller.abort();
    } else {
      init.signal.addEventListener('abort', abortFromCaller, { once: true });
    }
  }
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal
    });
  } finally {
    window.clearTimeout(timeoutId);
    init.signal?.removeEventListener('abort', abortFromCaller);
  }
};

export const checkBackendHealth = async (): Promise<BackendHealthResult> => {
  const checkedAt = new Date().toISOString();
  const errors: string[] = [];
  const candidates = getCandidateApiBaseUrls();

  if (candidates.length === 0) {
    return {
      ok: false,
      status: 'offline',
      checkedAt,
      baseUrl: API_BASE_URL_LABEL,
      error: 'Backend URL is not configured. Add VITE_API_BASE_URL in Vercel to enable Live Intelligence.'
    };
  }

  for (const baseUrl of candidates) {
    try {
      const response = await fetchWithTimeout(`${baseUrl}/api/health`, {}, 1500);

      if (!response.ok) {
        errors.push(`${baseUrl}: HTTP ${response.status}`);
        continue;
      }

      const data = await response.json();
      API_BASE_URL = baseUrl;
      return {
        ok: data?.status === 'ok' || data?.backend === 'online' || response.ok,
        status: 'online',
        checkedAt,
        baseUrl,
        data
      };
    } catch (err) {
      const isAbort = (err as Error).name === 'AbortError';
      errors.push(`${baseUrl}: ${isAbort ? 'timed out' : ((err as Error).message || 'health check failed')}`);
    }
  }

  return {
    ok: false,
    status: 'offline',
    checkedAt,
    baseUrl: API_BASE_URL_LABEL,
    error: errors.length > 0 ? errors.join(' | ') : 'Backend health check failed'
  };
};
