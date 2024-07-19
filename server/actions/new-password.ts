'use server';
import { createSafeActionClient } from 'next-safe-action';
import { NewPasswordSchema } from '@/app/types/newPassword-schema';
import { getResetPasswordTokenByToken } from '@/server/actions/tokens';
import { db } from '@/server';
import { eq } from 'drizzle-orm';
import { passwordResetTokens, users } from '@/server/schema';
import { Pool } from '@neondatabase/serverless';
import bcrypt from 'bcrypt';
import { drizzle } from 'drizzle-orm/neon-serverless';

const action = createSafeActionClient();

export const newPassword = action(
  NewPasswordSchema,
  async ({ password, token }) => {
    const pool = new Pool({ connectionString: process.env.POSTGRES_URL });
    const dbPool = drizzle(pool);
    if (!token) return { error: 'Token is required' };
    const existingToken = await getResetPasswordTokenByToken(token);
    if ((existingToken && 'error' in existingToken) || !existingToken)
      return { error: 'Token not found' };
    const hasExpired = new Date(existingToken.expires) < new Date();
    if (hasExpired) return { error: 'Token has expired' };
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, existingToken.email),
    });
    if (!existingUser) return { error: 'User not found' };
    const hashedNewPassword = await bcrypt.hash(password, 10);
    //Transaction implementation
    await dbPool.transaction(async (tx) => {
      await tx
        .update(users)
        .set({
          password: hashedNewPassword,
        })
        .where(eq(users.id, existingUser.id));
      await tx
        .delete(passwordResetTokens)
        .where(eq(passwordResetTokens.id, existingToken.id));
    });
    return { success: 'Password updated' };
  },
);
