"use client";

import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';
import { Button, Card, Description, FieldError, Form, Input, Label, TextField } from '@heroui/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { sanitizeRedirectPath } from '@/lib/auth-redirect';

function RegisterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register } = useAuth();
  const { showToast } = useToast();
  const redirectTo = sanitizeRedirectPath(searchParams.get('redirectTo'));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const form = e.currentTarget as HTMLFormElement & {
        name: { value: string };
        email: { value: string };
        password: { value: string };
      };
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const password = form.password.value;

      if (!name || !email || !password) {
        throw new Error('Please fill in all required fields.');
      }

      await register({ name, email, password });
      setSuccess('Account created successfully! Redirecting...');
      showToast('Account created successfully!', 'success', 2000);

      window.setTimeout(() => {
        router.replace(redirectTo);
      }, 1500);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setError(errorMsg);
      showToast(errorMsg, 'error', 4000);
      setIsLoading(false);
    }
  };

  return (
    <Card className="theme-section mx-auto mt-5 max-w-2xl px-4 py-8 md:px-8 md:py-10">
      <div>
        <h1 className="mb-2 text-center text-2xl font-bold md:text-3xl">Join Post Pilot AI</h1>
        <p className="mb-6 text-center text-slate-600">Create an account to share your community projects</p>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
            <p className="text-sm text-emerald-700">{success}</p>
          </div>
        )}

        <Form className="flex w-full mx-auto flex-col gap-4" onSubmit={onSubmit}>
          <TextField isRequired name="name" type="text">
            <Label>Full Name</Label>
            <Input placeholder="John Doe" disabled={isLoading} className="w-full" />
            <FieldError />
          </TextField>

          <TextField isRequired name="email" type="email" validate={(value: string) => {
            if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
              return 'Please enter a valid email address';
            }
            return null;
          }}>
            <Label>Email Address</Label>
            <Input placeholder="john@example.com" disabled={isLoading} className="w-full" />
            <FieldError />
          </TextField>

          <TextField isRequired minLength={6} name="password" type="password" validate={(value: string) => {
            if (value.length < 6) {
              return 'Password must be at least 6 characters';
            }
            if (!/[A-Z]/.test(value)) {
              return 'Password must contain at least one uppercase letter';
            }
            if (!/[a-z]/.test(value)) {
              return 'Password must contain at least one lowercase letter';
            }
            return null;
          }}>
            <Label>Password</Label>
            <Input placeholder="Create a strong password" disabled={isLoading} className="w-full" />
            <Description>Use at least 6 characters with uppercase and lowercase letters</Description>
            <FieldError />
          </TextField>

          <Button type="submit" className="theme-btn-primary w-full" isDisabled={isLoading}>
            {isLoading ? 'CREATING ACCOUNT...' : 'SIGN UP'}
          </Button>
        </Form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            Already have an account?
            <Link href={`/login${redirectTo !== '/' ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`} className="ml-1 font-semibold text-[var(--brand-emerald)] hover:text-[var(--brand-gold)]">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </Card>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="mx-auto mt-8 max-w-2xl px-4 text-center text-sm text-slate-600">Loading sign up page...</div>}>
      <RegisterPageContent />
    </Suspense>
  );
}
