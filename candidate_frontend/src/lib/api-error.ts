export type ApiErrorPayload = {
  code?: string;
  message?: string;
  details?: unknown;
  status?: number;
};

function extractMessageFromDetails(details: unknown): string | null {
  if (!details) return null;
  if (typeof details === 'string') return details;
  if (Array.isArray(details) && details.length > 0) {
    return String(details[0]);
  }
  if (typeof details === 'object') {
    const record = details as Record<string, unknown>;
    const firstKey = Object.keys(record)[0];
    if (firstKey) {
      const value = record[firstKey];
      if (Array.isArray(value) && value.length > 0) {
        return `${firstKey.replace(/_/g, ' ')}: ${String(value[0])}`;
      }
      if (typeof value === 'string') {
        return `${firstKey.replace(/_/g, ' ')}: ${value}`;
      }
    }
  }
  return null;
}

export function getApiErrorPayload(error: any): ApiErrorPayload {
  const status = error?.response?.status;
  const data = error?.response?.data;

  if (data?.error) {
    return {
      code: data.error.code,
      message: data.error.message,
      details: data.error.details,
      status,
    };
  }

  if (data?.message || data?.detail) {
    return {
      message: data.message ?? data.detail,
      details: data.details,
      status,
    };
  }

  return {
    message: error?.message,
    status,
  };
}

export function getApiErrorMessage(error: any, fallback: string): string {
  const payload = getApiErrorPayload(error);
  const fromDetails = extractMessageFromDetails(payload.details);
  return payload.message || fromDetails || fallback;
}
