import { z } from 'zod';

// Registration schema
export const registerSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must be less than 50 characters')
      .regex(
        /^[a-zA-Z\s'-]+$/,
        'Name can only contain letters, spaces, hyphens, and apostrophes'
      ),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email('Please provide a valid email')
      .max(100, 'Email must be less than 100 characters'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
  }),
});

// Login schema
export const loginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email('Please provide a valid email'),
    password: z.string().min(1, 'Password is required'),
  }),
});

// Note: Type exports removed - this is a JavaScript file
// If using TypeScript, rename to .ts and uncomment:
// export type RegisterInput = z.infer<typeof registerSchema>['body'];
// export type LoginInput = z.infer<typeof loginSchema>['body'];

