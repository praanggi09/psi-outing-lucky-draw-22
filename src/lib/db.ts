import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL;

// Locally (macOS), Node prefers IPv6 which is broken on Supabase pooler, so we convert to the direct URL.
// On Vercel (production), IPv6 is blocked so the direct URL hangs, so we MUST use the pooler URL!
if (process.env.NODE_ENV !== 'production' && connectionString && connectionString.includes('pooler.supabase.com')) {
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

const pool = new Pool({ 
  connectionString,
  ssl: connectionString?.includes('supabase') || connectionString?.includes('neon') || process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : undefined
});

const adapter = new PrismaPg(pool);
export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
