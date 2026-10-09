"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting Bridge Of Love seed process...');
    // 1. Roles & Permissions
    const permissionsList = [
        { name: 'VIEW_DASHBOARD', description: 'Access administrative analytics and metrics' },
        { name: 'MANAGE_MEMBERS', description: 'View, verify, and update member statuses' },
        { name: 'MANAGE_DONATIONS', description: 'View, verify, and record donations' },
        { name: 'MANAGE_EXPENSES', description: 'Create and edit outgoing trust expenses' },
        { name: 'APPROVE_EXPENSES', description: 'Approve or reject expense vouchers' },
        { name: 'MANAGE_CAMPAIGNS', description: 'Create, update, and manage campaigns' },
        { name: 'GENERATE_REPORTS', description: 'Generate and export financial reports' },
        { name: 'MANAGE_CONTENT', description: 'Manage activities, gallery, and testimonials' },
        { name: 'MANAGE_SETTINGS', description: 'Configure trust legal and contact settings' },
        { name: 'MANAGE_ADMINS', description: 'Assign administrative roles to users' },
        { name: 'VIEW_AUDIT_LOGS', description: 'Inspect system and security audit trails' },
    ];
    for (const perm of permissionsList) {
        await prisma.permission.upsert({
            where: { name: perm.name },
            update: {},
            create: perm,
        });
    }
    const adminRole = await prisma.role.upsert({
        where: { name: 'ADMIN' },
        update: {},
        create: {
            name: 'ADMIN',
            description: 'Trust Administrator with comprehensive management permissions',
        },
    });
    const memberRole = await prisma.role.upsert({
        where: { name: 'MEMBER' },
        update: {},
        create: {
            name: 'MEMBER',
            description: 'Registered trust member with donation, receipt, and profile access',
        },
    });
    const allPerms = await prisma.permission.findMany();
    for (const perm of allPerms) {
        await prisma.rolePermission.upsert({
            where: {
                roleId_permissionId: {
                    roleId: adminRole.id,
                    permissionId: perm.id,
                },
            },
            update: {},
            create: {
                roleId: adminRole.id,
                permissionId: perm.id,
            },
        });
    }
    // 2. Default Admin & Member Users
    const adminPasswordHash = await bcryptjs_1.default.hash('Admin@BridgeOfLove2026!', 10);
    const memberPasswordHash = await bcryptjs_1.default.hash('Member@BridgeOfLove2026!', 10);
    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@bridgeoflove.org' },
        update: {
            passwordHash: adminPasswordHash,
            isEmailVerified: true,
            status: 'ACTIVE',
        },
        create: {
            email: 'admin@bridgeoflove.org',
            passwordHash: adminPasswordHash,
            mobile: '9840123456',
            status: 'ACTIVE',
            isEmailVerified: true,
            profile: {
                create: {
                    fullName: 'Dr. Sundaram Krishnamurthy',
                    address: 'Plot No. 14, Gandhi Salai, Alwarpet',
                    city: 'Chennai',
                    state: 'Tamil Nadu',
                    postalCode: '600018',
                    panNumber: 'AAATB1234F',
                },
            },
        },
        include: { profile: true },
    });
    await prisma.userRole.upsert({
        where: {
            userId_roleId: {
                userId: adminUser.id,
                roleId: adminRole.id,
            },
        },
        update: {},
        create: {
            userId: adminUser.id,
            roleId: adminRole.id,
        },
    });
    const memberUser = await prisma.user.upsert({
        where: { email: 'member@example.com' },
        update: {
            passwordHash: memberPasswordHash,
            isEmailVerified: true,
            status: 'ACTIVE',
        },
        create: {
            email: 'member@example.com',
            passwordHash: memberPasswordHash,
            mobile: '9789123456',
            status: 'ACTIVE',
            isEmailVerified: true,
            profile: {
                create: {
                    fullName: 'Ananya Ramanathan',
                    address: 'Apartment 4B, Shanthi Vihar, Besant Nagar',
                    city: 'Chennai',
                    state: 'Tamil Nadu',
                    postalCode: '600090',
                    panNumber: 'BNZPR4521K',
                },
            },
        },
        include: { profile: true },
    });
    await prisma.userRole.upsert({
        where: {
            userId_roleId: {
                userId: memberUser.id,
                roleId: memberRole.id,
            },
        },
        update: {},
        create: {
            userId: memberUser.id,
            roleId: memberRole.id,
        },
    });
    // 3. Campaigns
    const campaign1 = await prisma.campaign.upsert({
        where: { slug: 'annapurna-food-security' },
        update: {},
        create: {
            title: 'Annapurna Daily Meal & Ration Support for Destitute Elders',
            slug: 'annapurna-food-security',
            summary: 'Providing nutritious, warm daily meals and monthly grocery ration kits to 350 abandoned elders and vulnerable destitute families.',
            description: `In underprivileged urban settlements and rural peripheries, hundreds of frail, elderly citizens live without family support or dependable daily nourishment. 

The Annapurna initiative ensures that no vulnerable senior citizen in our coverage areas goes to bed hungry. Every morning, our community kitchen prepares wholesome, fresh meals cooked with high hygiene standards. Additionally, dry ration kits containing 10kg rice, 2kg lentils, cooking oil, spices, and nutrition powder are distributed to families caring for bedridden elders.`,
            coverImage: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1200&q=80',
            targetAmount: 1500000.00,
            raisedAmount: 940000.00,
            startDate: new Date('2026-01-01'),
            endDate: new Date('2026-12-31'),
            status: client_1.CampaignStatus.ACTIVE,
            isFeatured: true,
            category: 'Nutrition & Food Relief',
            beneficiaryDescription: '350 elderly seniors and 120 destitute single-mother families in Chennai & Chengalpattu districts.',
        },
    });
    const campaign2 = await prisma.campaign.upsert({
        where: { slug: 'asha-deep-girl-child-education' },
        update: {},
        create: {
            title: 'Asha Deep: High-School & STEM Scholarship for 200 Girl Children',
            slug: 'asha-deep-girl-child-education',
            summary: 'Equipping talented young girls from economically challenged households with annual school fees, digital study tablets, textbooks, and tutoring.',
            description: `Education is the most sustainable antidote to generational poverty. Unfortunately, girls from economically stressed families are often pulled out of school when financial hardships hit.

Under Asha Deep, we adopt full annual academic fees, bilingual textbooks, backpacks, uniform pairs, and after-school mentor support for young female scholars in government and aided schools, enabling them to pursue higher education and STEM careers with confidence and dignity.`,
            coverImage: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
            targetAmount: 2200000.00,
            raisedAmount: 1680000.00,
            startDate: new Date('2026-02-01'),
            endDate: new Date('2026-11-30'),
            status: client_1.CampaignStatus.ACTIVE,
            isFeatured: true,
            category: 'Child Education',
            beneficiaryDescription: '200 adolescent girl students from government schools across suburban Tamil Nadu.',
        },
    });
    const campaign3 = await prisma.campaign.upsert({
        where: { slug: 'sanjeevani-rural-medical-camps' },
        update: {},
        create: {
            title: 'Sanjeevani Mobile Medical Dispensary & Free Cataract Surgeries',
            slug: 'sanjeevani-rural-medical-camps',
            summary: 'Bringing doctor consultations, routine diabetic/hypertension medications, and corrective vision surgeries directly to rural doorsteps.',
            description: `Rural daily-wage earners rarely seek medical assistance until conditions turn critical due to loss of daily wages and high travel costs.

The Sanjeevani outreach van travels weekly to remote village clusters with a qualified physician, geriatric nurse, and diagnostic lab equipment. We provide continuous supplies of essential medications for diabetes and blood pressure, conduct vision screenings, and sponsor 100% free cataract restoration surgeries at accredited partner hospitals.`,
            coverImage: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80',
            targetAmount: 1800000.00,
            raisedAmount: 1125000.00,
            startDate: new Date('2026-01-15'),
            endDate: new Date('2026-10-31'),
            status: client_1.CampaignStatus.ACTIVE,
            isFeatured: false,
            category: 'Healthcare & Elder Care',
            beneficiaryDescription: 'Over 1,800 rural residents and senior citizens across 14 village panchayats.',
        },
    });
    // 4. Sample Donations & Receipts
    const sampleDonations = [
        {
            donorName: 'Ananya Ramanathan',
            donorEmail: 'member@example.com',
            donorMobile: '9789123456',
            donorAddress: 'Apartment 4B, Shanthi Vihar, Besant Nagar, Chennai - 600090',
            donorPan: 'BNZPR4521K',
            userId: memberUser.id,
            campaignId: campaign1.id,
            amount: 5000.00,
            amountInWords: 'Rupees Five Thousand Only',
            purpose: 'Annapurna Daily Meal & Ration Support for Destitute Elders',
            receiptNumber: 'BOL-2026-000001',
            verificationCode: 'VER-BOL-918201',
            date: new Date('2026-02-14T10:30:00Z'),
        },
        {
            donorName: 'Ananya Ramanathan',
            donorEmail: 'member@example.com',
            donorMobile: '9789123456',
            donorAddress: 'Apartment 4B, Shanthi Vihar, Besant Nagar, Chennai - 600090',
            donorPan: 'BNZPR4521K',
            userId: memberUser.id,
            campaignId: campaign2.id,
            amount: 12000.00,
            amountInWords: 'Rupees Twelve Thousand Only',
            purpose: 'Asha Deep: High-School & STEM Scholarship for 200 Girl Children',
            receiptNumber: 'BOL-2026-000002',
            verificationCode: 'VER-BOL-918202',
            date: new Date('2026-03-01T14:15:00Z'),
        },
        {
            donorName: 'Rajesh Venkatachalam',
            donorEmail: 'rajesh.venkat@chennaicorporate.com',
            donorMobile: '9841029384',
            donorAddress: '12th Cross, Indiranagar, Bengaluru - 560038',
            donorPan: 'AAEPV7812M',
            userId: null,
            campaignId: campaign3.id,
            amount: 25000.00,
            amountInWords: 'Rupees Twenty Five Thousand Only',
            purpose: 'Sanjeevani Mobile Medical Dispensary & Free Cataract Surgeries',
            receiptNumber: 'BOL-2026-000003',
            verificationCode: 'VER-BOL-918203',
            date: new Date('2026-03-10T16:45:00Z'),
        },
    ];
    for (const item of sampleDonations) {
        const existing = await prisma.receipt.findUnique({
            where: { receiptNumber: item.receiptNumber },
        });
        if (!existing) {
            const don = await prisma.donation.create({
                data: {
                    donorName: item.donorName,
                    donorEmail: item.donorEmail,
                    donorMobile: item.donorMobile,
                    donorAddress: item.donorAddress,
                    donorPan: item.donorPan,
                    userId: item.userId,
                    campaignId: item.campaignId,
                    amount: item.amount,
                    currency: 'INR',
                    donationType: client_1.DonationType.CAMPAIGN,
                    paymentMethod: client_1.PaymentMethod.RAZORPAY,
                    status: client_1.PaymentStatus.PAID,
                    razorpayOrderId: `order_${item.receiptNumber.toLowerCase().replace(/-/g, '_')}`,
                    razorpayPaymentId: `pay_${item.receiptNumber.toLowerCase().replace(/-/g, '_')}`,
                    createdAt: item.date,
                },
            });
            await prisma.receipt.create({
                data: {
                    receiptNumber: item.receiptNumber,
                    donationId: don.id,
                    issueDate: item.date,
                    donorName: item.donorName,
                    donorEmail: item.donorEmail,
                    donorMobile: item.donorMobile,
                    donorAddress: item.donorAddress,
                    donorPan: item.donorPan,
                    amount: item.amount,
                    amountInWords: item.amountInWords,
                    purpose: item.purpose,
                    paymentMethod: client_1.PaymentMethod.RAZORPAY,
                    transactionReference: don.razorpayPaymentId,
                    verificationCode: item.verificationCode,
                    status: client_1.ReceiptStatus.ISSUED,
                    is80GApplicable: true,
                    trustPan: 'AAATB1234F',
                    trust80GReg: 'AAATB1234FF20214',
                    createdAt: item.date,
                },
            });
            await prisma.financialLedgerEntry.create({
                data: {
                    entryType: client_1.LedgerEntryType.CREDIT,
                    amount: item.amount,
                    balanceAfter: item.amount, // incremental
                    account: 'MAIN_OPERATIONAL_FUND',
                    referenceType: 'DONATION',
                    referenceId: don.id,
                    description: `Donation received from ${item.donorName} (${item.receiptNumber})`,
                    recordedAt: item.date,
                },
            });
        }
    }
    // 5. Sequence Tracker
    await prisma.sequenceTracker.upsert({
        where: { name: 'RECEIPT' },
        update: {},
        create: {
            name: 'RECEIPT',
            year: 2026,
            lastNumber: 3,
        },
    });
    await prisma.sequenceTracker.upsert({
        where: { name: 'EXPENSE' },
        update: {},
        create: {
            name: 'EXPENSE',
            year: 2026,
            lastNumber: 4,
        },
    });
    // 6. Verified Other Income Entries
    const sampleIncome = [
        {
            title: 'CSR Education Grant from Cognizant Employees Foundation',
            amount: 450000.00,
            incomeDate: new Date('2026-01-20'),
            source: client_1.IncomeSource.GRANT,
            referenceNumber: 'GRANT-CTS-2026-Q1',
            notes: 'Sanctioned for Asha Deep girl child digital learning lab equipment',
            receivedBy: 'Sundaram Krishnamurthy',
        },
        {
            title: 'Annual Patron Benefactor Trust Contribution',
            amount: 200000.00,
            incomeDate: new Date('2026-02-05'),
            source: client_1.IncomeSource.BANK_TRANSFER,
            referenceNumber: 'NEFT-HDFC-9921448',
            notes: 'Direct institutional transfer to corpus',
            receivedBy: 'Sundaram Krishnamurthy',
        },
    ];
    for (const inc of sampleIncome) {
        const existing = await prisma.incomeEntry.findFirst({ where: { title: inc.title } });
        if (!existing) {
            const created = await prisma.incomeEntry.create({ data: inc });
            await prisma.financialLedgerEntry.create({
                data: {
                    entryType: client_1.LedgerEntryType.CREDIT,
                    amount: inc.amount,
                    balanceAfter: inc.amount,
                    account: 'MAIN_OPERATIONAL_FUND',
                    referenceType: 'INCOME',
                    referenceId: created.id,
                    description: `${inc.title} (${inc.referenceNumber})`,
                    recordedAt: inc.incomeDate,
                },
            });
        }
    }
    // 7. Approved & Recorded Expenses
    const sampleExpenses = [
        {
            expenseNumber: 'EXP-2026-0001',
            title: 'Bulk Purchase of Provisions & Grains for Community Kitchen',
            description: 'Acquisition of 2,500 kg Sona Masoori raw rice, Toor dal, sunflower cooking oil and essential spices from wholesale agricultural cooperative.',
            category: client_1.ExpenseCategory.FOOD_DISTRIBUTION,
            amount: 148500.00,
            expenseDate: new Date('2026-01-25'),
            paymentMethod: client_1.PaymentMethod.BANK_TRANSFER,
            paidTo: 'Tamil Nadu Wholesale Agro Cooperative Ltd',
            invoiceNumber: 'INV-TNA-8812',
            status: client_1.ExpenseStatus.PAID,
            createdById: adminUser.id,
            approvedById: adminUser.id,
            approvedAt: new Date('2026-01-26'),
            paidAt: new Date('2026-01-27'),
        },
        {
            expenseNumber: 'EXP-2026-0002',
            title: 'School Uniforms, Bags and Oxford English Dictionaries for 150 Students',
            description: 'Manufacture of tailor-fitted school uniforms (two sets each) along with durable school bags and study kits for enrolled schoolgirls.',
            category: client_1.ExpenseCategory.EDUCATION_SUPPORT,
            amount: 185000.00,
            expenseDate: new Date('2026-02-10'),
            paymentMethod: client_1.PaymentMethod.BANK_TRANSFER,
            paidTo: 'Saraswathi Garments & Stationery Suppliers',
            invoiceNumber: 'SGS-2026-019',
            status: client_1.ExpenseStatus.PAID,
            createdById: adminUser.id,
            approvedById: adminUser.id,
            approvedAt: new Date('2026-02-11'),
            paidAt: new Date('2026-02-12'),
        },
        {
            expenseNumber: 'EXP-2026-0003',
            title: 'Surgical Hospital Subsidies for 30 Elderly Cataract Surgeries',
            description: 'Direct institutional billing covering intraocular lens implantation, post-op medicated eye drops, and protective eyewear at Sankara Eye Center.',
            category: client_1.ExpenseCategory.MEDICAL_ASSISTANCE,
            amount: 120000.00,
            expenseDate: new Date('2026-02-28'),
            paymentMethod: client_1.PaymentMethod.BANK_TRANSFER,
            paidTo: 'Sankara Eye Foundation Hospital',
            invoiceNumber: 'SEC-SURG-4412',
            status: client_1.ExpenseStatus.PAID,
            createdById: adminUser.id,
            approvedById: adminUser.id,
            approvedAt: new Date('2026-03-01'),
            paidAt: new Date('2026-03-02'),
        },
        {
            expenseNumber: 'EXP-2026-0004',
            title: 'Fuel, Driver Allowance & Vehicle Maintenance for Mobile Clinic Van',
            description: 'Scheduled servicing, new radial tires, and monthly diesel expenditure for the Sanjeevani rural outreach vehicle.',
            category: client_1.ExpenseCategory.TRANSPORTATION,
            amount: 28500.00,
            expenseDate: new Date('2026-03-05'),
            paymentMethod: client_1.PaymentMethod.BANK_TRANSFER,
            paidTo: 'Sri Balaji Auto Services & IOCL Depot',
            invoiceNumber: 'SB-IOCL-998',
            status: client_1.ExpenseStatus.APPROVED,
            createdById: adminUser.id,
            approvedById: adminUser.id,
            approvedAt: new Date('2026-03-06'),
        },
    ];
    for (const exp of sampleExpenses) {
        const existing = await prisma.expense.findUnique({
            where: { expenseNumber: exp.expenseNumber },
        });
        if (!existing) {
            const createdExp = await prisma.expense.create({
                data: exp,
            });
            if (exp.status === client_1.ExpenseStatus.PAID) {
                await prisma.financialLedgerEntry.create({
                    data: {
                        entryType: client_1.LedgerEntryType.DEBIT,
                        amount: exp.amount,
                        balanceAfter: 0,
                        account: 'MAIN_OPERATIONAL_FUND',
                        referenceType: 'EXPENSE',
                        referenceId: createdExp.id,
                        description: `${exp.title} (${exp.expenseNumber})`,
                        recordedAt: exp.expenseDate,
                    },
                });
            }
        }
    }
    // 8. Activities
    const activitiesList = [
        {
            title: 'Monthly Food Kit Distribution at Perungudi & Velachery Settlements',
            slug: 'monthly-food-kit-distribution-feb-2026',
            description: 'Our volunteer squad reached out to 280 households facing sudden work stoppages, handing over 30-day nutrition grocery boxes packed with pulses, oil, spices, and grains.',
            category: 'Nutrition Relief',
            date: new Date('2026-02-18'),
            location: 'Perungudi Relief Hub, Chennai',
            coverImage: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80',
            images: [
                'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1532629345422-7515f3d16bb7?auto=format&fit=crop&w=800&q=80',
            ],
            beneficiariesCount: 280,
            isPublished: true,
        },
        {
            title: 'Annual Academic Laptop & Study Tablet Handover Ceremony',
            slug: 'annual-academic-laptop-handover-2026',
            description: 'Sponsored by compassionate individual benefactors, 45 deserving young women entering engineering and polytechnic diplomas received high-spec laptops to excel in their college studies.',
            category: 'Education Support',
            date: new Date('2026-01-28'),
            location: 'St. Thomas Community Auditorium, Guindy',
            coverImage: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80',
            images: [
                'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
            ],
            beneficiariesCount: 45,
            isPublished: true,
        },
        {
            title: 'Mega Diagnostic & Eyecare Screening Camp at Thirukazhukundram',
            slug: 'mega-diagnostic-eyecare-screening-feb-2026',
            description: 'In collaboration with ophthalmic surgeons, we examined 412 rural seniors for cataracts, glaucoma, refractive errors, and hypertension. 38 patients were scheduled for free lens surgeries.',
            category: 'Healthcare Outreach',
            date: new Date('2026-02-22'),
            location: 'Government Higher Secondary School Grounds, Thirukazhukundram',
            coverImage: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80',
            images: [
                'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
            ],
            beneficiariesCount: 412,
            isPublished: true,
        },
        {
            title: 'Winter Warmth & Heavy Woolen Blanket Drive for Street Dwellers',
            slug: 'winter-warmth-blanket-drive-jan-2026',
            description: 'Volunteers braved chilly monsoon night winds to distribute 500 thick fleece blankets, thermal jackets, and hot soup to homeless seniors sleeping on railway platforms and bus shelters.',
            category: 'Humanitarian Care',
            date: new Date('2026-01-08'),
            location: 'Chennai Central & Egmore Periphery',
            coverImage: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=1200&q=80',
            images: [],
            beneficiariesCount: 500,
            isPublished: true,
        },
        {
            title: 'Installation of Solar RO Drinking Water Filtration Plant',
            slug: 'solar-ro-water-plant-inauguration',
            description: 'Inaugurated a 1,000-liter-per-hour solar powered water purification unit at a rural tribal village school, eliminating fluorosis and bacterial waterborne illnesses.',
            category: 'Rural Infrastructure',
            date: new Date('2026-03-02'),
            location: 'Jawadhu Hills Tribal Welfare School, Tiruvannamalai',
            coverImage: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=1200&q=80',
            images: [],
            beneficiariesCount: 620,
            isPublished: true,
        },
    ];
    for (const act of activitiesList) {
        await prisma.activity.upsert({
            where: { slug: act.slug },
            update: {},
            create: act,
        });
    }
    // 9. Gallery Items
    const galleryItems = [
        {
            title: 'Hot meals served daily with respect and care',
            category: 'Food Relief',
            imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80',
            caption: 'Every elder is received with warmth and served hot, wholesome traditional meals.',
            date: new Date('2026-02-15'),
            isFeatured: true,
        },
        {
            title: 'Young female scholars receiving textbooks and uniforms',
            category: 'Education',
            imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
            caption: 'Empowering children with tools to stay in school and dream without limits.',
            date: new Date('2026-02-01'),
            isFeatured: true,
        },
        {
            title: 'Geriatric doctor listening attentively to a village grandmother',
            category: 'Healthcare',
            imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
            caption: 'Compassionate medical care right at their doorstep.',
            date: new Date('2026-02-22'),
            isFeatured: true,
        },
        {
            title: 'Community relief packing center run by dedicated volunteers',
            category: 'Volunteers',
            imageUrl: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=800&q=80',
            caption: 'Volunteers packing monthly grocery rations for 280 vulnerable families.',
            date: new Date('2026-01-20'),
            isFeatured: false,
        },
    ];
    for (const gal of galleryItems) {
        const existing = await prisma.galleryItem.findFirst({ where: { title: gal.title } });
        if (!existing) {
            await prisma.galleryItem.create({ data: gal });
        }
    }
    // 10. Genuine Testimonials
    const testimonials = [
        {
            name: 'R. Kausalya Ammal',
            roleOrRelation: 'Beneficiary, Age 74',
            quote: 'After my husband passed away and my joints grew weak, I wondered how I would afford two meals a day. The Bridge Of Love community kitchen volunteers bring me food with such loving respect every morning. They are like my own children.',
            avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
            location: 'Vyisarpadi, North Chennai',
            isApproved: true,
        },
        {
            name: 'V. Divyashree',
            roleOrRelation: 'Scholarship Recipient, 1st Year B.Tech',
            quote: 'My father drives an auto-rickshaw and our family had zero means to pay my college tuition fees. Asha Deep stepped in within 48 hours, clearing my first-year engineering fees. I am working hard to become a software engineer to support my family.',
            avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
            location: 'Chengalpattu District',
            isApproved: true,
        },
        {
            name: 'Suresh Narayanan',
            roleOrRelation: 'Monthly Contributing Member since 2022',
            quote: 'What sets Bridge Of Love apart from other trusts is radical transparency. Every single month I receive itemized expense statements and verifiable receipts with QR codes. You know exactly where every rupee reaches.',
            avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
            location: 'Alwarpet, Chennai',
            isApproved: true,
        },
    ];
    for (const t of testimonials) {
        const existing = await prisma.testimonial.findFirst({ where: { name: t.name } });
        if (!existing) {
            await prisma.testimonial.create({ data: t });
        }
    }
    // 11. Website Settings
    const settings = [
        { key: 'TRUST_NAME', value: 'Bridge Of Love Charitable Trust' },
        { key: 'TRUST_TAGLINE', value: 'Connecting compassionate hearts with people in need.' },
        { key: 'TRUST_REG_NO', value: 'BOL/TN/2021/004921' },
        { key: 'TRUST_PAN', value: 'AAATB1234F' },
        { key: 'TRUST_80G_REG', value: 'AAATB1234FF20214' },
        { key: 'TRUST_12A_REG', value: 'AAATB1234FE20213' },
        { key: 'TRUST_ADDRESS', value: 'Plot No. 42, Karuna Nagar, 3rd Main Road, Anna Nagar West, Chennai, Tamil Nadu - 600040' },
        { key: 'TRUST_PHONE', value: '+91 94441 23456' },
        { key: 'TRUST_EMAIL', value: 'contact@bridgeoflove.org' },
        { key: 'FOUNDER_NAME', value: 'Dr. Sundaram Krishnamurthy & Smt. Vasantha Krishnamurthy' },
        { key: 'CORPUS_DONATION_ACCOUNT', value: 'Bridge Of Love Charitable Trust | HDFC Bank A/C: 50200067891234 | IFSC: HDFC0000124' },
    ];
    for (const s of settings) {
        await prisma.websiteSetting.upsert({
            where: { key: s.key },
            update: { value: s.value },
            create: s,
        });
    }
    // 12. Notification
    await prisma.notification.create({
        data: {
            userId: memberUser.id,
            title: 'Welcome to Bridge Of Love',
            message: 'Thank you for joining our community of compassionate patrons. Your donation receipts and impact statements will be available in this portal.',
            type: 'SUCCESS',
            isRead: false,
        },
    });
    // 13. Audit Log
    await prisma.auditLog.create({
        data: {
            userId: adminUser.id,
            userName: 'Dr. Sundaram Krishnamurthy',
            action: 'SYSTEM_SEED_INITIALIZED',
            entityType: 'SYSTEM',
            entityId: 'ROOT',
            newValues: JSON.stringify({ message: 'Bridge Of Love system initialized with verified test data and legal identities.' }),
            ipAddress: '127.0.0.1',
            userAgent: 'Seed-Worker/1.0',
        },
    });
    console.log('✅ Bridge Of Love seed completed successfully!');
    console.log('   Admin Login:  admin@bridgeoflove.org / Admin@BridgeOfLove2026!');
    console.log('   Member Login: member@example.com    / Member@BridgeOfLove2026!');
}
main()
    .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map