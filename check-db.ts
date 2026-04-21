import { db } from './lib/db';

async function main() {
  const tasks = await db.agentTask.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.dir(tasks, { depth: null });
}

main().catch(console.error).finally(() => process.exit(0));
