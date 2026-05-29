import Cookies from 'js-cookie';

export const setAuthTokens = (accessToken: string, refreshToken: string) => {
  Cookies.set('accessToken', accessToken, { expires: 1, path: '/', secure: process.env.NODE_ENV === 'production', sameSite: 'Lax' });
  Cookies.set('refreshToken', refreshToken, { expires: 7, path: '/', secure: process.env.NODE_ENV === 'production', sameSite: 'Lax' });
};

export const getAccessToken = () => {
  return Cookies.get('accessToken');
};

export const getRefreshToken = () => {
  return Cookies.get('refreshToken');
};

export const removeAuthTokens = () => {
  Cookies.remove('accessToken', { path: '/' });
  Cookies.remove('refreshToken', { path: '/' });
};
