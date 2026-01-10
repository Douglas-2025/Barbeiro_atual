# 🗄️ Guia Completo: Conectando Frontend ao PostgreSQL

Este guia te ensina passo a passo como conectar seu frontend Next.js ao PostgreSQL usando Prisma.

## 📚 Conceitos Básicos

### O que é cada coisa?

1. **PostgreSQL**: Banco de dados relacional (armazena dados)
2. **Prisma**: ORM (Object-Relational Mapping) - traduz JavaScript para SQL
3. **API Routes**: Endpoints no Next.js que fazem a ponte entre frontend e banco
4. **Frontend**: Interface que o usuário vê (React)

### Fluxo de Dados

```
Frontend (React) 
    ↓ (fetch/axios)
API Route (Next.js) 
    ↓ (Prisma Client)
PostgreSQL (Banco de Dados)
```

---

## 🚀 PASSO 1: Instalar Dependências

Primeiro, precisamos instalar Prisma e o cliente PostgreSQL:

```bash
cd barbearia-frontend
npm install @prisma/client
npm install -D prisma
```

**Por que?**
- `@prisma/client`: Cliente que faz queries no banco
- `prisma`: Ferramenta CLI para gerar código e migrações

---

## 🗂️ PASSO 2: Inicializar Prisma

Crie a estrutura do Prisma:

```bash
npx prisma init
```

Isso cria:
- `prisma/schema.prisma` - Define modelos do banco
- `.env` - Variáveis de ambiente (se não existir)

---

## 📝 PASSO 3: Configurar Schema do Prisma

Edite `prisma/schema.prisma`:

```prisma
// Configuração do Prisma
generator client {
  provider = "prisma-client-js"
}

// Configuração da conexão com PostgreSQL
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL") // Lê do .env
}

// Modelo de Agendamento
// Por que: Define estrutura da tabela no banco
model Agendamento {
  id          String   @id @default(cuid()) // ID único gerado automaticamente
  date        String   // Data no formato YYYY-MM-DD
  time        String   // Horário no formato HH:MM
  dateTime    DateTime // Data e hora combinadas
  clientName  String   // Nome do cliente
  clientPhone String   // Telefone do cliente
  service     String   // Tipo de serviço (corte, barba, combo)
  duration    Int      // Duração em minutos
  price       Float    // Valor do serviço
  status      String   @default("pendente") // Status do agendamento
  createdAt   DateTime @default(now()) // Data de criação
  updatedAt   DateTime @updatedAt // Data de atualização
  
  // Índice para consultas rápidas por data
  @@index([date])
}
```

**O que cada coisa faz?**
- `@id`: Define chave primária
- `@default(cuid())`: Gera ID único automaticamente
- `@default(now())`: Define data atual automaticamente
- `@updatedAt`: Atualiza automaticamente quando registro muda
- `@@index`: Cria índice para consultas mais rápidas

---

## 🔐 PASSO 4: Configurar Variáveis de Ambiente

Crie/edite `.env` na raiz do projeto:

```env
# URL de conexão com PostgreSQL
# Formato: postgresql://usuario:senha@host:porta/database

# Opção 1: PostgreSQL local (sem Docker)
DATABASE_URL="postgresql://postgres:senha123@localhost:5432/barbearia?schema=public"

# Opção 2: PostgreSQL no Docker (usando barbersaas)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/barbersaas?schema=public"

# Opção 3: PostgreSQL na nuvem (ex: Supabase, Railway, Neon)
# DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
```

**Como obter a URL?**
- **Local**: Instale PostgreSQL ou use Docker
- **Nuvem**: Use serviços como Supabase (grátis), Railway, Neon

---

## 🐳 PASSO 5: Subir PostgreSQL (se não tiver)

### Opção A: Usar Docker (Recomendado)

Se você já tem o projeto `barbersaas`, use o PostgreSQL dele:

```bash
cd ../barbersaas
docker-compose up -d postgres
```

### Opção B: Instalar PostgreSQL Localmente

```bash
# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib

# Iniciar serviço
sudo systemctl start postgresql

# Criar banco
sudo -u postgres psql
CREATE DATABASE barbearia;
\q
```

### Opção C: Usar Serviço na Nuvem (Grátis)

1. Acesse [Supabase](https://supabase.com) ou [Neon](https://neon.tech)
2. Crie um projeto
3. Copie a URL de conexão
4. Cole no `.env`

---

## 🔨 PASSO 6: Gerar Prisma Client

Gera o código TypeScript para acessar o banco:

```bash
npx prisma generate
```

**O que isso faz?**
- Lê `schema.prisma`
- Gera código TypeScript type-safe
- Cria `node_modules/.prisma/client` com funções prontas

---

## 📊 PASSO 7: Criar Tabelas no Banco (Migração)

Cria as tabelas no PostgreSQL baseado no schema:

```bash
npx prisma migrate dev --name init
```

**O que isso faz?**
- Cria pasta `prisma/migrations/`
- Gera SQL para criar tabelas
- Executa SQL no banco
- Cria tabela `Agendamento` no PostgreSQL

**Verificar se funcionou:**
```bash
npx prisma studio
```
Abre interface visual para ver dados no banco!

---

## 🔌 PASSO 8: Criar Cliente Prisma

Crie `lib/prisma.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

// Singleton do Prisma Client
// Por que: Evita criar múltiplas conexões (Next.js hot-reload cria várias instâncias)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

**Por que singleton?**
- Next.js recarrega módulos em dev
- Sem singleton, criaria várias conexões
- PostgreSQL tem limite de conexões

---

## 🌐 PASSO 9: Criar API Routes

### 9.1. Criar API para LISTAR agendamentos

Crie `app/api/agendamentos/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/agendamentos
// Por que: Retorna todos os agendamentos do banco
export async function GET() {
  try {
    // Busca todos os agendamentos ordenados por data
    const agendamentos = await prisma.agendamento.findMany({
      orderBy: {
        date: 'asc', // Ordena por data (mais antigo primeiro)
      },
    })

    return NextResponse.json(agendamentos)
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar agendamentos' },
      { status: 500 }
    )
  }
}
```

### 9.2. Criar API para CRIAR agendamento

No mesmo arquivo, adicione:

```typescript
// POST /api/agendamentos
// Por que: Cria novo agendamento no banco
export async function POST(request: Request) {
  try {
    // Lê dados do body da requisição
    const body = await request.json()
    
    // Validação básica
    if (!body.clientName || !body.date || !body.time) {
      return NextResponse.json(
        { error: 'Campos obrigatórios faltando' },
        { status: 400 }
      )
    }

    // Cria agendamento no banco
    const agendamento = await prisma.agendamento.create({
      data: {
        date: body.date,
        time: body.time,
        dateTime: new Date(`${body.date}T${body.time}:00`),
        clientName: body.clientName,
        clientPhone: body.clientPhone,
        service: body.service,
        duration: body.duration || 30,
        price: body.price || 0,
        status: body.status || 'pendente',
      },
    })

    return NextResponse.json(agendamento, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar agendamento:', error)
    return NextResponse.json(
      { error: 'Erro ao criar agendamento' },
      { status: 500 }
    )
  }
}
```

### 9.3. Criar API para ATUALIZAR agendamento

Crie `app/api/agendamentos/[id]/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PUT /api/agendamentos/[id]
// Por que: Atualiza status ou dados de um agendamento
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    const agendamento = await prisma.agendamento.update({
      where: { id: params.id },
      data: body, // Atualiza apenas campos enviados
    })

    return NextResponse.json(agendamento)
  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar agendamento' },
      { status: 500 }
    )
  }
}

// DELETE /api/agendamentos/[id]
// Por que: Remove agendamento do banco
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.agendamento.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar agendamento:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar agendamento' },
      { status: 500 }
    )
  }
}
```

---

## 🎨 PASSO 10: Atualizar Frontend para Usar APIs

### 10.1. Atualizar página de agendamento

Edite `app/agendamento/page.tsx`:

```typescript
// No handleSubmit, substitua localStorage por API:
const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault()
  
  setIsSubmitting(true)

  try {
    // Calcula preço baseado no serviço
    const prices = { corte: 30, barba: 20, combo: 45 }
    const price = prices[service as keyof typeof prices] || 0

    // Faz POST para API
    const response = await fetch('/api/agendamentos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        date,
        time,
        clientName,
        clientPhone,
        service,
        duration: service === 'combo' ? 60 : 30,
        price,
        status: 'pendente',
      }),
    })

    if (!response.ok) {
      throw new Error('Erro ao criar agendamento')
    }

    const novoAgendamento = await response.json()
    
    alert(`Agendamento criado! ID: ${novoAgendamento.id}`)
    
    // Limpa formulário
    setDate("")
    setService("")
    setTime("")
    setClientName("")
    setClientPhone("")
  } catch (error) {
    console.error(error)
    alert("Erro ao criar agendamento")
  } finally {
    setIsSubmitting(false)
  }
}
```

### 10.2. Atualizar painelBarber

Edite `app/painelBarber/page.tsx`:

```typescript
// Substitua getAgendamentosOrdenados() por fetch da API:
useEffect(() => {
  async function carregarAgendamentos() {
    try {
      const response = await fetch('/api/agendamentos')
      if (response.ok) {
        const dados = await response.json()
        setAgendamentos(dados)
      }
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error)
    }
  }
  
  carregarAgendamentos()
  const interval = setInterval(carregarAgendamentos, 5000)
  return () => clearInterval(interval)
}, [filtroStatus])
```

### 10.3. Atualizar funções de ação

```typescript
// Substitua deleteAgendamento() por:
const handleExcluir = async (id: string) => {
  if (!confirm('Tem certeza?')) return
  
  try {
    const response = await fetch(`/api/agendamentos/${id}`, {
      method: 'DELETE',
    })
    
    if (response.ok) {
      carregarAgendamentos()
      alert('Agendamento excluído!')
    }
  } catch (error) {
    alert('Erro ao excluir')
  }
}

// Substitua updateAgendamentoStatus() por:
const handleConfirmar = async (id: string) => {
  try {
    const response = await fetch(`/api/agendamentos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'confirmado' }),
    })
    
    if (response.ok) {
      carregarAgendamentos()
    }
  } catch (error) {
    alert('Erro ao confirmar')
  }
}
```

---

## ✅ PASSO 11: Testar Tudo

1. **Inicie o servidor:**
```bash
npm run dev
```

2. **Teste criar agendamento:**
   - Acesse `/agendamento`
   - Preencha formulário
   - Envie
   - Verifique no banco: `npx prisma studio`

3. **Teste listar agendamentos:**
   - Acesse `/painelBarber`
   - Deve mostrar agendamentos do banco

4. **Teste atualizar:**
   - Clique em "Confirmar" em um agendamento
   - Status deve mudar no banco

---

## 🐛 Troubleshooting

### Erro: "Can't reach database server"

**Solução:**
- Verifique se PostgreSQL está rodando
- Confirme DATABASE_URL no `.env`
- Teste conexão: `psql $DATABASE_URL`

### Erro: "Table doesn't exist"

**Solução:**
```bash
npx prisma migrate dev
```

### Erro: "Prisma Client not generated"

**Solução:**
```bash
npx prisma generate
```

### Erro: "Too many connections"

**Solução:**
- Use singleton do Prisma (já implementado)
- Reinicie servidor Next.js

---

## 📚 Próximos Passos

1. **Adicionar validação com Zod**
2. **Implementar autenticação**
3. **Adicionar paginação**
4. **Criar índices para performance**
5. **Implementar soft delete**

---

## 🎓 Resumo do Fluxo

```
1. Frontend faz fetch('/api/agendamentos')
   ↓
2. API Route recebe requisição
   ↓
3. Prisma Client faz query no PostgreSQL
   ↓
4. PostgreSQL retorna dados
   ↓
5. Prisma formata dados
   ↓
6. API Route retorna JSON
   ↓
7. Frontend recebe e atualiza UI
```

**Parabéns! Você agora entende fullstack! 🎉**

