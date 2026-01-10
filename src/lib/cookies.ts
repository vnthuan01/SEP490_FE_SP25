import Cookies from 'js-cookie';

export function setAuthToken(token: string, rememberMe?: boolean) {
  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
  Cookies.set('auth-token', token, {
    expires: rememberMe ? 30 : undefined,
    sameSite: 'lax',
    secure: isHttps,
    path: '/',
  });
}

export function getAuthToken(): string | null {
  return Cookies.get('auth-token') || null;
}

export function setRefreshToken(token: string, rememberMe?: boolean) {
  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
  Cookies.set('refresh-token', token, {
    expires: rememberMe ? 30 : 7,
    sameSite: 'lax',
    secure: isHttps,
    path: '/',
  });
}

export function getRefreshToken(): string | null {
  return Cookies.get('refresh-token') || null;
}

export function clearAuthToken() {
  Cookies.remove('auth-token', { path: '/' });
  Cookies.remove('refresh-token', { path: '/' });
}
