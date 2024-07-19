'use server';

import { passwordResetTokens, twoFactorTokens, users } from '@/server/schema';
import { eq } from 'drizzle-orm';
import { db } from '@/server';

export const getVerificationTokenByEmail = async (token: string) => {
  try {
    const verificationToken = await db.query.twoFactorTokens.findFirst({
      where: eq(twoFactorTokens.token, token),
    });
    return verificationToken;
  } catch (error) {
    return { error: null };
  }
};

export const generateEmailVerificationToken = async (email: string) => {
  const token = crypto.randomUUID();
  const expires = new Date(new Date().getTime() + 3600 * 1000);

  const existingToken = await getVerificationTokenByEmail(token);

  if (existingToken && 'id' in existingToken) {
    await db
      .delete(twoFactorTokens)
      .where(eq(twoFactorTokens.id, existingToken.id));
  }

  const verificationToken = await db
    .insert(twoFactorTokens)
    .values({
      email,
      token,
      expires,
    })
    .returning();

  return verificationToken;
};

export const newVerification = async (token: string) => {
  const existingToken = await getVerificationTokenByEmail(token);

  if ((existingToken && 'error' in existingToken) || !existingToken) {
    return { error: 'Token not found' };
  }

  const hasExpired = new Date(existingToken?.expires) < new Date();

  if (hasExpired) {
    return { error: 'Token has expired' };
  }

  if (!existingToken) return { error: 'Token not found' };

  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, existingToken?.email),
  });

  if (!existingUser) return { error: 'Email does not exists' };

  if (existingUser.emailVerified) {
    return { error: 'Email already verified' };
  }

  await db.update(users).set({
    emailVerified: new Date(),
    email: existingToken.email,
  });

  await db
    .delete(twoFactorTokens)
    .where(eq(twoFactorTokens.id, existingToken.id));

  return { success: 'Email verified' };
};

export const getResetPasswordTokenByToken = async (token: string) => {
  try {
    const passwordResetToken = await db.query.passwordResetTokens.findFirst({
      where: eq(passwordResetTokens.token, token),
    });
    return passwordResetToken;
  } catch (error) {
    return { error: null };
  }
};

export const getResetPasswordTokenByEmail = async (email: string) => {
  try {
    const passwordResetToken = await db.query.passwordResetTokens.findFirst({
      where: eq(passwordResetTokens.email, email),
    });
    return passwordResetToken;
  } catch (error) {
    return { error: null };
  }
};

export const generatePasswordResetToken = async (email: string) => {
  try {
    const token = crypto.randomUUID();
    if (!token) return { error: 'Error when generating token' };
    const expires = new Date(new Date().getTime() + 3600 * 1000);
    const existingToken = await getResetPasswordTokenByEmail(email);
    if (existingToken && !('error' in existingToken)) {
      await db
        .delete(passwordResetTokens)
        .where(eq(passwordResetTokens.id, existingToken.id));
    }
    const passwordResetToken = await db
      .insert(passwordResetTokens)
      .values({
        email,
        token,
        expires,
      })
      .returning();
    return passwordResetToken;
  } catch (err) {
    return { error: 'There is an error when generating token' };
  }
};
