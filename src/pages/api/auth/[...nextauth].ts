import NextAuth, { NextAuthOptions } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import { Issuer } from 'openid-client';
import { Profile } from '../../../types/Profile';

const refreshAccessToken = async (token: JWT): Promise<JWT> => {
	try {
		const issuer = await Issuer.discover(process.env.ZITADEL_ISSUER ?? '');
		const client = new issuer.Client({
			id: 'zitadel',
			name: 'zitadel',
			type: 'oauth',
			version: '2',
			wellKnown: process.env.ZITADEL_ISSUER,
			authorization: {
				params: {
					scope: `openid email profile offline_access`,
				},
			},
			idToken: true,
			checks: ['pkce', 'state'],
			token_endpoint_auth_method: 'none',
			client_id: process.env.ZITADEL_CLIENT_ID as string,
		});

		const { refresh_token, access_token, expires_at } = await client.refresh(token.refreshToken as string);

		return {
			...token,
			accessToken: access_token,
			expiresAt: (expires_at ?? 0) * 1000,
			refreshToken: refresh_token, // Fall back to old refresh token
		};
	} catch (error) {
		console.error('Error during refreshAccessToken', error);

		return {
			...token,
			error: 'RefreshAccessTokenError',
		};
	}
};

export const authOptions: NextAuthOptions = {
	providers: [
		{
			id: 'zitadel',
			name: 'zitadel',
			type: 'oauth',
			version: '2',
			wellKnown: process.env.ZITADEL_ISSUER,
			authorization: {
				params: {
					scope: `openid email profile offline_access`,
				},
			},
			idToken: true,
			checks: ['pkce', 'state'],
			client: {
				token_endpoint_auth_method: 'none',
			},
			async profile(_, { access_token }) {
				const { userinfo_endpoint } = await (
					await fetch(`${process.env.ZITADEL_ISSUER}/.well-known/openid-configuration`)
				).json();

				const profile = await (
					await fetch(userinfo_endpoint, {
						headers: {
							Authorization: `Bearer ${access_token}`,
						},
					})
				).json();

				return {
					id: profile.sub,
					firstname: profile.given_name,
					lastname: profile.family_name,
					email: profile.email,
					picture: profile.picture,
					username: profile.preferred_username,
					avatarUrl: profile.picture || undefined,
				} as Profile;
			},
			clientId: process.env.ZITADEL_CLIENT_ID,
		},
	],
	session: {
		maxAge: 12 * 60 * 60, // 12 hours
	},
	callbacks: {
		async jwt({ token, user, account }) {
			if (account) {
				token.accessToken = account.access_token;
				token.refreshToken = account.refresh_token;
				token.expiresAt = (account.expires_at as number) * 1000;
				token.error = undefined;
			}

			if (user) {
				token.user = user as Profile;
			}

			// Return previous token if the access token has not expired yet
			if (Date.now() < (token.expiresAt as number)) {
				return token;
			}

			// if the access token has expired, try to update it
			if (token.refreshToken) {
				const newToken = await refreshAccessToken(token);

				if (!newToken.error) {
					return newToken;
				}
			}

			delete token.accessToken;

			return token;
		},
		async session({ session, token }) {
			session.user = token.user as Profile;
			session.accessToken = token.accessToken;
			return session;
		},
	},

	secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
