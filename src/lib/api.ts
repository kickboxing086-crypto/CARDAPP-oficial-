
export const getApiUrl = (path: string): string => {
  let baseUrl = import.meta.env.VITE_API_URL || '';
  
  if (typeof window !== 'undefined') {
    // If we are in the browser on a production domain, but VITE_API_URL points to localhost, ignore it!
    const isLocalApi = baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1') || baseUrl.includes('3000');
    const isLocalBrowser = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.includes('192.168.');
    if (isLocalApi && !isLocalBrowser) {
      console.warn('[API] Ignoring localhost VITE_API_URL on production domain.');
      baseUrl = '';
    }
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
};

export const getAuthHeaders = () => {
  const token = localStorage.getItem('admin_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};
