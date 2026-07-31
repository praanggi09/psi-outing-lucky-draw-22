import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL;

// Locally (macOS), Node prefers IPv6 which is broken on Supabase pooler, so we convert to the direct URL.
// On Vercel (production), IPv6 is blocked so the direct URL hangs, so we MUST use the pooler URL!
if (!process.env.VERCEL && connectionString && connectionString.includes('pooler.supabase.com')) {
  const match = connectionString.match(/postgres:\/\/([^.]+)\.([^:]+):([^@]+)@[^\/]+\/([^?]+)/);
  if (match) {
    const [, user, projectRef, password, db] = match;
    connectionString = `postgres://${user}:${password}@db.${projectRef}.supabase.co:5432/${db}`;
  }
}

if (connectionString) {
  // Strip sslmode=require because it interferes with pg-connection-string forcing ssl:true
  connectionString = connectionString.replace('?sslmode=require', '').replace('&sslmode=require', '');
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  const pool = new Pool({ 
    connectionString,
    ssl: connectionString?.includes('supabase') || connectionString?.includes('neon') 
      ? { rejectUnauthorized: false } 
      : undefined
  });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });
} else {
  if (!globalForPrisma.prisma) {
    const pool = new Pool({ 
      connectionString,
      ssl: connectionString?.includes('supabase') || connectionString?.includes('neon') 
        ? { rejectUnauthorized: false } 
        : undefined
    });
    const adapter = new PrismaPg(pool);
    globalForPrisma.prisma = new PrismaClient({ adapter });
  }
  prisma = globalForPrisma.prisma;
}

export { prisma };
