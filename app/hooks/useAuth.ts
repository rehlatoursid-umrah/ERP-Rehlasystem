import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const user = session?.user as { id: string; name: string; email: string; role: string } | undefined;

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPERADMIN';
  const isSuperadmin = user?.role === 'SUPERADMIN';

  return {
    user,
    session,
    status,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    isAdmin,
    isSuperadmin,
  };
}
