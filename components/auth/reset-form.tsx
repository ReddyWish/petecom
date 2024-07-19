'use client';

import { AuthCard } from '@/components/auth/auth-card';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAction } from 'next-safe-action/hooks';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { FormSuccess } from '@/components/auth/form-success';
import { FormError } from '@/components/auth/form-error';
import { ResetPasswordSchema } from '@/app/types/resetPassword-schema';
import { resetPassword } from '@/server/actions/reset-password';

export const ResetPasswordForm = () => {
  const form = useForm({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { execute, status, result } = useAction(resetPassword, {
    onSuccess(data) {
      if (data?.error) setError(data.error);
      if (data?.success) setSuccess(data.success);
    },
  });

  const onSubmit = (values: z.infer<typeof ResetPasswordSchema>) => {
    execute(values);
  };

  return (
    <AuthCard
      cardTitle="Forgot the password?"
      backButtonHref="/auth/login"
      backButtonLabel="Back to login"
      showSocials={true}
    >
      <div>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Enter your email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="wagging@tail.com"
                        type="email"
                        autoComplete="email"
                        disabled={status === 'executing'}
                      />
                    </FormControl>
                    <FormDescription />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormSuccess message={success} />
              <FormError message={error} />

              <Button size={'sm'} variant={'link'} asChild>
                <Link href="/auth/reset">Back to Login</Link>
              </Button>
            </div>
            <Button
              type="submit"
              className={cn(
                'w-full my-2',
                status === 'executing' ? 'animate-pulse' : '',
              )}
              size={'sm'}
            >
              {'Reset password'}
            </Button>
          </form>
        </FormProvider>
      </div>
    </AuthCard>
  );
};
