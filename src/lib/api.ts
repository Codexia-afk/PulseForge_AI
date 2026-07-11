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
export const HEALTH_CHECK_TIMEOUT_MS = 65000;
export const HEALTH_CHECK_RETRY_INTERVAL_MS = 5000;
export const HEALTH_CHECK_RETRY_WINDOW_MS = 60000;

const getCandidateApiBaseUrls = () => {
  if (configuredApiBaseUrl) {
    return [configuredApiBaseUrl];
  }

  if (!isDevelopment) {
    return [];
  }

  return Array.from(new Set(LOCAL_FALLBACK_API_BASE_URLS.map((url) => url.replace(/\/$/, ''))));
};

const joinApiPath = (baseUrl: string, path: string) => {
  const normalizedBaseUrl = baseUrl.replace(/\/$/, '');
  let normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (normalizedBaseUrl.endsWith('/api') && normalizedPath.startsWith('/api/')) {
    normalizedPath = normalizedPath.slice('/api'.length);
  }

  return `${normalizedBaseUrl}${normalizedPath}`;
};

export const getHealthCheckUrl = (baseUrl = API_BASE_URL) => {
  if (!baseUrl) return '';
  return joinApiPath(baseUrl, '/api/health');
};

export const apiUrl = (path: string) => {
  if (!API_BASE_URL) {
    throw new Error('Backend URL is not configured. Set VITE_API_BASE_URL to enable Live Intelligence.');
  }

  return joinApiPath(API_BASE_URL, path);
};

export interface BackendHealthResult {
  ok: boolean;
  status: 'online' | 'offline' | 'waking';
  checkedAt: string;
  baseUrl: string;
  healthUrl?: string;
  data?: any;
  error?: string;
  errorType?: 'timeout' | 'cors' | 'network' | 'http' | 'configuration' | 'unknown';
  attempts?: number;
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

const sleep = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

const describeFetchError = (
  err: unknown,
  healthUrl: string
): Pick<BackendHealthResult, 'error' | 'errorType'> => {
  const error = err as Error;
  const message = error?.message || 'health check failed';

  if (error?.name === 'AbortError') {
    return {
      errorType: 'timeout',
      error: `Timeout: backend did not respond within ${Math.round(HEALTH_CHECK_TIMEOUT_MS / 1000)} seconds at ${healthUrl}.`
    };
  }

  if (error instanceof TypeError) {
    const isOffline = typeof navigator !== 'undefined' && navigator.onLine === false;
    const isLikelyCors = !isOffline && /failed to fetch|load failed|networkerror/i.test(message);
    return {
      errorType: isOffline || !isLikelyCors ? 'network' : 'cors',
      error: isLikelyCors
        ? `CORS error: browser blocked the health check at ${healthUrl}. Confirm the backend CORS allowlist includes this frontend origin.`
        : `Network error: ${message}`
    };
  }

  return {
    errorType: 'unknown',
    error: message
  };
};

export const checkBackendHealth = async (): Promise<BackendHealthResult> => {
  const startedAt = Date.now();
  let checkedAt = new Date().toISOString();
  const errors: string[] = [];
  const candidates = getCandidateApiBaseUrls();
  let attempts = 0;
  let lastErrorType: BackendHealthResult['errorType'];

  if (candidates.length === 0) {
    return {
      ok: false,
      status: 'offline',
      checkedAt,
      baseUrl: API_BASE_URL_LABEL,
      errorType: 'configuration',
      error: 'Backend URL is not configured. Add VITE_API_BASE_URL in Vercel to enable Live Intelligence.'
    };
  }

  if (isDevelopment) {
    candidates.forEach((baseUrl) => {
      console.info('[PulseForge API] Base URL:', baseUrl);
      console.info('[PulseForge API] Health URL:', getHealthCheckUrl(baseUrl));
    });
  }

  for (const baseUrl of candidates) {
    const healthUrl = getHealthCheckUrl(baseUrl);

    while (Date.now() - startedAt <= HEALTH_CHECK_RETRY_WINDOW_MS || attempts === 0) {
      attempts += 1;
      checkedAt = new Date().toISOString();

      try {
        const response = await fetchWithTimeout(healthUrl, {}, HEALTH_CHECK_TIMEOUT_MS);

        if (!response.ok) {
          lastErrorType = 'http';
          errors.push(`${healthUrl}: HTTP ${response.status}`);
          await sleep(HEALTH_CHECK_RETRY_INTERVAL_MS);
          continue;
        }

        const data = await response.json();
        API_BASE_URL = baseUrl;
        return {
          ok: data?.status === 'ok' || data?.backend === 'online' || response.ok,
          status: 'online',
          checkedAt,
          baseUrl,
          healthUrl,
          data,
          attempts
        };
      } catch (err) {
        const described = describeFetchError(err, healthUrl);
        lastErrorType = described.errorType;
        errors.push(`${healthUrl}: ${described.error}`);
        await sleep(HEALTH_CHECK_RETRY_INTERVAL_MS);
      }
    }
  }

  return {
    ok: false,
    status: 'offline',
    checkedAt,
    baseUrl: API_BASE_URL_LABEL,
    healthUrl: API_BASE_URL ? getHealthCheckUrl(API_BASE_URL) : undefined,
    errorType: lastErrorType,
    attempts,
    error: errors.length > 0 ? errors.join(' | ') : 'Backend health check failed'
  };
};
