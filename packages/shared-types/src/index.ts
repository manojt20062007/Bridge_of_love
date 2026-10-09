// ==========================================
// User, Role and Permission Types
// ==========================================
export type RoleName = 'ADMIN' | 'MEMBER' | 'SUPER_ADMIN';

export type PermissionName =
  | 'VIEW_DASHBOARD'
  | 'MANAGE_MEMBERS'
  | 'MANAGE_DONATIONS'
  | 'MANAGE_EXPENSES'
  | 'APPROVE_EXPENSES'
  | 'MANAGE_CAMPAIGNS'
  | 'GENERATE_REPORTS'
  | 'MANAGE_CONTENT'
  | 'MANAGE_SETTINGS'
  | 'MANAGE_ADMINS'
  | 'VIEW_AUDIT_LOGS';

export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';

export interface User {
  id: string;
  email: string;
  mobile: string;
  status: UserStatus;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MemberProfile {
  id: string;
  userId: string;
  fullName: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  panNumber?: string | null;
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserWithProfile extends User {
  profile?: MemberProfile | null;
  roles: RoleName[];
  permissions: PermissionName[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: UserWithProfile;
  tokens: AuthTokens;
}

// ==========================================
// Campaign Types
// ==========================================
export type CampaignStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'PAUSED';

export interface Campaign {
  id: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  coverImage: string;
  targetAmount: number;
  raisedAmount: number;
  startDate: string;
  endDate?: string | null;
  status: CampaignStatus;
  isFeatured: boolean;
  beneficiaryDescription?: string | null;
  category: string;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// Donation & Payment Types
// ==========================================
export type DonationType = 'GENERAL' | 'CAMPAIGN' | 'OFFLINE_CASH' | 'BANK_TRANSFER';
export type PaymentStatus = 'CREATED' | 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'CANCELLED';
export type PaymentMethod = 'RAZORPAY' | 'CASH' | 'BANK_TRANSFER' | 'UPI' | 'CHEQUE';

export interface Donation {
  id: string;
  userId?: string | null;
  donorName: string;
  donorEmail: string;
  donorMobile: string;
  donorAddress?: string | null;
  donorPan?: string | null;
  campaignId?: string | null;
  campaign?: {
    id: string;
    title: string;
    slug: string;
  } | null;
  amount: number;
  currency: string;
  donationType: DonationType;
  paymentMethod: PaymentMethod;
  isAnonymous: boolean;
  notes?: string | null;
  status: PaymentStatus;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  receiptId?: string | null;
  receipt?: Receipt | null;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// Receipt Types
// ==========================================
export type ReceiptStatus = 'ISSUED' | 'CANCELLED';

export interface Receipt {
  id: string;
  receiptNumber: string; // e.g., BOL-2026-000001
  donationId: string;
  issueDate: string;
  donorName: string;
  donorEmail: string;
  donorMobile: string;
  donorAddress?: string | null;
  donorPan?: string | null;
  amount: number;
  amountInWords: string;
  purpose: string;
  paymentMethod: PaymentMethod;
  transactionReference: string;
  verificationCode: string;
  pdfUrl?: string | null;
  status: ReceiptStatus;
  is80GApplicable: boolean;
  trustPan: string;
  trust80GReg?: string | null;
  cancelledAt?: string | null;
  cancellationReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// Income & Expense Types
// ==========================================
export type IncomeSource =
  | 'ONLINE_DONATION'
  | 'OFFLINE_DONATION'
  | 'BANK_TRANSFER'
  | 'GRANT'
  | 'MEMBERSHIP_FEE'
  | 'OTHER';

export interface IncomeEntry {
  id: string;
  title: string;
  amount: number;
  incomeDate: string;
  source: IncomeSource;
  referenceNumber?: string | null;
  notes?: string | null;
  receivedBy: string;
  createdAt: string;
  updatedAt: string;
}

export type ExpenseCategory =
  | 'FOOD_DISTRIBUTION'
  | 'MEDICAL_ASSISTANCE'
  | 'EDUCATION_SUPPORT'
  | 'CLOTHING'
  | 'SHELTER'
  | 'EMERGENCY_RELIEF'
  | 'ADMINISTRATION'
  | 'TRANSPORTATION'
  | 'EVENTS'
  | 'UTILITIES'
  | 'OTHER';

export type ExpenseStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'PAID'
  | 'CANCELLED';

export interface ExpenseAttachment {
  id: string;
  expenseId: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
  createdAt: string;
}

export interface Expense {
  id: string;
  expenseNumber: string; // e.g. EXP-2026-0001
  title: string;
  description: string;
  category: ExpenseCategory;
  amount: number;
  expenseDate: string;
  paymentMethod: PaymentMethod;
  paidTo: string;
  invoiceNumber?: string | null;
  campaignId?: string | null;
  status: ExpenseStatus;
  createdById: string;
  approvedById?: string | null;
  rejectionReason?: string | null;
  approvedAt?: string | null;
  paidAt?: string | null;
  attachments?: ExpenseAttachment[];
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// Ledger & Financial Transparency Types
// ==========================================
export type LedgerEntryType = 'CREDIT' | 'DEBIT';

export interface FinancialLedgerEntry {
  id: string;
  entryType: LedgerEntryType;
  amount: number;
  balanceAfter: number;
  account: string;
  referenceType: 'DONATION' | 'INCOME' | 'EXPENSE' | 'ADJUSTMENT';
  referenceId: string;
  description: string;
  recordedAt: string;
}

export interface TransparencySummary {
  totalVerifiedDonations: number;
  totalOtherIncome: number;
  totalIncome: number;
  totalApprovedExpenses: number;
  availableBalance: number;
  monthlyTrends: {
    month: string;
    income: number;
    expense: number;
  }[];
  expenseCategories: {
    category: ExpenseCategory;
    categoryLabel: string;
    amount: number;
    percentage: number;
  }[];
  recentAuditedSummary: {
    financialYear: string;
    totalBeneficiaries: number;
    foodKitsDistributed: number;
    studentsSupported: number;
    medicalCampsConducted: number;
  };
}

// ==========================================
// Content Management Types
// ==========================================
export interface Activity {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  date: string;
  location: string;
  coverImage: string;
  images: string[];
  beneficiariesCount: number;
  isPublished: boolean;
  createdAt: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  caption?: string | null;
  date: string;
  isFeatured: boolean;
  createdAt: string;
}

export interface Testimonial {
  id: string;
  name: string;
  roleOrRelation: string;
  quote: string;
  avatarUrl?: string | null;
  location?: string | null;
  isApproved: boolean;
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  mobile?: string | null;
  subject: string;
  message: string;
  isRead: boolean;
  respondedAt?: string | null;
  createdAt: string;
}

export interface WebsiteSetting {
  id: string;
  key: string;
  value: string;
  description?: string | null;
  updatedAt: string;
}

// ==========================================
// Audit Log & Notification Types
// ==========================================
export interface AuditLog {
  id: string;
  userId?: string | null;
  userName?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  oldValues?: string | null;
  newValues?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';
  isRead: boolean;
  linkUrl?: string | null;
  createdAt: string;
}

// ==========================================
// API Envelope Types
// ==========================================
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface PaginatedResponse<T = any> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
