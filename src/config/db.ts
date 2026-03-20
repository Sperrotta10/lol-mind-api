import { PrismaClient } from '../generated/prisma/index.js';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { env } from "./env.js"


// 1. Verificamos que la variable de entorno exista para evitar errores en producción
const connectionString = env.DATABASE_URL;

// 2. Creamos el Pool nativo
const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: env.DATABASE_SSL_REJECT_UNAUTHORIZED,
  },
});

// 3. Pasamos el pool al adaptador (Usamos 'as any' para calmar a TypeScript)
const adapter = new PrismaPg(pool as any);

// 4. Inicializamos Prisma
export const prisma = new PrismaClient({ adapter });

export const disconnectDatabase = async (): Promise<void> => {
  await prisma.$disconnect();
  await pool.end();
};