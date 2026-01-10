# 🔐 Guia de Configuração de Login

Este guia explica como funciona o sistema de autenticação para proteger o painel do barbeiro.

## 🎯 Funcionalidades Implementadas

✅ **Tela de login** - Interface de autenticação com tema escuro  
✅ **Proteção de rotas** - PainelBarber e Financeiro protegidos  
✅ **Credenciais padrão** - Usuário e senha fixos para acesso  
✅ **Sessão persistente** - Login mantido após recarregar página  
✅ **Logout** - Botão para sair do sistema  
✅ **Redirecionamento** - Redireciona para login se não autenticado  

---

## 🔑 Credenciais Padrão

**Usuário:** `barbeiro`  
**Senha:** `barbeiro123`

**Por que credenciais fixas?**
- Sistema simples para MVP
- Fácil de configurar e usar
- Em produção, pode ser migrado para banco de dados

---

## 🛡️ Como Funciona

### Fluxo de Autenticação:

```
1. Usuário acessa /painelBarber ou /financeiro
   ↓
2. Middleware verifica cookie de autenticação
   ↓
3. Se não autenticado → Redireciona para /login
   ↓
4. Usuário preenche credenciais e faz login
   ↓
5. Sistema valida credenciais
   ↓
6. Cria sessão no localStorage + cookie
   ↓
7. Redireciona para painelBarber
   ↓
8. Página verifica autenticação novamente (client-side)
   ↓
9. Se autenticado → Mostra conteúdo
   Se não → Redireciona para login
```

---

## 📁 Arquivos Criados

### 1. `lib/auth.ts`
Biblioteca de autenticação com funções:
- `login()` - Valida credenciais e cria sessão
- `logout()` - Remove sessão
- `isAuthenticated()` - Verifica se está autenticado
- `getSession()` - Obtém dados da sessão

### 2. `app/login/page.tsx`
Página de login com:
- Formulário de usuário/senha
- Validação de credenciais
- Mensagens de erro
- Link para agendamento público
- Tema escuro consistente

### 3. `middleware.ts`
Middleware do Next.js que:
- Protege rotas `/painelBarber` e `/financeiro`
- Verifica cookie de autenticação
- Redireciona para login se não autenticado

---

## 🔒 Segurança

### Implementado:
- ✅ Validação de credenciais
- ✅ Sessão com expiração (24 horas)
- ✅ Proteção de rotas no middleware
- ✅ Verificação dupla (middleware + client-side)
- ✅ Logout remove sessão completamente

### Em Produção, Adicionar:
- [ ] Hash de senha (bcrypt)
- [ ] Múltiplos usuários no banco de dados
- [ ] Rate limiting (prevenir brute force)
- [ ] Tokens JWT ao invés de localStorage
- [ ] Refresh tokens
- [ ] Logs de acesso

---

## 🎨 Interface

### Página de Login:
- Tema escuro consistente
- Ícones visuais (Lock, User)
- Campo de senha com toggle mostrar/ocultar
- Mensagens de erro claras
- Credenciais padrão exibidas (apenas em dev)
- Link para agendamento público

### Painel Protegido:
- Botão de logout no cabeçalho
- Nome do usuário logado exibido
- Verificação de autenticação ao carregar
- Loading state durante verificação

---

## 🚀 Como Usar

### 1. Acessar Login:
```
http://localhost:3000/login
```

### 2. Fazer Login:
- Usuário: `barbeiro`
- Senha: `barbeiro123`
- Clique em "Entrar"

### 3. Acessar Painel:
- Após login, redireciona automaticamente
- Ou acesse: `http://localhost:3000/painelBarber`

### 4. Fazer Logout:
- Clique no botão "Sair" no cabeçalho
- Confirma logout
- Redireciona para login

---

## 🔄 Rotas Protegidas

As seguintes rotas requerem autenticação:

- `/painelBarber` - Painel principal do barbeiro
- `/painelBarber/*` - Qualquer sub-rota do painel
- `/financeiro` - Página financeira
- `/financeiro/*` - Qualquer sub-rota financeira

### Rotas Públicas (sem autenticação):

- `/` - Página inicial
- `/agendamento` - Formulário de agendamento
- `/login` - Página de login

---

## 🛠️ Personalizar Credenciais

Para mudar usuário/senha padrão, edite `lib/auth.ts`:

```typescript
const DEFAULT_USERNAME = 'seu-usuario'
const DEFAULT_PASSWORD = 'sua-senha-segura'
```

**⚠️ Em produção:** Use variáveis de ambiente:

```typescript
const DEFAULT_USERNAME = process.env.ADMIN_USERNAME || 'barbeiro'
const DEFAULT_PASSWORD = process.env.ADMIN_PASSWORD || 'barbeiro123'
```

---

## 📝 Migrar para Banco de Dados (Futuro)

Quando quiser múltiplos usuários:

1. **Criar tabela no Prisma:**
```prisma
model Barber {
  id       String   @id @default(cuid())
  username String   @unique
  password String   // Hash bcrypt
  name     String
  createdAt DateTime @default(now())
}
```

2. **Atualizar lib/auth.ts:**
```typescript
export async function login(username: string, password: string) {
  const barber = await prisma.barber.findUnique({
    where: { username }
  })
  
  if (!barber) return false
  
  const isValid = await bcrypt.compare(password, barber.password)
  if (isValid) {
    // Criar sessão...
  }
}
```

---

## ✅ Checklist de Implementação

- [x] Biblioteca de autenticação (`lib/auth.ts`)
- [x] Página de login (`app/login/page.tsx`)
- [x] Middleware de proteção (`middleware.ts`)
- [x] Proteção do painelBarber
- [x] Proteção do financeiro
- [x] Botão de logout
- [x] Verificação de autenticação
- [x] Redirecionamento automático
- [x] Tema escuro no login
- [ ] Migração para banco de dados (futuro)
- [ ] Hash de senhas (futuro)

---

## 🐛 Troubleshooting

### Erro: "Redirecionando infinitamente"

**Solução:** Verifique se middleware está configurado corretamente e se cookie está sendo criado.

### Erro: "Não consigo fazer login"

**Verifique:**
1. Credenciais estão corretas? (`barbeiro` / `barbeiro123`)
2. localStorage está habilitado no navegador?
3. Console do navegador mostra erros?

### Erro: "Sessão expira muito rápido"

**Solução:** Ajuste tempo de expiração em `lib/auth.ts`:
```typescript
const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000 // 24 horas
```

---

**Sistema de login implementado e funcionando! 🔐**

