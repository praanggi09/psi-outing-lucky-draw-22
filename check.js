const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config();

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  const participants = await prisma.participant.count();
  const prizes = await prisma.prize.count();

  console.log(`Participants: ${participants}`);
  console.log(`Prizes: ${prizes}`);
}

main().catch(console.error).finally(() => process.exit(0));
