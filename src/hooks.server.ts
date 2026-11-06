import { redirect } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit/hooks';

export const handle: Handle = async ({ event, resolve }) => {
	const session = event.cookies.get('edutest_session');
	const isLoginPage = event.url.pathname === '/login';
	const isLogout = event.url.pathname === '/logout';
	const isStaticOrFavicon =
		event.url.pathname.startsWith('/favicon') ||
		event.url.pathname.startsWith('/robots.txt') ||
		event.url.pathname.startsWith('/_app');

	// Jika belum login dan mengakses halaman yang dilindungi, redirect ke /login
	if (!session && !isLoginPage && !isLogout && !isStaticOrFavicon) {
		throw redirect(303, '/login');
	}

	// Jika sudah login dan mencoba membuka /login kembali, redirect ke dashboard /
	if (session && isLoginPage) {
		throw redirect(303, '/');
	}

	return resolve(event);
};
