import { fail, redirect, type Actions, type ServerLoad } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export const load: ServerLoad = async ({ cookies }) => {
	const session = cookies.get('edutest_session');
	if (session) {
		throw redirect(303, '/');
	}
	return {};
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const formData = await request.formData();
		const email = formData.get('email')?.toString().trim().toLowerCase();
		const password = formData.get('password')?.toString();
		const rememberMe = formData.get('rememberMe') === 'true';

		if (!email || !password) {
			return fail(400, {
				missing: true,
				message: 'Email dan kata sandi wajib diisi.'
			});
		}

		// Query akun pengguna langsung dari database Neon PostgreSQL
		const userList = await db.select().from(users).where(eq(users.email, email)).limit(1);
		const user = userList[0];

		if (!user) {
			return fail(401, {
				invalid: true,
				message: 'Email atau kata sandi salah. Silakan coba kembali.'
			});
		}

		if (!user.isActive) {
			return fail(403, {
				inactive: true,
				message: 'Akun ini telah dinonaktifkan oleh administrator.'
			});
		}

		// Verifikasi kecocokan hash password dengan bcrypt
		const isMatch = bcrypt.compareSync(password, user.passwordHash);
		if (!isMatch) {
			return fail(401, {
				invalid: true,
				message: 'Email atau kata sandi salah. Silakan coba kembali.'
			});
		}

		// Set secure cookie session dari data database
		const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24;

		cookies.set(
			'edutest_session',
			JSON.stringify({
				id: user.id,
				email: user.email,
				name: user.name,
				role: user.role,
				loggedInAt: new Date().toISOString()
			}),
			{
				path: '/',
				httpOnly: true,
				sameSite: 'lax',
				secure: false, // Kompatibel lokal dan HTTPS Cloudflare
				maxAge
			}
		);

		throw redirect(303, '/');
	}
};
