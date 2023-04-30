import Head from 'next/head';
import Image from 'next/image';
import NextLink from 'next/link';
import { Inter } from 'next/font/google';
import styles from '@/styles/Home.module.css';
import { signIn, signOut, useSession } from 'next-auth/react';

const inter = Inter({ subsets: ['latin'] });

export default function Home() {
	const { data: session } = useSession();
	return (
		<>
			<Head>
				<title>Create Next App</title>
				<meta name="description" content="Example of Login and Security" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<header className={styles.header}>
				<nav>
					{session ? (
						<button onClick={() => signOut()}>Sign out</button>
					) : (
						<button onClick={() => signIn('zitadel', { callbackUrl: 'http://localhost:3000/' })}>Sign in</button>
					)}
				</nav>
			</header>

			<section className={`${styles.main} ${inter.className}`}>
				<article>
					<h1 className={styles.title}>Login and Security Example</h1>
					{session ? (
						<>
							<p className={styles.description}>
								Welcome to <code className={styles.code}>Login and Security Example</code>
							</p>
							<br />
							<br />
							<Image
								src={session.user?.picture}
								alt={session.user?.firstname}
								width={100}
								height={100}
								className={styles.avatar}
							/>
							<br />
							<span className={styles.name}>
								{session.user.firstname} {session.user.lastname}
							</span>
						</>
					) : (
						<p className={styles.description}>Please sign in to continue.</p>
					)}
				</article>
			</section>

			<footer className={styles.footer}>
				<p className="flex-1">
					Made with{' ❤️ '}
					by{' '}
					<NextLink href="https://github.com/flxtagi" target="_blank">
						Felix Adam
					</NextLink>{' '}
					and{' '}
					<NextLink href="https://github.com/rudigier" target="_blank">
						Jürgen Rudigier
					</NextLink>
					.
				</p>
			</footer>
		</>
	);
}
