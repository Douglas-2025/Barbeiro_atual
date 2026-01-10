import { PrismaClient } from '@prisma/client'

// Singleton do Prisma Client para evitar múltiplas instâncias em desenvolvimento
// Por que: Em desenvolvimento, Next.js faz hot-reload e pode criar várias conexões
// PostgreSQL tem limite de conexões, então precisamos reutilizar a mesma instância
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Cria instância única do Prisma Client
// Por que: Prisma Client é a interface que usamos para fazer queries no banco
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Logs em desenvolvimento ajudam a debugar queries
    // Por que: Vemos exatamente qual SQL está sendo executado
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

// Em desenvolvimento, salva a instância no global para reutilizar entre hot-reloads
// Por que: Evita criar nova conexão a cada vez que o código recarrega
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

