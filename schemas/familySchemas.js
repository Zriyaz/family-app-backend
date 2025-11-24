import { z } from 'zod';

const relationshipEnum = z.enum(['Spouse', 'Child', 'Parent', 'Sibling', 'Other']);

// Create family member schema
export const createFamilyMemberSchema = z.object({
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
    relationship: relationshipEnum,
    age: z
      .coerce
      .number()
      .int('Age must be an integer')
      .min(0, 'Age must be a positive number')
      .max(150, 'Age must be less than 150')
      .optional(),
  }),
});

// Update family member schema
export const updateFamilyMemberSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'ID is required'),
  }),
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must be less than 50 characters')
      .regex(
        /^[a-zA-Z\s'-]+$/,
        'Name can only contain letters, spaces, hyphens, and apostrophes'
      )
      .optional(),
    relationship: relationshipEnum.optional(),
    age: z
      .coerce
      .number()
      .int('Age must be an integer')
      .min(0, 'Age must be a positive number')
      .max(150, 'Age must be less than 150')
      .optional(),
  }),
});

// Delete family member schema
export const deleteFamilyMemberSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'ID is required'),
  }),
});

// Note: Type exports removed - this is a JavaScript file
// If using TypeScript, rename to .ts and uncomment:
// export type CreateFamilyMemberInput = z.infer<typeof createFamilyMemberSchema>['body'];
// export type UpdateFamilyMemberInput = z.infer<typeof updateFamilyMemberSchema>['body'];

