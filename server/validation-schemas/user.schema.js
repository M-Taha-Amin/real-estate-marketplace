import z from 'zod';

export const signUpSchema = z.object({
  email: z.email(),
  name: z.string().min(4),
  password: z.string().min(8),
});

export const signInSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export const updateSchema = z.object({
  name: z.string().min(4).optional(),
  email: z.email().optional(),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8),
  confirmPassword: z.string().min(8),
});
