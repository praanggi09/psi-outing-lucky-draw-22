import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const { POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_HOST, POSTGRES_DATABASE } = process.env;

let connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL;

// If we detect Vercel Supabase vars, construct a direct connection to bypass pgbouncer ssl issues
if (POSTGRES_USER && POSTGRES_PASSWORD && POSTGRES_HOST && POSTGRES_DATABASE) {
  connectionString = `postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:5432/${POSTGRES_DATABASE}`;
} else if (connectionString) {
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
