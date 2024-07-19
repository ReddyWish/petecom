'use server';

import { createSafeActionClient } from 'next-safe-action';
import { RegisterSchema } from '@/app/types/register-schema';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { users } from '@/server/schema';
import { db } from '@/server';
import { generateEmailVerificationToken } from '@/server/actions/tokens';
import { sendVerificationEmail } from '@/server/actions/email';

const action = createSafeActionClient();

export const emailRegister = action(
  RegisterSchema,
  async ({ name, email, password }) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    //check if email is already in database
    if (existingUser) {
      if (!existingUser.emailVerified) {
        const verificationToken = await generateEmailVerificationToken(email);
        await sendVerificationEmail(
          verificationToken[0].email,
          verificationToken[0].token,
        );
        return { success: 'Email Confirmation resent' };
      }
      return { error: 'Email already in use' };
    }

    //Logic for when user is not registered
    await db.insert(users).values({
      email,
      name,
      password: hashedPassword,
    });

    const verificationToken = await generateEmailVerificationToken(email);

    await sendVerificationEmail(
      verificationToken[0].email,
      verificationToken[0].token,
    );

    return { success: 'Confirmation Email Sent' };
  },
);
