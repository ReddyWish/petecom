'use server';

import { createSafeActionClient } from 'next-safe-action';
import { ResetPasswordSchema } from '@/app/types/resetPassword-schema';
import { generatePasswordResetToken } from '@/server/actions/tokens';
import { db } from '@/server';
import { users } from '@/server/schema';
import { eq } from 'drizzle-orm';
import { sendResetPasswordLinkEmail } from '@/server/actions/email';

const action = createSafeActionClient();

export const resetPassword = action(ResetPasswordSchema, async ({ email }) => {
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });
  if (!existingUser) return { error: 'User not found' };
  const passwordResetToken = await generatePasswordResetToken(email);
  if (
    (passwordResetToken && 'error' in passwordResetToken) ||
    !passwordResetToken
  )
    return { error: 'Token not generated' };
  await sendResetPasswordLinkEmail(
    passwordResetToken[0].email,
    passwordResetToken[0].token,
  );
  return { success: 'Reset Email Sent' };
});
