import * as z from 'zod';

export const RegisterSchema = z.object({
  email: z.string().email({
    message: 'Invalid email address',
  }),
  password: z.string().min(8, {
    message: 'Password must be at least 8 characters long',
  }),
  name: z
    .string()
    .min(3, { message: 'Please add a name with a least 3 characters' }),
});
