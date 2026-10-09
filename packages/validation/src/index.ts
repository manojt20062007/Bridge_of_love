import { z } from 'zod';

// ==========================================
// Regex & Common Validators
// ==========================================
export const indianMobileRegex = /^[6-9]\d{9}$/;
export const indianPanRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
export const indianPinCodeRegex = /^[1-9][0-9]{5}$/;

export const emailValidator = z
  .string()
  .trim()
  .email('Please enter a valid email address')
  .max(150, 'Email cannot exceed 150 characters');

export const mobileValidator = z
  .string()
  .trim()
  .regex(indianMobileRegex, 'Please enter a valid 10-digit Indian mobile number starting with 6-9');

export const panValidator = z
  .string()
  .trim()
  .toUpperCase()
  .regex(indianPanRegex, 'Invalid PAN format. Expected format: ABCDE1234F')
  .optional()
  .or(z.literal(''));

export const passwordValidator = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(64, 'Password cannot exceed 64 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

// ==========================================
// Auth Schemas
// ==========================================
export const RegisterSchema = z
  .object({
    fullName: z.string().trim().min(3, 'Full name must be at least 3 characters').max(100),
    email: emailValidator,
    mobile: mobileValidator,
    password: passwordValidator,
    confirmPassword: z.string(),
    address: z.string().trim().max(255).optional().or(z.literal('')),
    city: z.string().trim().max(100).optional().or(z.literal('')),
    state: z.string().trim().max(100).optional().or(z.literal('')),
    postalCode: z.string().trim().regex(indianPinCodeRegex, 'Invalid 6-digit PIN code').optional().or(z.literal('')),
    panNumber: panValidator,
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: 'You must accept the terms and privacy policy to register',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterInput = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: emailValidator,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordValidator,
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'New passwords do not match',
    path: ['confirmNewPassword'],
  });

export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;

export const ForgotPasswordSchema = z.object({
  email: emailValidator,
});

export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;

export const ResetPasswordSchema = z
  .object({
    token: z.string().min(10, 'Reset token is required'),
    newPassword: passwordValidator,
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'New passwords do not match',
    path: ['confirmNewPassword'],
  });

export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;

// ==========================================
// Member Profile Schema
// ==========================================
export const UpdateProfileSchema = z.object({
  fullName: z.string().trim().min(3).max(100).optional(),
  mobile: mobileValidator.optional(),
  address: z.string().trim().max(255).optional().nullable(),
  city: z.string().trim().max(100).optional().nullable(),
  state: z.string().trim().max(100).optional().nullable(),
  postalCode: z.string().trim().regex(indianPinCodeRegex, 'Invalid 6-digit PIN code').optional().nullable(),
  panNumber: panValidator.nullable(),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;

// ==========================================
// Donation & Payment Schemas
// ==========================================
export const CreateDonationOrderSchema = z.object({
  amount: z
    .number({ invalid_type_error: 'Amount must be a number' })
    .min(100, 'Minimum donation amount is ₹100')
    .max(5000000, 'Maximum single online donation is ₹50,00,000'),
  campaignId: z.string().uuid().optional().nullable(),
  donorName: z.string().trim().min(2, 'Name is required').max(100),
  donorEmail: emailValidator,
  donorMobile: mobileValidator,
  donorAddress: z.string().trim().max(255).optional().nullable().or(z.literal('')),
  donorPan: panValidator.nullable(),
  isAnonymous: z.boolean().default(false),
  notes: z.string().trim().max(500).optional().nullable().or(z.literal('')),
});

export type CreateDonationOrderInput = z.infer<typeof CreateDonationOrderSchema>;

export const VerifyPaymentSchema = z.object({
  donationId: z.string().uuid('Invalid donation ID'),
  razorpayOrderId: z.string().min(6, 'Order ID is required'),
  razorpayPaymentId: z.string().min(6, 'Payment ID is required'),
  razorpaySignature: z.string().min(10, 'Payment signature is required'),
});

export type VerifyPaymentInput = z.infer<typeof VerifyPaymentSchema>;

export const OfflineDonationSchema = z.object({
  donorName: z.string().trim().min(2).max(100),
  donorEmail: emailValidator,
  donorMobile: mobileValidator,
  donorAddress: z.string().trim().max(255).optional().nullable().or(z.literal('')),
  donorPan: panValidator.nullable(),
  campaignId: z.string().uuid().optional().nullable(),
  amount: z.number().min(1, 'Amount must be greater than zero'),
  donationType: z.enum(['OFFLINE_CASH', 'BANK_TRANSFER']),
  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'UPI', 'CHEQUE']),
  referenceNumber: z.string().trim().max(100).optional().nullable().or(z.literal('')),
  donationDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  notes: z.string().trim().max(500).optional().nullable().or(z.literal('')),
});

export type OfflineDonationInput = z.infer<typeof OfflineDonationSchema>;

// ==========================================
// Campaign Schemas
// ==========================================
export const CreateCampaignSchema = z.object({
  title: z.string().trim().min(5, 'Title must be at least 5 characters').max(150),
  slug: z.string().trim().min(3).max(150).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with dashes'),
  summary: z.string().trim().min(20, 'Summary must be at least 20 characters').max(300),
  description: z.string().trim().min(50, 'Full description must be detailed'),
  coverImage: z.string().url('Must be a valid image URL'),
  targetAmount: z.number().min(1000, 'Target amount must be at least ₹1,000'),
  startDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  endDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional().nullable(),
  category: z.string().trim().min(2).max(50),
  isFeatured: z.boolean().default(false),
  beneficiaryDescription: z.string().trim().max(500).optional().nullable(),
});

export type CreateCampaignInput = z.infer<typeof CreateCampaignSchema>;

export const UpdateCampaignSchema = CreateCampaignSchema.partial().extend({
  status: z.enum(['DRAFT', 'ACTIVE', 'COMPLETED', 'PAUSED']).optional(),
});

export type UpdateCampaignInput = z.infer<typeof UpdateCampaignSchema>;

// ==========================================
// Income Schemas
// ==========================================
export const CreateIncomeSchema = z.object({
  title: z.string().trim().min(3).max(150),
  amount: z.number().min(1, 'Amount must be greater than zero'),
  incomeDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  source: z.enum(['ONLINE_DONATION', 'OFFLINE_DONATION', 'BANK_TRANSFER', 'GRANT', 'MEMBERSHIP_FEE', 'OTHER']),
  referenceNumber: z.string().trim().max(100).optional().nullable(),
  notes: z.string().trim().max(500).optional().nullable(),
});

export type CreateIncomeInput = z.infer<typeof CreateIncomeSchema>;

// ==========================================
// Expense Schemas
// ==========================================
export const CreateExpenseSchema = z.object({
  title: z.string().trim().min(3).max(150),
  description: z.string().trim().min(10).max(1000),
  category: z.enum([
    'FOOD_DISTRIBUTION',
    'MEDICAL_ASSISTANCE',
    'EDUCATION_SUPPORT',
    'CLOTHING',
    'SHELTER',
    'EMERGENCY_RELIEF',
    'ADMINISTRATION',
    'TRANSPORTATION',
    'EVENTS',
    'UTILITIES',
    'OTHER',
  ]),
  amount: z.number().min(1, 'Amount must be greater than zero'),
  expenseDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'UPI', 'CHEQUE', 'RAZORPAY']),
  paidTo: z.string().trim().min(2).max(150),
  invoiceNumber: z.string().trim().max(100).optional().nullable(),
  campaignId: z.string().uuid().optional().nullable(),
});

export type CreateExpenseInput = z.infer<typeof CreateExpenseSchema>;

export const RejectExpenseSchema = z.object({
  reason: z.string().trim().min(5, 'Rejection reason is required').max(500),
});

export type RejectExpenseInput = z.infer<typeof RejectExpenseSchema>;

// ==========================================
// Contact & Support Schemas
// ==========================================
export const ContactFormSchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(100),
  email: emailValidator,
  mobile: mobileValidator.optional().or(z.literal('')),
  subject: z.string().trim().min(5, 'Subject must be at least 5 characters').max(150),
  message: z.string().trim().min(15, 'Message must be at least 15 characters').max(2000),
});

export type ContactFormInput = z.infer<typeof ContactFormSchema>;
