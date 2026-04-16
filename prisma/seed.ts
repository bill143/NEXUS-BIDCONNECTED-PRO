import { PrismaClient } from "@prisma/client";
import { addDays, subDays } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  // Clean up existing data
  await prisma.reminder.deleteMany();
  await prisma.bondStatusHistory.deleteMany();
  await prisma.bond.deleteMany();
  await prisma.project.deleteMany();

  const now = new Date();

  // Create projects
  const projects = await Promise.all([
    prisma.project.create({
      data: {
        name: "Downtown Office Complex",
        projectNumber: "PRJ-2024-001",
        owner: "Metro Development Corp",
        location: "450 Main Street, Portland, OR",
        bidDueDate: addDays(now, 45),
        estimatedValue: 28500000,
        status: "active",
      },
    }),
    prisma.project.create({
      data: {
        name: "Highway 101 Bridge Replacement",
        projectNumber: "PRJ-2024-002",
        owner: "Oregon DOT",
        location: "Highway 101 MP 42.5, Lincoln City, OR",
        bidDueDate: addDays(now, 20),
        estimatedValue: 15200000,
        status: "active",
      },
    }),
    prisma.project.create({
      data: {
        name: "Municipal Water Treatment Facility",
        projectNumber: "PRJ-2024-003",
        owner: "City of Salem Public Works",
        location: "1200 Water Treatment Rd, Salem, OR",
        bidDueDate: subDays(now, 30),
        estimatedValue: 42000000,
        status: "active",
      },
    }),
    prisma.project.create({
      data: {
        name: "Riverside Elementary School",
        projectNumber: "PRJ-2024-004",
        owner: "Portland Public Schools",
        location: "825 River Drive, Portland, OR",
        bidDueDate: addDays(now, 90),
        estimatedValue: 18750000,
        status: "active",
      },
    }),
    prisma.project.create({
      data: {
        name: "Airport Terminal Expansion",
        projectNumber: "PRJ-2023-015",
        owner: "Port of Portland",
        location: "PDX International Airport, Portland, OR",
        bidDueDate: subDays(now, 120),
        estimatedValue: 95000000,
        status: "active",
      },
    }),
  ]);

  // Create bonds with various statuses and timelines
  const bonds = [
    // Downtown Office Complex bonds
    {
      bondNumber: "BB-2024-0156",
      type: "bid_bond",
      status: "active",
      suretyCompany: "Liberty Mutual Surety",
      principalName: "Pacific Northwest Contractors",
      obligeeName: "Metro Development Corp",
      bondAmount: 1425000,
      premiumAmount: 14250,
      premiumRate: 1.0,
      effectiveDate: subDays(now, 30),
      expirationDate: addDays(now, 60),
      projectId: projects[0].id,
      agentName: "Sarah Mitchell",
      agentContact: "sarah.mitchell@libertymutual.com",
    },
    {
      bondNumber: "PB-2024-0157",
      type: "performance_bond",
      status: "issued",
      suretyCompany: "Liberty Mutual Surety",
      principalName: "Pacific Northwest Contractors",
      obligeeName: "Metro Development Corp",
      bondAmount: 28500000,
      premiumAmount: 285000,
      premiumRate: 1.0,
      effectiveDate: subDays(now, 5),
      expirationDate: addDays(now, 365),
      projectId: projects[0].id,
      agentName: "Sarah Mitchell",
      agentContact: "sarah.mitchell@libertymutual.com",
    },

    // Highway Bridge bonds
    {
      bondNumber: "BB-2024-0201",
      type: "bid_bond",
      status: "expiring",
      suretyCompany: "Travelers Casualty & Surety",
      principalName: "Western Bridge Builders Inc",
      obligeeName: "Oregon DOT",
      bondAmount: 760000,
      premiumAmount: 9120,
      premiumRate: 1.2,
      effectiveDate: subDays(now, 60),
      expirationDate: addDays(now, 10),
      projectId: projects[1].id,
      underwriter: "John Reynolds",
      agentName: "Mark Thompson",
      agentContact: "mthompson@travelers.com",
    },

    // Water Treatment bonds
    {
      bondNumber: "PB-2024-0089",
      type: "performance_bond",
      status: "active",
      suretyCompany: "CNA Surety",
      principalName: "Northwest Environmental Construction",
      obligeeName: "City of Salem Public Works",
      bondAmount: 42000000,
      premiumAmount: 504000,
      premiumRate: 1.2,
      effectiveDate: subDays(now, 90),
      expirationDate: addDays(now, 275),
      projectId: projects[2].id,
      agentName: "Lisa Chen",
      agentContact: "lchen@cnasurety.com",
    },
    {
      bondNumber: "PY-2024-0090",
      type: "payment_bond",
      status: "active",
      suretyCompany: "CNA Surety",
      principalName: "Northwest Environmental Construction",
      obligeeName: "City of Salem Public Works",
      bondAmount: 42000000,
      premiumAmount: 420000,
      premiumRate: 1.0,
      effectiveDate: subDays(now, 90),
      expirationDate: addDays(now, 275),
      projectId: projects[2].id,
      agentName: "Lisa Chen",
      agentContact: "lchen@cnasurety.com",
    },

    // School bonds
    {
      bondNumber: "BB-2024-0312",
      type: "bid_bond",
      status: "active",
      suretyCompany: "Hartford Fire Insurance",
      principalName: "Oregon Education Builders",
      obligeeName: "Portland Public Schools",
      bondAmount: 937500,
      premiumAmount: 11250,
      premiumRate: 1.2,
      effectiveDate: subDays(now, 15),
      expirationDate: addDays(now, 75),
      projectId: projects[3].id,
      agentName: "David Park",
      agentContact: "dpark@hartford.com",
    },

    // Airport bonds - some already renewed
    {
      bondNumber: "PB-2023-0445",
      type: "performance_bond",
      status: "active",
      suretyCompany: "Zurich American Insurance",
      principalName: "Pacific Aviation Construction Group",
      obligeeName: "Port of Portland",
      bondAmount: 95000000,
      premiumAmount: 1140000,
      premiumRate: 1.2,
      effectiveDate: subDays(now, 180),
      expirationDate: addDays(now, 185),
      renewalDate: subDays(now, 30),
      projectId: projects[4].id,
      underwriter: "Amanda Foster",
      agentName: "Robert Kim",
      agentContact: "rkim@zurich.com",
      notes: "Renewed once. Original bond issued 2023-06-15.",
    },
    {
      bondNumber: "PY-2023-0446",
      type: "payment_bond",
      status: "expiring",
      suretyCompany: "Zurich American Insurance",
      principalName: "Pacific Aviation Construction Group",
      obligeeName: "Port of Portland",
      bondAmount: 95000000,
      premiumAmount: 950000,
      premiumRate: 1.0,
      effectiveDate: subDays(now, 180),
      expirationDate: addDays(now, 18),
      projectId: projects[4].id,
      agentName: "Robert Kim",
      agentContact: "rkim@zurich.com",
    },
    {
      bondNumber: "BB-2023-0444",
      type: "bid_bond",
      status: "released",
      suretyCompany: "Zurich American Insurance",
      principalName: "Pacific Aviation Construction Group",
      obligeeName: "Port of Portland",
      bondAmount: 4750000,
      premiumAmount: 47500,
      premiumRate: 1.0,
      effectiveDate: subDays(now, 300),
      expirationDate: subDays(now, 200),
      projectId: projects[4].id,
      agentName: "Robert Kim",
      agentContact: "rkim@zurich.com",
    },
  ];

  for (const bondData of bonds) {
    const bond = await prisma.bond.create({ data: bondData });

    // Create initial status history
    await prisma.bondStatusHistory.create({
      data: {
        bondId: bond.id,
        fromStatus: "new",
        toStatus: "issued",
        reason: "Bond created",
        changedAt: bond.effectiveDate,
      },
    });

    // Add additional history for non-draft/issued bonds
    if (bond.status !== "draft" && bond.status !== "issued") {
      await prisma.bondStatusHistory.create({
        data: {
          bondId: bond.id,
          fromStatus: "issued",
          toStatus: "active",
          reason: "Bond activated after project award",
          changedAt: addDays(bond.effectiveDate, 2),
        },
      });
    }

    if (bond.status === "expiring") {
      await prisma.bondStatusHistory.create({
        data: {
          bondId: bond.id,
          fromStatus: "active",
          toStatus: "expiring",
          changedBy: "system",
          reason: "Auto-transitioned: bond expiring within 30 days",
          changedAt: subDays(now, 5),
        },
      });
    }

    if (bond.status === "released") {
      await prisma.bondStatusHistory.create({
        data: {
          bondId: bond.id,
          fromStatus: "active",
          toStatus: "released",
          reason: "Bond released after project contract awarded",
          changedAt: subDays(now, 200),
        },
      });
    }

    // Generate reminders for active/expiring bonds
    if (["active", "issued", "expiring"].includes(bond.status)) {
      const daysUntilExpiry = Math.floor(
        (bond.expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      const thresholds = [60, 30, 14, 7];
      for (const threshold of thresholds) {
        if (daysUntilExpiry > 0 && daysUntilExpiry <= threshold + 30) {
          const dueDate = addDays(bond.expirationDate, -threshold);
          if (dueDate > subDays(now, 7)) {
            await prisma.reminder.create({
              data: {
                bondId: bond.id,
                projectId: bond.projectId,
                type: threshold <= 14 ? "renewal_due" : "expiration_warning",
                title: `Bond ${bond.bondNumber} expires in ${threshold} days`,
                message: `Bond #${bond.bondNumber} for the associated project expires on ${bond.expirationDate.toLocaleDateString()}.`,
                dueDate,
                priority:
                  threshold <= 7
                    ? "critical"
                    : threshold <= 14
                    ? "high"
                    : "medium",
                status: dueDate < now ? "sent" : "pending",
              },
            });
          }
        }
      }
    }
  }

  console.log("Seed completed successfully.");
  console.log(`Created ${projects.length} projects`);
  console.log(`Created ${bonds.length} bonds`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
