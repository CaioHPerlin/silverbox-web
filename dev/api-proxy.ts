import type { Plugin, ProxyOptions } from 'vite';

export const API_PROXY_PATH = '/__api';
const cookiePrefix = 'silverbox-dev.';

export function apiProxy(target: string): { plugin: Plugin; options: ProxyOptions } {
  const url = new URL(target);
  if (!/^https?:$/.test(url.protocol) || url.origin !== target) {
    throw new Error('VITE_API_URL must be an HTTP(S) origin without path or trailing slash');
  }

  return {
    plugin: {
      name: 'silverbox-local-api',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (!req.url?.match(/^\/__api(?:\/|\?|$)/)) return next();
          // Never turn another website's request into a trusted API request.
          const origin = req.headers.origin;
          if (req.headers['sec-fetch-site'] === 'cross-site' ||
              (origin && origin !== `http://${req.headers.host}` && origin !== `https://${req.headers.host}`)) {
            res.statusCode = 403;
            res.end('Use the API proxy from the local frontend origin');
            return;
          }
          next();
        });
      },
    },
    options: {
      target,
      changeOrigin: true,
      secure: true,
      rewrite: path => path.replace(/^\/__api(?=\/|\?|$)/, '') || '/',
      configure(proxy) {
        proxy.on('proxyReq', (outgoing, incoming) => {
          outgoing.setHeader('origin', target);
          outgoing.removeHeader('referer');
          // Forward only this proxy's cookies, never unrelated localhost cookies.
          const cookies = incoming.headers.cookie?.split(/;\s*/)
            .filter(cookie => cookie.startsWith(`${cookiePrefix}better-auth.`) ||
              cookie.startsWith(`${cookiePrefix}__Secure-better-auth.`) ||
              cookie.startsWith(`${cookiePrefix}__Host-better-auth.`))
            .map(cookie => cookie.slice(cookiePrefix.length)).join('; ');
          outgoing.removeHeader('cookie');
          if (cookies) outgoing.setHeader('cookie', cookies);
        });
        proxy.on('proxyRes', response => {
          // This translation exists only in Vite. Upstream HTTPS cookies stay Secure.
          // Keep HttpOnly, SameSite, expiry and the original signed cookie value.
          if (!response.headers['set-cookie']) return;
          response.headers['set-cookie'] = response.headers['set-cookie']
            .filter(cookie => /^(?:__Secure-|__Host-)?better-auth\./.test(cookie))
            .map(cookie => cookiePrefix + cookie
              .replace(/;\s*Secure(?=;|$)/gi, '')
              .replace(/;\s*Domain=[^;]*/gi, '')
              .replace(/;\s*Path=[^;]*/gi, '') + `; Path=${API_PROXY_PATH}`);
        });
      },
    },
  };
}
