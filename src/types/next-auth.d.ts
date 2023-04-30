import 'next-auth/jwt';

import { Profile } from './Profile';

declare module 'next-auth' {
	interface Session {
		accessToken?: string;
		user: Profile;
	}
}

declare module 'next-auth/jwt' {
	interface JWT {
		accessToken?: string;
		user?: Profile;
	}
}
