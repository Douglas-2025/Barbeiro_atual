# 📝 Exemplo Prático: Como Usar as APIs no Frontend

Este arquivo mostra exemplos práticos de como substituir localStorage por chamadas à API.

## 🔄 Comparação: localStorage vs API

### ❌ ANTES (localStorage)
```typescript
// lib/agendamentos.ts
export function createAgendamento(data) {
  const agendamentos = getAgendamentos()
  const novo = { ...data, id: Date.now().toString() }
  agendamentos.push(novo)
  localStorage.setItem('agendamentos', JSON.stringify(agendamentos))
  return novo
}
```

### ✅ DEPOIS (API)
```typescript
// No componente React
const response = await fetch('/api/agendamentos', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
})
const novoAgendamento = await response.json()
```

---

## 📋 Exemplo 1: Criar Agendamento

### No arquivo `app/agendamento/page.tsx`:

```typescript
const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault()
  setIsSubmitting(true)

  try {
    // Calcula preço baseado no serviço
    const prices = { corte: 30, barba: 20, combo: 45 }
    const price = prices[service as keyof typeof prices] || 0

    // ✅ CHAMADA À API (substitui createAgendamento do localStorage)
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

    // Verifica se deu erro
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erro ao criar agendamento')
    }

    // Recebe agendamento criado (com ID do banco)
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
    alert("Erro ao criar agendamento. Tente novamente.")
  } finally {
    setIsSubmitting(false)
  }
}
```

---

## 📋 Exemplo 2: Listar Agendamentos

### No arquivo `app/painelBarber/page.tsx`:

```typescript
useEffect(() => {
  async function carregarAgendamentos() {
    try {
      // ✅ CHAMADA À API (substitui getAgendamentosOrdenados do localStorage)
      const response = await fetch('/api/agendamentos')
      
      if (response.ok) {
        const dados = await response.json()
        
        // Aplica filtro se necessário
        if (filtroStatus === 'todos') {
          setAgendamentos(dados)
        } else {
          setAgendamentos(dados.filter((a: Agendamento) => a.status === filtroStatus))
        }
      } else {
        console.error('Erro ao carregar agendamentos')
      }
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error)
    }
  }
  
  carregarAgendamentos()
  
  // Atualiza a cada 5 segundos
  const interval = setInterval(carregarAgendamentos, 5000)
  return () => clearInterval(interval)
}, [filtroStatus])
```

---

## 📋 Exemplo 3: Atualizar Status

### No arquivo `app/painelBarber/page.tsx`:

```typescript
const handleConfirmar = async (id: string) => {
  try {
    // ✅ CHAMADA À API (substitui updateAgendamentoStatus do localStorage)
    const response = await fetch(`/api/agendamentos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'confirmado', // Apenas atualiza o status
      }),
    })

    if (response.ok) {
      carregarAgendamentos() // Recarrega lista
      alert('Agendamento confirmado!')
    } else {
      const error = await response.json()
      alert(error.error || 'Erro ao confirmar agendamento')
    }
  } catch (error) {
    console.error('Erro ao confirmar agendamento:', error)
    alert('Erro ao confirmar agendamento')
  }
}
```

---

## 📋 Exemplo 4: Excluir Agendamento

### No arquivo `app/painelBarber/page.tsx`:

```typescript
const handleExcluir = async (id: string) => {
  if (!confirm('Tem certeza que deseja excluir este agendamento?')) {
    return
  }
  
  try {
    // ✅ CHAMADA À API (substitui deleteAgendamento do localStorage)
    const response = await fetch(`/api/agendamentos/${id}`, {
      method: 'DELETE',
    })

    if (response.ok) {
      carregarAgendamentos() // Recarrega lista
      alert('Agendamento excluído com sucesso!')
    } else {
      const error = await response.json()
      alert(error.error || 'Erro ao excluir agendamento')
    }
  } catch (error) {
    console.error('Erro ao excluir agendamento:', error)
    alert('Erro ao excluir agendamento')
  }
}
```

---

## 🎯 Resumo das Mudanças

### O que mudou:

1. **Criar**: `createAgendamento()` → `fetch('/api/agendamentos', { method: 'POST' })`
2. **Listar**: `getAgendamentosOrdenados()` → `fetch('/api/agendamentos')`
3. **Atualizar**: `updateAgendamentoStatus()` → `fetch('/api/agendamentos/[id]', { method: 'PUT' })`
4. **Excluir**: `deleteAgendamento()` → `fetch('/api/agendamentos/[id]', { method: 'DELETE' })`

### Vantagens da API:

✅ Dados persistem no banco (não se perdem ao limpar cache)  
✅ Múltiplos usuários podem acessar os mesmos dados  
✅ Validação no servidor (mais seguro)  
✅ Escalável (pode adicionar autenticação, permissões, etc)  
✅ Histórico completo no banco  

---

## 🚀 Próximos Passos

1. Substitua todas as chamadas do `lib/agendamentos.ts` por fetch
2. Teste criar, listar, atualizar e excluir
3. Verifique dados no Prisma Studio: `npx prisma studio`
4. Adicione tratamento de erros mais robusto
5. Adicione loading states (spinners)

