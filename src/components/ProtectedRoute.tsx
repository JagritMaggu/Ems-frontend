'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import toast from 'react-hot-toast';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = useSelector((state: RootState) => state.auth.token);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !token) {
      toast.error('Please log in to continue');
      router.push('/login');
    }
  }, [token, router, mounted]);

  if (!mounted) {
    return null; // Match server render
  }

  if (!token) {
    return null; // Match while redirecting
  }

  return <>{children}</>;
}
