'use server';
import { createSafeActionClient } from 'next-safe-action';
import { LoginSchema } from '@/app/types/login-schema';
import { db } from '@/server';
import { eq } from 'drizzle-orm';
import { users } from '@/server/schema';
import { generateEmailVerificationToken } from '@/server/actions/tokens';
import { sendVerificationEmail } from '@/server/actions/email';
import { signIn } from '../auth';
import { AuthError } from 'next-auth';

const action = createSafeActionClient();

export const emailSignIn = action(
  LoginSchema,
  async ({ email, password, code }) => {
    try {
      //Check if the user is in the database
      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, email),
      });

      if (existingUser?.email !== email) {
        return { error: 'Email not found' };
      }

      //if the user is not verified
      if (!existingUser?.emailVerified) {
        const verificationToken = await generateEmailVerificationToken(
          existingUser.email,
        );
        await sendVerificationEmail(
          verificationToken[0].email,
          verificationToken[0].token,
        );
        return { success: 'Confirmation email sent' };
      }

      await signIn('credentials', {
        email,
        password,
        redirectTo: '/',
      });

      return { success: email };
    } catch (error) {
      if (error instanceof AuthError) {
        switch (error.type) {
          case 'CredentialsSignin':
            return { error: 'Email or Password Incorrect' };
          case 'AccessDenied':
            return { error: error.message };
          case 'OAuthSignInError':
            return { error: error.message };
          default:
            return { error: 'Smth went wrong' };
        }
      }
      throw error;
    }
  },
);
