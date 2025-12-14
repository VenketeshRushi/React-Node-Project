export const buildQueryString = (
  params: Record<
    string,
    string | number | boolean | Array<string | number | boolean>
  >
): string => {
  const query = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return value
          .map(
            v => `${encodeURIComponent(key)}[]=${encodeURIComponent(String(v))}`
          )
          .join('&');
      }
      return `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`;
    })
    .join('&');

  return query ? `?${query}` : '';
};

export const parseQueryString = (
  queryString: string
): Record<string, string | string[]> => {
  const params: Record<string, string | string[]> = {};
  const query = queryString.replace(/^\?/, '');

  if (!query) return params;

  query.split('&').forEach(param => {
    // Provide default empty strings to avoid undefined
    const [rawKey = '', rawValue = ''] = param.split('=');

    // Only proceed if key exists
    if (!rawKey) return;

    const key = decodeURIComponent(rawKey);
    const value = decodeURIComponent(rawValue);

    if (key.endsWith('[]')) {
      const arrayKey = key.slice(0, -2);
      if (!params[arrayKey]) {
        params[arrayKey] = [];
      }
      (params[arrayKey] as string[]).push(value);
    } else {
      params[key] = value;
    }
  });

  return params;
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
