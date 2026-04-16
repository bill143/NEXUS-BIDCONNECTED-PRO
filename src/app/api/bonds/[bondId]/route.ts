import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: { bondId: string } }
) {
  const bond = await prisma.bond.findUnique({
    where: { id: params.bondId },
    include: {
      project: true,
      statusHistory: { orderBy: { changedAt: "desc" } },
      reminders: { orderBy: { dueDate: "asc" } },
    },
  });

  if (!bond) {
    return NextResponse.json({ error: "Bond not found" }, { status: 404 });
  }

  return NextResponse.json(bond);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { bondId: string } }
) {
  const body = await request.json();

  const bond = await prisma.bond.update({
    where: { id: params.bondId },
    data: {
      suretyCompany: body.suretyCompany,
      principalName: body.principalName,
      obligeeName: body.obligeeName,
      bondAmount: body.bondAmount,
      premiumAmount: body.premiumAmount,
      premiumRate: body.premiumRate,
      underwriter: body.underwriter,
      agentName: body.agentName,
      agentContact: body.agentContact,
      notes: body.notes,
    },
    include: { project: true },
  });

  return NextResponse.json(bond);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { bondId: string } }
) {
  await prisma.bond.delete({ where: { id: params.bondId } });
  return NextResponse.json({ success: true });
}
