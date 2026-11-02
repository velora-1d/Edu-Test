import { redirect, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params, url }) => {
	const slug = params.slug;
	const search = url.search;

	if (slug === 'tpa') {
		redirect(302, `/tpa${search}`);
	}
	if (slug === 'pesantren' || slug === 'rubrik') {
		redirect(302, `/rubrik${search}`);
	}
	if (slug === 'wawancara') {
		redirect(302, `/wawancara${search}`);
	}

	redirect(302, `/${search}`);
};

