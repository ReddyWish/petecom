import { auth } from '@/server/auth';
import UserButton from '@/components/navigation/user-button';
import Logo from '@/components/navigation/logo';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { LogIn } from 'lucide-react';

export default async function Nav() {
  const session = await auth();

  return (
    <header className="py-3">
      <nav>
        <ul className="flex justify-between">
          <li>
            <Link href="/">
              <Logo />
            </Link>
          </li>
          {!session ? (
            <li className="my-auto pr-4">
              <Button asChild>
                <Link
                  aria-label="sign-in"
                  className="flex gap-2"
                  href={'/auth/login'}
                >
                  <LogIn /> <span>Login</span>{' '}
                </Link>
              </Button>
            </li>
          ) : (
            <li>
              <UserButton
                expires={session?.expires || ''}
                user={session?.user}
              />
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
}
