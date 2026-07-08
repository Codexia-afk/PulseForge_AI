const DEFAULT_API_BASE_URL = 'http://127.0.0.1:8000';
const FALLBACK_API_BASE_URLS = [
  DEFAULT_API_BASE_URL,
  'http://127.0.0.1:8001',
  'http://127.0.0.1:8002',
  'http://127.0.0.1:8011'
];

const configuredApiBaseUrl = (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/$/, '');

export let API_BASE_URL = configuredApiBaseUrl;

const getCandidateApiBaseUrls = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return [configuredApiBaseUrl];
  }

  return Array.from(new Set([configuredApiBaseUrl, ...FALLBACK_API_BASE_URLS].map((url) => url.replace(/\/$/, ''))));
};

export const apiUrl = (path: string) =>
  `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

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

  for (const baseUrl of getCandidateApiBaseUrls()) {
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
    baseUrl: API_BASE_URL,
    error: errors.length > 0 ? errors.join(' | ') : 'Backend health check failed'
  };
};
