'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useUser } from '@/lib/useUser';

export default function Header() {
  const user = useUser();
  const router = useRouter();

  async function handleSignOut() {
    await signOut(auth());
    router.push('/');
  }

  return (
    <header className="site">
      <Link href="/" className="logo">
        <span className="logo-dango">🍡</span>
        <span className="logo-word">POSTCHII</span>
      </Link>
      <div className="nav-glass">
        <a href="/#how">How it works</a>
        <a href="/#usecases">Use cases</a>
        <a href="/#features">Features</a>
        <a href="/#faq">FAQ</a>
      </div>
      <nav>
        {user ? (
          <>
            <Link href="/dashboard">Home</Link>
            <a onClick={handleSignOut}>Sign out</a>
          </>
        ) : user === null ? (
          <a href="/#early" className="nav-cta">
            Get early access
          </a>
        ) : null}
      </nav>
    </header>
  );
}
