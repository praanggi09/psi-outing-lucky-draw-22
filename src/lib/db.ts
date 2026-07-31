import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL;

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
