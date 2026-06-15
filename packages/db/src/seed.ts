/**
 * BidConnect Pro — Database Seed Script
 *
 * Seeds the database with:
 * 1. CSI MasterFormat Divisions (reference data)
 * 2. Demo Organization + Offices
 * 3. Demo Users (one per role)
 * 4. Demo Companies + Contacts (subcontractor network)
 * 5. Demo Project with Bid Packages, Invitations, and Documents
 * 6. Demo Bid Form Template
 *
 * Usage:  pnpm db:seed
 * Reset:  pnpm db:reset  (drops + re-migrates + re-seeds)
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ─────────────────────────────────────────────────────────────
// CSI MASTERFORMAT DIVISIONS (full 50-division reference)
// ─────────────────────────────────────────────────────────────
const CSI_DIVISIONS = [
  { code: "00", name: "Procurement and Contracting Requirements" },
  { code: "01", name: "General Requirements" },
  { code: "02", name: "Existing Conditions" },
  { code: "03", name: "Concrete" },
  { code: "04", name: "Masonry" },
  { code: "05", name: "Metals" },
  { code: "06", name: "Wood, Plastics, and Composites" },
  { code: "07", name: "Thermal and Moisture Protection" },
  { code: "08", name: "Openings" },
  { code: "09", name: "Finishes" },
  { code: "10", name: "Specialties" },
  { code: "11", name: "Equipment" },
  { code: "12", name: "Furnishings" },
  { code: "13", name: "Special Construction" },
  { code: "14", name: "Conveying Equipment" },
  { code: "15", name: "Reserved for Future Expansion" },
  { code: "16", name: "Reserved for Future Expansion" },
  { code: "17", name: "Reserved for Future Expansion" },
  { code: "18", name: "Reserved for Future Expansion" },
  { code: "19", name: "Reserved for Future Expansion" },
  { code: "20", name: "Reserved for Future Expansion" },
  { code: "21", name: "Fire Suppression" },
  { code: "22", name: "Plumbing" },
  { code: "23", name: "Heating, Ventilating, and Air Conditioning (HVAC)" },
  { code: "24", name: "Reserved for Future Expansion" },
  { code: "25", name: "Integrated Automation" },
  { code: "26", name: "Electrical" },
  { code: "27", name: "Communications" },
  { code: "28", name: "Electronic Safety and Security" },
  { code: "29", name: "Reserved for Future Expansion" },
  { code: "30", name: "Reserved for Future Expansion" },
  { code: "31", name: "Earthwork" },
  { code: "32", name: "Exterior Improvements" },
  { code: "33", name: "Utilities" },
  { code: "34", name: "Transportation" },
  { code: "35", name: "Waterway and Marine Construction" },
  { code: "36", name: "Reserved for Future Expansion" },
  { code: "37", name: "Reserved for Future Expansion" },
  { code: "38", name: "Reserved for Future Expansion" },
  { code: "39", name: "Reserved for Future Expansion" },
  { code: "40", name: "Process Interconnections" },
  { code: "41", name: "Material Processing and Handling Equipment" },
  { code: "42", name: "Process Heating, Cooling, and Drying Equipment" },
  { code: "43", name: "Process Gas and Liquid Handling, Purification, and Storage Equipment" },
  { code: "44", name: "Pollution and Waste Control Equipment" },
  { code: "45", name: "Industry-Specific Manufacturing Equipment" },
  { code: "46", name: "Water and Wastewater Equipment" },
  { code: "47", name: "Reserved for Future Expansion" },
  { code: "48", name: "Electrical Power Generation" },
  { code: "49", name: "Reserved for Future Expansion" },
];

// ─────────────────────────────────────────────────────────────
// MAIN SEED FUNCTION
// ─────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Seeding BidConnect Pro database...\n");

  // ── 1. CSI Divisions ──────────────────────────────────────
  console.log("  📚 Seeding CSI MasterFormat divisions...");
  for (const div of CSI_DIVISIONS) {
    await prisma.csiDivision.upsert({
      where: { code: div.code },
      update: { name: div.name },
      create: { code: div.code, name: div.name },
    });
  }
  console.log(`     ✓ ${CSI_DIVISIONS.length} CSI divisions seeded`);

  // ── 2. Demo Organization ──────────────────────────────────
  console.log("  🏢 Creating demo organization...");
  const org = await prisma.organization.upsert({
    where: { slug: "oneill-contractors" },
    update: {},
    create: {
      name: "O'Neill Contractors",
      slug: "oneill-contractors",
      addressLine1: "1200 Main Street",
      addressLine2: "Suite 400",
      city: "Houston",
      state: "TX",
      zip: "77002",
      country: "US",
      phone: "(713) 555-0100",
      website: "https://oneillcontractors.com",
      plan: "PRO",
      defaultTimezone: "America/Chicago",
      defaultCurrency: "USD",
      notificationsEmail: "bids@oneillcontractors.com",
      settings: {
        requirePrequalification: false,
        autoClosePackagesOnDeadline: true,
        defaultBidsDueTime: "14:00",
        emailFooter: "O'Neill Contractors — Building Excellence Since 1985",
      },
    },
  });
  console.log(`     ✓ Organization: ${org.name} (${org.id})`);

  // ── 3. Offices ────────────────────────────────────────────
  console.log("  🏬 Creating offices...");
  const houstonOffice = await prisma.office.create({
    data: {
      organizationId: org.id,
      name: "Houston HQ",
      addressLine1: "1200 Main Street, Suite 400",
      city: "Houston",
      state: "TX",
      zip: "77002",
      phone: "(713) 555-0100",
      isDefault: true,
    },
  });

  const dallasOffice = await prisma.office.create({
    data: {
      organizationId: org.id,
      name: "Dallas Office",
      addressLine1: "2500 Commerce Street",
      city: "Dallas",
      state: "TX",
      zip: "75201",
      phone: "(214) 555-0200",
      isDefault: false,
    },
  });
  console.log(`     ✓ 2 offices created`);

  // ── 4. Demo Users (one per role) ──────────────────────────
  console.log("  👥 Creating demo users...");
  const users = await Promise.all([
    prisma.user.create({
      data: {
        organizationId: org.id,
        officeId: houstonOffice.id,
        email: "bill@oneillcontractors.com",
        firstName: "Bill",
        lastName: "Asmar",
        title: "CEO",
        phone: "(713) 555-0101",
        role: "SUPER_ADMIN",
        isActive: true,
        isInternal: true,
        preferences: {
          theme: "dark",
          emailNotifications: true,
          pushNotifications: true,
        },
      },
    }),
    prisma.user.create({
      data: {
        organizationId: org.id,
        officeId: houstonOffice.id,
        email: "admin@oneillcontractors.com",
        firstName: "Sarah",
        lastName: "Chen",
        title: "VP of Operations",
        phone: "(713) 555-0102",
        role: "ORG_ADMIN",
        isActive: true,
        isInternal: true,
        preferences: { emailNotifications: true },
      },
    }),
    prisma.user.create({
      data: {
        organizationId: org.id,
        officeId: houstonOffice.id,
        email: "pm@oneillcontractors.com",
        firstName: "Marcus",
        lastName: "Johnson",
        title: "Senior Project Manager",
        phone: "(713) 555-0103",
        role: "PROJECT_MANAGER",
        isActive: true,
        isInternal: true,
        preferences: { emailNotifications: true },
      },
    }),
    prisma.user.create({
      data: {
        organizationId: org.id,
        officeId: houstonOffice.id,
        email: "coordinator@oneillcontractors.com",
        firstName: "Emily",
        lastName: "Rodriguez",
        title: "Bid Coordinator",
        phone: "(713) 555-0104",
        role: "BID_COORDINATOR",
        isActive: true,
        isInternal: true,
        preferences: { emailNotifications: true },
      },
    }),
    prisma.user.create({
      data: {
        organizationId: org.id,
        officeId: dallasOffice.id,
        email: "estimator@oneillcontractors.com",
        firstName: "James",
        lastName: "Park",
        title: "Chief Estimator",
        phone: "(214) 555-0201",
        role: "ESTIMATOR",
        isActive: true,
        isInternal: true,
        preferences: { emailNotifications: true },
      },
    }),
    prisma.user.create({
      data: {
        organizationId: org.id,
        officeId: dallasOffice.id,
        email: "viewer@oneillcontractors.com",
        firstName: "Lisa",
        lastName: "Wang",
        title: "Executive Assistant",
        phone: "(214) 555-0202",
        role: "VIEWER",
        isActive: true,
        isInternal: true,
        preferences: { emailNotifications: false },
      },
    }),
  ]);

  const [bill, sarah, marcus, emily, james, lisa] = users;
  console.log(`     ✓ ${users.length} users created (1 per role)`);

  // ── 5. Demo Companies (Subcontractors) ────────────────────
  console.log("  🏗️  Creating demo subcontractor companies...");
  const companies = await Promise.all([
    prisma.company.create({
      data: {
        name: "Lone Star Concrete",
        addressLine1: "4500 Industrial Blvd",
        city: "Houston",
        state: "TX",
        zip: "77061",
        phone: "(713) 555-1001",
        email: "bids@lonestarconcrete.com",
        website: "https://lonestarconcrete.com",
        licenseNumber: "TX-CON-2024-8891",
        licenseState: "TX",
        prequalificationStatus: "APPROVED",
        bcNetworkVerified: true,
        isActive: true,
        totalInvitations: 24,
        totalSubmissions: 19,
        averageResponseRate: 0.79,
        trades: {
          create: [
            { csiDivisionCode: "03", csiDivisionName: "Concrete", isPrimary: true },
            { csiDivisionCode: "31", csiDivisionName: "Earthwork", isPrimary: false },
          ],
        },
      },
    }),
    prisma.company.create({
      data: {
        name: "Gulf Coast Mechanical",
        addressLine1: "789 Pipeline Road",
        city: "Pasadena",
        state: "TX",
        zip: "77505",
        phone: "(281) 555-2001",
        email: "estimating@gulfcoastmech.com",
        website: "https://gulfcoastmech.com",
        licenseNumber: "TX-MECH-2024-4420",
        licenseState: "TX",
        prequalificationStatus: "APPROVED",
        bcNetworkVerified: true,
        isActive: true,
        totalInvitations: 31,
        totalSubmissions: 28,
        averageResponseRate: 0.9,
        trades: {
          create: [
            { csiDivisionCode: "22", csiDivisionName: "Plumbing", isPrimary: true },
            { csiDivisionCode: "23", csiDivisionName: "Heating, Ventilating, and Air Conditioning (HVAC)", isPrimary: true },
          ],
        },
      },
    }),
    prisma.company.create({
      data: {
        name: "Texas Electrical Solutions",
        addressLine1: "2100 Power Lane",
        city: "Houston",
        state: "TX",
        zip: "77003",
        phone: "(713) 555-3001",
        email: "bids@texaselectrical.com",
        website: "https://texaselectrical.com",
        licenseNumber: "TX-ELEC-2024-5567",
        licenseState: "TX",
        prequalificationStatus: "APPROVED",
        bcNetworkVerified: true,
        isActive: true,
        totalInvitations: 18,
        totalSubmissions: 15,
        averageResponseRate: 0.83,
        trades: {
          create: [
            { csiDivisionCode: "26", csiDivisionName: "Electrical", isPrimary: true },
            { csiDivisionCode: "27", csiDivisionName: "Communications", isPrimary: false },
            { csiDivisionCode: "28", csiDivisionName: "Electronic Safety and Security", isPrimary: false },
          ],
        },
      },
    }),
    prisma.company.create({
      data: {
        name: "Precision Steel Works",
        addressLine1: "600 Fabrication Drive",
        city: "Baytown",
        state: "TX",
        zip: "77520",
        phone: "(281) 555-4001",
        email: "quotes@precisionsteel.com",
        website: "https://precisionsteel.com",
        licenseNumber: "TX-STL-2024-7732",
        licenseState: "TX",
        prequalificationStatus: "APPROVED",
        bcNetworkVerified: false,
        isActive: true,
        totalInvitations: 12,
        totalSubmissions: 9,
        averageResponseRate: 0.75,
        trades: {
          create: [
            { csiDivisionCode: "05", csiDivisionName: "Metals", isPrimary: true },
          ],
        },
      },
    }),
    prisma.company.create({
      data: {
        name: "Southwest Roofing & Waterproofing",
        addressLine1: "900 Skyline Parkway",
        city: "San Antonio",
        state: "TX",
        zip: "78201",
        phone: "(210) 555-5001",
        email: "bids@swroof.com",
        website: "https://swroof.com",
        licenseNumber: "TX-ROOF-2024-3310",
        licenseState: "TX",
        prequalificationStatus: "SENT",
        bcNetworkVerified: true,
        isActive: true,
        totalInvitations: 8,
        totalSubmissions: 5,
        averageResponseRate: 0.63,
        trades: {
          create: [
            { csiDivisionCode: "07", csiDivisionName: "Thermal and Moisture Protection", isPrimary: true },
          ],
        },
      },
    }),
    prisma.company.create({
      data: {
        name: "DFW Drywall & Acoustics",
        addressLine1: "1400 Commerce Street",
        city: "Dallas",
        state: "TX",
        zip: "75202",
        phone: "(214) 555-6001",
        email: "estimating@dfwdrywall.com",
        website: "https://dfwdrywall.com",
        licenseNumber: "TX-DRY-2024-1128",
        licenseState: "TX",
        prequalificationStatus: "NOT_REQUESTED",
        bcNetworkVerified: true,
        isActive: true,
        totalInvitations: 15,
        totalSubmissions: 12,
        averageResponseRate: 0.8,
        trades: {
          create: [
            { csiDivisionCode: "09", csiDivisionName: "Finishes", isPrimary: true },
          ],
        },
      },
    }),
    prisma.company.create({
      data: {
        name: "Houston Fire Protection",
        addressLine1: "3200 Safety Boulevard",
        city: "Houston",
        state: "TX",
        zip: "77040",
        phone: "(713) 555-7001",
        email: "bids@houstonfireprotection.com",
        prequalificationStatus: "APPROVED",
        bcNetworkVerified: true,
        isActive: true,
        totalInvitations: 20,
        totalSubmissions: 18,
        averageResponseRate: 0.9,
        trades: {
          create: [
            { csiDivisionCode: "21", csiDivisionName: "Fire Suppression", isPrimary: true },
          ],
        },
      },
    }),
    prisma.company.create({
      data: {
        name: "Bluebonnet Landscaping",
        addressLine1: "750 Garden Road",
        city: "Austin",
        state: "TX",
        zip: "78701",
        phone: "(512) 555-8001",
        email: "bids@bluebonnetlandscape.com",
        prequalificationStatus: "NOT_REQUESTED",
        bcNetworkVerified: false,
        isActive: true,
        totalInvitations: 5,
        totalSubmissions: 3,
        averageResponseRate: 0.6,
        trades: {
          create: [
            { csiDivisionCode: "32", csiDivisionName: "Exterior Improvements", isPrimary: true },
            { csiDivisionCode: "31", csiDivisionName: "Earthwork", isPrimary: false },
          ],
        },
      },
    }),
  ]);

  const [
    loneStarConcrete,
    gulfCoastMech,
    texasElectrical,
    precisionSteel,
    swRoofing,
    dfwDrywall,
    houstonFire,
    bluebonnetLandscape,
  ] = companies;
  console.log(`     ✓ ${companies.length} subcontractor companies created`);

  // ── 6. Company Connections (org-level CRM) ────────────────
  console.log("  🔗 Creating company connections...");
  await Promise.all(
    companies.map((company, i) =>
      prisma.companyConnection.create({
        data: {
          organizationId: org.id,
          companyId: company.id,
          isFavorite: i < 3, // first 3 are favorites
          internalRating: Math.min(5, 3 + Math.floor(i / 2)),
          customTags: i < 4 ? ["preferred", "houston-metro"] : ["network"],
        },
      })
    )
  );
  console.log(`     ✓ ${companies.length} company connections created`);

  // ── 7. Contacts ───────────────────────────────────────────
  console.log("  📇 Creating contacts...");
  const contacts = await Promise.all([
    prisma.contact.create({
      data: {
        companyId: loneStarConcrete.id,
        firstName: "Roberto",
        lastName: "Martinez",
        email: "roberto@lonestarconcrete.com",
        phone: "(713) 555-1002",
        title: "Chief Estimator",
        isPrimary: true,
      },
    }),
    prisma.contact.create({
      data: {
        companyId: gulfCoastMech.id,
        firstName: "David",
        lastName: "Thompson",
        email: "david@gulfcoastmech.com",
        phone: "(281) 555-2002",
        title: "VP of Estimating",
        isPrimary: true,
      },
    }),
    prisma.contact.create({
      data: {
        companyId: texasElectrical.id,
        firstName: "Jennifer",
        lastName: "Lee",
        email: "jennifer@texaselectrical.com",
        phone: "(713) 555-3002",
        title: "Senior Estimator",
        isPrimary: true,
      },
    }),
    prisma.contact.create({
      data: {
        companyId: precisionSteel.id,
        firstName: "Michael",
        lastName: "Brown",
        email: "michael@precisionsteel.com",
        phone: "(281) 555-4002",
        title: "Estimating Manager",
        isPrimary: true,
      },
    }),
    prisma.contact.create({
      data: {
        companyId: swRoofing.id,
        firstName: "Ana",
        lastName: "Gonzalez",
        email: "ana@swroof.com",
        phone: "(210) 555-5002",
        title: "Bid Manager",
        isPrimary: true,
      },
    }),
    prisma.contact.create({
      data: {
        companyId: dfwDrywall.id,
        firstName: "Kevin",
        lastName: "Nguyen",
        email: "kevin@dfwdrywall.com",
        phone: "(214) 555-6002",
        title: "Estimator",
        isPrimary: true,
      },
    }),
    prisma.contact.create({
      data: {
        companyId: houstonFire.id,
        firstName: "Rachel",
        lastName: "Adams",
        email: "rachel@houstonfireprotection.com",
        phone: "(713) 555-7002",
        title: "Project Manager",
        isPrimary: true,
      },
    }),
    prisma.contact.create({
      data: {
        companyId: bluebonnetLandscape.id,
        firstName: "Tyler",
        lastName: "Reeves",
        email: "tyler@bluebonnetlandscape.com",
        phone: "(512) 555-8002",
        title: "Owner / Estimator",
        isPrimary: true,
      },
    }),
  ]);
  console.log(`     ✓ ${contacts.length} contacts created`);

  // ── 8. Bid Form Template ──────────────────────────────────
  console.log("  📋 Creating default bid form template...");
  const bidFormTemplate = await prisma.bidFormTemplate.create({
    data: {
      organizationId: org.id,
      name: "Standard Lump Sum Bid Form",
      description: "Default bid form with base bid, alternates, and allowances sections",
      isDefault: true,
      createdBy: bill.id,
    },
  });
  console.log(`     ✓ Bid form template: ${bidFormTemplate.name}`);

  // ── 9. Demo Project ───────────────────────────────────────
  console.log("  📁 Creating demo project...");
  const project = await prisma.project.create({
    data: {
      organizationId: org.id,
      officeId: houstonOffice.id,
      number: "26001",
      name: "Memorial City Medical Center — Phase 2 Expansion",
      status: "ACTIVE",
      projectType: "CM_AT_RISK",
      estimatedValue: 48500000,
      description:
        "Three-story vertical expansion of existing medical center including new surgical suites, patient rooms, and imaging center. The project includes structural steel, MEP systems, interior finishes, and sitework improvements.",
      addressLine1: "920 Frostwood Drive",
      city: "Houston",
      state: "TX",
      zip: "77024",
      country: "US",
      latitude: 29.7752,
      longitude: -95.5565,
      clientName: "Memorial Hermann Health System",
      bidsDueAt: new Date("2026-04-25T14:00:00-05:00"),
      bidsDueTimezone: "America/Chicago",
      dueToClientAt: new Date("2026-05-15T17:00:00-05:00"),
      startDate: new Date("2026-06-15"),
      endDate: new Date("2028-03-31"),
      leadUserId: marcus.id,
      visibility: "PRIVATE",
      bidFormTemplateId: bidFormTemplate.id,
      tags: ["healthcare", "expansion", "houston"],
      csiDivisions: ["03", "05", "07", "09", "22", "23", "26"],
      createdBy: bill.id,
    },
  });
  console.log(`     ✓ Project: ${project.name} (#${project.number})`);

  // ── 10. Project Members ───────────────────────────────────
  console.log("  👷 Adding project members...");
  await Promise.all([
    prisma.projectMembership.create({
      data: {
        projectId: project.id,
        userId: bill.id,
        role: "manager",
        addedBy: bill.id,
      },
    }),
    prisma.projectMembership.create({
      data: {
        projectId: project.id,
        userId: marcus.id,
        role: "manager",
        addedBy: bill.id,
      },
    }),
    prisma.projectMembership.create({
      data: {
        projectId: project.id,
        userId: emily.id,
        role: "coordinator",
        addedBy: marcus.id,
      },
    }),
    prisma.projectMembership.create({
      data: {
        projectId: project.id,
        userId: james.id,
        role: "estimator",
        addedBy: marcus.id,
      },
    }),
  ]);
  console.log(`     ✓ 4 project members added`);

  // ── 11. Bid Packages ──────────────────────────────────────
  console.log("  📦 Creating bid packages...");
  const bidForm = await prisma.bidForm.create({
    data: {
      bidFormTemplateId: bidFormTemplate.id,
      name: "Memorial City — Standard Bid Form",
      createdBy: marcus.id,
      sections: {
        create: [
          {
            title: "Base Bid",
            description: "Lump sum base bid amount",
            sortOrder: 0,
            fields: {
              create: [
                {
                  label: "Base Bid Amount",
                  description: "Total lump sum amount for the scope of work described",
                  fieldType: "LUMP_SUM",
                  isRequired: true,
                  sortOrder: 0,
                },
              ],
            },
          },
          {
            title: "Alternates",
            description: "Optional alternate pricing",
            sortOrder: 1,
            fields: {
              create: [
                {
                  label: "Alternate 1 — Premium Finishes",
                  description: "Upgrade from standard to premium finish materials",
                  fieldType: "ALTERNATE",
                  isRequired: false,
                  sortOrder: 0,
                },
                {
                  label: "Alternate 2 — Extended Warranty",
                  description: "5-year extended warranty on all MEP systems",
                  fieldType: "ALTERNATE",
                  isRequired: false,
                  sortOrder: 1,
                },
              ],
            },
          },
          {
            title: "Allowances",
            description: "Owner-directed allowances",
            sortOrder: 2,
            fields: {
              create: [
                {
                  label: "Unforeseen Conditions Allowance",
                  description: "Allowance for unforeseen site conditions",
                  fieldType: "ALLOWANCE",
                  isRequired: true,
                  sortOrder: 0,
                },
              ],
            },
          },
          {
            title: "Additional Information",
            description: "Qualifications, exclusions, and schedule notes",
            sortOrder: 3,
            fields: {
              create: [
                {
                  label: "Qualifications & Exclusions",
                  description: "List any qualifications, exclusions, or clarifications",
                  fieldType: "TEXTAREA",
                  isRequired: false,
                  sortOrder: 0,
                },
                {
                  label: "Proposed Duration (calendar days)",
                  description: "Number of calendar days to complete the work",
                  fieldType: "NUMBER",
                  isRequired: true,
                  sortOrder: 1,
                },
              ],
            },
          },
        ],
      },
    },
  });

  const bidPackages = await Promise.all([
    prisma.bidPackage.create({
      data: {
        projectId: project.id,
        title: "Structural Concrete",
        scopeOfWork:
          "Complete structural concrete package including foundations, columns, beams, elevated slabs, and site concrete. Reinforcing steel included.",
        csiDivisionCode: "03",
        csiDivisionName: "Concrete",
        budgetAmount: 6200000,
        bidsDueAt: new Date("2026-04-25T14:00:00-05:00"),
        bidsDueTimezone: "America/Chicago",
        status: "OPEN",
        bidFormId: bidForm.id,
        sortOrder: 0,
        invitedCount: 1,
        createdBy: marcus.id,
      },
    }),
    prisma.bidPackage.create({
      data: {
        projectId: project.id,
        title: "Structural Steel & Misc. Metals",
        scopeOfWork:
          "Structural steel erection, miscellaneous metals, steel deck, and all related connections per structural drawings.",
        csiDivisionCode: "05",
        csiDivisionName: "Metals",
        budgetAmount: 8900000,
        bidsDueAt: new Date("2026-04-25T14:00:00-05:00"),
        bidsDueTimezone: "America/Chicago",
        status: "OPEN",
        bidFormId: bidForm.id,
        sortOrder: 1,
        invitedCount: 1,
        createdBy: marcus.id,
      },
    }),
    prisma.bidPackage.create({
      data: {
        projectId: project.id,
        title: "Roofing & Waterproofing",
        scopeOfWork:
          "Complete roofing system, waterproofing, vapor barriers, and building envelope sealants per architectural and structural details.",
        csiDivisionCode: "07",
        csiDivisionName: "Thermal and Moisture Protection",
        budgetAmount: 2100000,
        bidsDueAt: new Date("2026-04-25T14:00:00-05:00"),
        bidsDueTimezone: "America/Chicago",
        status: "OPEN",
        bidFormId: bidForm.id,
        sortOrder: 2,
        invitedCount: 1,
        createdBy: emily.id,
      },
    }),
    prisma.bidPackage.create({
      data: {
        projectId: project.id,
        title: "Mechanical (HVAC + Plumbing)",
        scopeOfWork:
          "Complete HVAC and plumbing systems including medical gas, chilled water, hot water, and all related ductwork and piping.",
        csiDivisionCode: "23",
        csiDivisionName: "Heating, Ventilating, and Air Conditioning (HVAC)",
        budgetAmount: 11500000,
        bidsDueAt: new Date("2026-04-25T14:00:00-05:00"),
        bidsDueTimezone: "America/Chicago",
        status: "OPEN",
        bidFormId: bidForm.id,
        sortOrder: 3,
        invitedCount: 1,
        createdBy: emily.id,
      },
    }),
    prisma.bidPackage.create({
      data: {
        projectId: project.id,
        title: "Electrical",
        scopeOfWork:
          "Complete electrical systems including power distribution, lighting, fire alarm, low voltage, and emergency generator connections.",
        csiDivisionCode: "26",
        csiDivisionName: "Electrical",
        budgetAmount: 7800000,
        bidsDueAt: new Date("2026-04-25T14:00:00-05:00"),
        bidsDueTimezone: "America/Chicago",
        status: "OPEN",
        bidFormId: bidForm.id,
        sortOrder: 4,
        invitedCount: 1,
        createdBy: emily.id,
      },
    }),
    prisma.bidPackage.create({
      data: {
        projectId: project.id,
        title: "Interior Finishes",
        scopeOfWork:
          "Drywall, acoustical ceilings, flooring, painting, and specialty finishes for all interior spaces.",
        csiDivisionCode: "09",
        csiDivisionName: "Finishes",
        budgetAmount: 4300000,
        bidsDueAt: new Date("2026-04-25T14:00:00-05:00"),
        bidsDueTimezone: "America/Chicago",
        status: "DRAFT",
        bidFormId: bidForm.id,
        sortOrder: 5,
        createdBy: marcus.id,
      },
    }),
  ]);

  const [concretePkg, steelPkg, roofingPkg, mechPkg, electricalPkg, finishesPkg] = bidPackages;
  console.log(`     ✓ ${bidPackages.length} bid packages created`);

  // ── 12. Bid Invitations ───────────────────────────────────
  console.log("  ✉️  Creating bid invitations...");
  await Promise.all([
    prisma.bidInvitation.create({
      data: {
        bidPackageId: concretePkg.id,
        companyId: loneStarConcrete.id,
        contactId: contacts[0].id,
        invitedById: emily.id,
        status: "VIEWED",
        invitedAt: new Date("2026-03-15T09:00:00-05:00"),
        emailedAt: new Date("2026-03-15T09:01:00-05:00"),
        viewedAt: new Date("2026-03-15T14:30:00-05:00"),
      },
    }),
    prisma.bidInvitation.create({
      data: {
        bidPackageId: steelPkg.id,
        companyId: precisionSteel.id,
        contactId: contacts[3].id,
        invitedById: emily.id,
        status: "BIDDING",
        invitedAt: new Date("2026-03-15T09:00:00-05:00"),
        emailedAt: new Date("2026-03-15T09:01:00-05:00"),
        viewedAt: new Date("2026-03-16T08:15:00-05:00"),
        intentToBidAt: new Date("2026-03-16T08:20:00-05:00"),
      },
    }),
    prisma.bidInvitation.create({
      data: {
        bidPackageId: roofingPkg.id,
        companyId: swRoofing.id,
        contactId: contacts[4].id,
        invitedById: emily.id,
        status: "INVITED",
        invitedAt: new Date("2026-03-20T10:00:00-05:00"),
        emailedAt: new Date("2026-03-20T10:01:00-05:00"),
      },
    }),
    prisma.bidInvitation.create({
      data: {
        bidPackageId: mechPkg.id,
        companyId: gulfCoastMech.id,
        contactId: contacts[1].id,
        invitedById: emily.id,
        status: "SUBMITTED",
        invitedAt: new Date("2026-03-15T09:00:00-05:00"),
        emailedAt: new Date("2026-03-15T09:01:00-05:00"),
        viewedAt: new Date("2026-03-15T11:00:00-05:00"),
        submittedAt: new Date("2026-03-28T16:45:00-05:00"),
      },
    }),
    prisma.bidInvitation.create({
      data: {
        bidPackageId: electricalPkg.id,
        companyId: texasElectrical.id,
        contactId: contacts[2].id,
        invitedById: emily.id,
        status: "VIEWED",
        invitedAt: new Date("2026-03-15T09:00:00-05:00"),
        emailedAt: new Date("2026-03-15T09:01:00-05:00"),
        viewedAt: new Date("2026-03-17T09:30:00-05:00"),
      },
    }),
  ]);
  console.log(`     ✓ 5 bid invitations created`);

  // ── 13. Demo Documents ────────────────────────────────────
  console.log("  📄 Creating demo documents...");
  await Promise.all([
    prisma.document.create({
      data: {
        projectId: project.id,
        name: "Structural Drawings — Set A",
        originalFilename: "Memorial_City_Structural_SetA_2026-03-01.pdf",
        category: "PLANS",
        fileType: "application/pdf",
        fileSizeBytes: 45_000_000,
        currentVersionNumber: 2,
        storagePath: `${org.id}/${project.id}/plans/structural-set-a.pdf`,
        storageUrl: "https://placeholder.supabase.co/storage/v1/object/sign/documents/structural-set-a.pdf",
        uploadedBy: marcus.id,
        visibility: "ALL_INVITED",
        notifySubsOnUpload: true,
      },
    }),
    prisma.document.create({
      data: {
        projectId: project.id,
        name: "MEP Drawings — Set A",
        originalFilename: "Memorial_City_MEP_SetA_2026-03-01.pdf",
        category: "PLANS",
        fileType: "application/pdf",
        fileSizeBytes: 62_000_000,
        storagePath: `${org.id}/${project.id}/plans/mep-set-a.pdf`,
        storageUrl: "https://placeholder.supabase.co/storage/v1/object/sign/documents/mep-set-a.pdf",
        uploadedBy: marcus.id,
        visibility: "ALL_INVITED",
        notifySubsOnUpload: true,
      },
    }),
    prisma.document.create({
      data: {
        projectId: project.id,
        name: "Project Specifications",
        originalFilename: "Memorial_City_Specs_Full_2026-03-01.pdf",
        category: "SPECIFICATIONS",
        fileType: "application/pdf",
        fileSizeBytes: 28_000_000,
        storagePath: `${org.id}/${project.id}/specs/specifications.pdf`,
        storageUrl: "https://placeholder.supabase.co/storage/v1/object/sign/documents/specifications.pdf",
        uploadedBy: marcus.id,
        visibility: "ALL_INVITED",
      },
    }),
    prisma.document.create({
      data: {
        projectId: project.id,
        name: "Addendum No. 1 — Revised Foundation Plan",
        originalFilename: "Addendum_01_Foundation_2026-03-20.pdf",
        category: "ADDENDA",
        fileType: "application/pdf",
        fileSizeBytes: 5_200_000,
        storagePath: `${org.id}/${project.id}/addenda/addendum-01.pdf`,
        storageUrl: "https://placeholder.supabase.co/storage/v1/object/sign/documents/addendum-01.pdf",
        uploadedBy: marcus.id,
        visibility: "ALL_INVITED",
        isAddendum: true,
        addendumNumber: 1,
        notifySubsOnUpload: true,
      },
    }),
    prisma.document.create({
      data: {
        projectId: project.id,
        name: "Geotechnical Report",
        originalFilename: "Geotech_Report_Memorial_City_2025-11.pdf",
        category: "REPORTS",
        fileType: "application/pdf",
        fileSizeBytes: 12_500_000,
        storagePath: `${org.id}/${project.id}/reports/geotech-report.pdf`,
        storageUrl: "https://placeholder.supabase.co/storage/v1/object/sign/documents/geotech-report.pdf",
        uploadedBy: james.id,
        visibility: "GC_TEAM_ONLY",
      },
    }),
  ]);
  console.log(`     ✓ 5 project documents created`);

  // ── 14. Activity Log Entries ──────────────────────────────
  console.log("  📝 Creating activity log entries...");
  await Promise.all([
    prisma.activityLog.create({
      data: {
        organizationId: org.id,
        projectId: project.id,
        entityType: "project",
        entityId: project.id,
        action: "PROJECT_CREATED",
        actorId: bill.id,
        actorName: "Bill Asmar",
        actorEmail: bill.email,
        metadata: { projectName: project.name },
        timestamp: new Date("2026-03-10T08:00:00-05:00"),
      },
    }),
    prisma.activityLog.create({
      data: {
        organizationId: org.id,
        projectId: project.id,
        entityType: "bid_package",
        entityId: concretePkg.id,
        action: "BID_PACKAGE_CREATED",
        actorId: marcus.id,
        actorName: "Marcus Johnson",
        actorEmail: marcus.email,
        metadata: { packageTitle: concretePkg.title },
        timestamp: new Date("2026-03-12T10:00:00-05:00"),
      },
    }),
    prisma.activityLog.create({
      data: {
        organizationId: org.id,
        projectId: project.id,
        entityType: "document",
        entityId: project.id,
        action: "DOCUMENT_UPLOADED",
        actorId: marcus.id,
        actorName: "Marcus Johnson",
        actorEmail: marcus.email,
        metadata: { documentName: "Structural Drawings — Set A" },
        timestamp: new Date("2026-03-14T09:00:00-05:00"),
      },
    }),
    prisma.activityLog.create({
      data: {
        organizationId: org.id,
        projectId: project.id,
        entityType: "bid_invitation",
        entityId: concretePkg.id,
        action: "ITB_SENT",
        actorId: emily.id,
        actorName: "Emily Rodriguez",
        actorEmail: emily.email,
        metadata: { companyName: "Lone Star Concrete", packageTitle: concretePkg.title },
        timestamp: new Date("2026-03-15T09:00:00-05:00"),
      },
    }),
    prisma.activityLog.create({
      data: {
        organizationId: org.id,
        projectId: project.id,
        entityType: "document",
        entityId: project.id,
        action: "ADDENDUM_PUBLISHED",
        actorId: marcus.id,
        actorName: "Marcus Johnson",
        actorEmail: marcus.email,
        metadata: { addendumNumber: 1, documentName: "Addendum No. 1 — Revised Foundation Plan" },
        timestamp: new Date("2026-03-20T11:00:00-05:00"),
      },
    }),
  ]);
  console.log(`     ✓ 5 activity log entries created`);

  // ── 15. Project Analytics Snapshot ────────────────────────
  console.log("  📊 Creating analytics snapshot...");
  await prisma.projectAnalyticsSnapshot.create({
    data: {
      projectId: project.id,
      organizationId: org.id,
      totalPackages: 6,
      totalInvited: 5,
      totalViewed: 4,
      totalBidding: 1,
      totalSubmitted: 1,
      totalDeclined: 0,
      totalAwarded: 0,
      responseRate: 0.2,
      coverageRate: 0.17,
    },
  });
  console.log(`     ✓ Analytics snapshot created`);

  // ── 16. Notifications ─────────────────────────────────────
  console.log("  🔔 Creating sample notifications...");
  await Promise.all([
    prisma.notification.create({
      data: {
        userId: marcus.id,
        projectId: project.id,
        type: "BID_SUBMITTED",
        title: "Bid Submitted",
        message: "Gulf Coast Mechanical submitted a bid for Mechanical (HVAC + Plumbing)",
        isRead: false,
        entityType: "bid_invitation",
        entityId: mechPkg.id,
        deepLinkUrl: `/projects/${project.id}/bid-packages/${mechPkg.id}`,
        metadata: { companyName: "Gulf Coast Mechanical", packageTitle: mechPkg.title },
      },
    }),
    prisma.notification.create({
      data: {
        userId: emily.id,
        projectId: project.id,
        type: "DEADLINE_APPROACHING",
        title: "Bids Due in 25 Days",
        message: `Bids for "${project.name}" are due on April 25, 2026 at 2:00 PM CT`,
        isRead: true,
        readAt: new Date("2026-03-31T08:00:00-05:00"),
        entityType: "project",
        entityId: project.id,
        deepLinkUrl: `/projects/${project.id}`,
      },
    }),
  ]);
  console.log(`     ✓ 2 notifications created`);

  // ── 17. Bidder List Template ──────────────────────────────
  console.log("  📋 Creating bidder list template...");
  const bidderTemplate = await prisma.bidderListTemplate.create({
    data: {
      organizationId: org.id,
      name: "Houston Healthcare — Preferred Subs",
      description: "Pre-approved subcontractors for healthcare projects in the Houston metro area",
      createdBy: bill.id,
      entries: {
        create: [
          {
            companyId: loneStarConcrete.id,
            contactId: contacts[0].id,
            csiDivisionCode: "03",
            csiDivisionName: "Concrete",
            sortOrder: 0,
          },
          {
            companyId: gulfCoastMech.id,
            contactId: contacts[1].id,
            csiDivisionCode: "23",
            csiDivisionName: "HVAC",
            sortOrder: 1,
          },
          {
            companyId: texasElectrical.id,
            contactId: contacts[2].id,
            csiDivisionCode: "26",
            csiDivisionName: "Electrical",
            sortOrder: 2,
          },
          {
            companyId: precisionSteel.id,
            contactId: contacts[3].id,
            csiDivisionCode: "05",
            csiDivisionName: "Metals",
            sortOrder: 3,
          },
          {
            companyId: houstonFire.id,
            contactId: contacts[6].id,
            csiDivisionCode: "21",
            csiDivisionName: "Fire Suppression",
            sortOrder: 4,
          },
        ],
      },
    },
  });
  console.log(`     ✓ Bidder list template: ${bidderTemplate.name}`);

  // ── Done ──────────────────────────────────────────────────
  console.log("\n✅ Seed complete! Summary:");
  console.log(`   • ${CSI_DIVISIONS.length} CSI divisions`);
  console.log(`   • 1 organization (${org.name})`);
  console.log(`   • 2 offices`);
  console.log(`   • ${users.length} users`);
  console.log(`   • ${companies.length} companies + ${contacts.length} contacts`);
  console.log(`   • 1 project with ${bidPackages.length} bid packages`);
  console.log(`   • 5 bid invitations`);
  console.log(`   • 5 documents`);
  console.log(`   • 1 bid form template + 1 bid form`);
  console.log(`   • 1 bidder list template`);
  console.log(`   • 5 activity log entries`);
  console.log(`   • 1 analytics snapshot`);
  console.log(`   • 2 notifications\n`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
