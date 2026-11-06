import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies }) => {
	const sessionStr = cookies.get('edutest_session');
	let user = null;
	if (sessionStr) {
		try {
			user = JSON.parse(sessionStr);
		} catch {
			user = { email: sessionStr };
		}
	}
	return { user };
};
