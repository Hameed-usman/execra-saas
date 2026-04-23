import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Checking Connected Tools ---');
  const tools = await prisma.connectedTool.findMany({
    select: {
      tenantId: true,
      toolName: true,
      createdAt: true,
      expiresAt: true,
    }
  });

  if (tools.length === 0) {
    console.log('No tools connected yet.');
  } else {
    console.table(tools);
    console.log('✅ Found connected tool(s) in the database.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
