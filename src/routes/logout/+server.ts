import { redirect, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = ({ cookies }) => {
	cookies.delete('edutest_session', { path: '/' });
	throw redirect(303, '/login');
};

export const POST: RequestHandler = ({ cookies }) => {
	cookies.delete('edutest_session', { path: '/' });
	throw redirect(303, '/login');
};
