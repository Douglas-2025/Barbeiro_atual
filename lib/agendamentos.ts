// Biblioteca para gerenciar agendamentos
// Por que: Centraliza lógica de CRUD de agendamentos, facilitando manutenção e reutilização

// Tipo de agendamento
// Por que: Define estrutura de dados type-safe para agendamentos
export interface Agendamento {
  id: string // ID único do agendamento
  date: string // Data no formato YYYY-MM-DD
  time: string // Horário no formato HH:MM
  dateTime: string // Data e hora combinadas em ISO
  clientName: string // Nome do cliente
  clientPhone: string // Telefone do cliente
  clientWhatsApp?: string // WhatsApp do cliente (opcional)
  service: string // Tipo de serviço (corte, barba, combo)
  duration: number // Duração em minutos
  price: number // Valor do serviço em reais
  status: 'pendente' | 'confirmado' | 'cancelado' | 'concluido' // Status do agendamento
  whatsappEnviado?: boolean // Indica se mensagem WhatsApp foi enviada
  createdAt: string // Data de criação do agendamento
}

// Preços dos serviços
// Por que: Centraliza valores para fácil atualização e consistência
const SERVICE_PRICES: Record<string, number> = {
  corte: 30,
  barba: 20,
  combo: 45,
}

// Durações dos serviços em minutos
// Por que: Define tempo estimado para cada serviço
const SERVICE_DURATIONS: Record<string, number> = {
  corte: 30,
  barba: 20,
  combo: 60,
}

// Chave do localStorage para agendamentos
// Por que: Evita conflitos com outras chaves e facilita manutenção
const STORAGE_KEY = 'barbearia_agendamentos'

// Chave do localStorage para entradas financeiras
const FINANCE_STORAGE_KEY = 'barbearia_financeiro'

// Busca todos os agendamentos do localStorage
// Por que: Permite recuperar agendamentos salvos mesmo após recarregar página
export function getAgendamentos(): Agendamento[] {
  if (typeof window === 'undefined') return []
  
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return []
  
  try {
    return JSON.parse(stored) as Agendamento[]
  } catch {
    return []
  }
}

// Salva um novo agendamento
// Por que: Persiste agendamento no localStorage e calcula preço automaticamente
export function createAgendamento(data: Omit<Agendamento, 'id' | 'price' | 'duration' | 'status' | 'whatsappEnviado' | 'createdAt'>): Agendamento {
  const agendamentos = getAgendamentos()
  
  // Cria novo agendamento com dados calculados
  const novoAgendamento: Agendamento = {
    ...data,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9), // ID único
    price: SERVICE_PRICES[data.service] || 0, // Calcula preço baseado no serviço
    duration: SERVICE_DURATIONS[data.service] || 30, // Calcula duração
    status: 'pendente', // Status inicial sempre pendente
    whatsappEnviado: false, // WhatsApp ainda não foi enviado
    createdAt: new Date().toISOString(), // Data de criação
  }
  
  // Adiciona à lista e salva
  agendamentos.push(novoAgendamento)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(agendamentos))
  
  // Registra entrada financeira
  // Por que: Mantém histórico financeiro separado para relatórios
  registrarEntradaFinanceira(novoAgendamento)
  
  return novoAgendamento
}

// Atualiza status de um agendamento
// Por que: Permite mudar status (confirmar, cancelar, concluir) sem deletar
export function updateAgendamentoStatus(id: string, status: Agendamento['status']): boolean {
  const agendamentos = getAgendamentos()
  const index = agendamentos.findIndex(a => a.id === id)
  
  if (index === -1) return false
  
  agendamentos[index].status = status
  localStorage.setItem(STORAGE_KEY, JSON.stringify(agendamentos))
  
  // Se cancelado, remove entrada financeira
  // Por que: Cancelamentos não geram receita
  if (status === 'cancelado') {
    removerEntradaFinanceira(id)
  }
  
  return true
}

// Remove um agendamento completamente
// Por que: Permite excluir agendamentos definitivamente
export function deleteAgendamento(id: string): boolean {
  const agendamentos = getAgendamentos()
  const filtered = agendamentos.filter(a => a.id !== id)
  
  if (filtered.length === agendamentos.length) return false
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  
  // Remove entrada financeira também
  removerEntradaFinanceira(id)
  
  return true
}

// Ordena agendamentos por data e horário
// Por que: Facilita visualização cronológica para o barbeiro
export function getAgendamentosOrdenados(): Agendamento[] {
  const agendamentos = getAgendamentos()
  
  return agendamentos.sort((a, b) => {
    // Primeiro ordena por data
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date)
    }
    // Se mesma data, ordena por horário
    return a.time.localeCompare(b.time)
  })
}

// Filtra agendamentos por status
// Por que: Permite visualizar apenas agendamentos ativos, cancelados, etc
export function getAgendamentosPorStatus(status: Agendamento['status']): Agendamento[] {
  return getAgendamentosOrdenados().filter(a => a.status === status)
}

// ========== FUNÇÕES FINANCEIRAS ==========

// Tipo de entrada financeira
export interface EntradaFinanceira {
  id: string // ID do agendamento relacionado
  date: string // Data do agendamento
  clientName: string // Nome do cliente
  service: string // Tipo de serviço
  price: number // Valor recebido
  status: 'pendente' | 'recebido' | 'cancelado' // Status do pagamento
  createdAt: string // Data de criação
}

// Registra entrada financeira quando agendamento é criado
// Por que: Mantém histórico financeiro separado para relatórios e dashboard
function registrarEntradaFinanceira(agendamento: Agendamento): void {
  const entradas = getEntradasFinanceiras()
  
  const entrada: EntradaFinanceira = {
    id: agendamento.id,
    date: agendamento.date,
    clientName: agendamento.clientName,
    service: agendamento.service,
    price: agendamento.price,
    status: 'pendente', // Inicialmente pendente até ser confirmado/concluído
    createdAt: agendamento.createdAt,
  }
  
  entradas.push(entrada)
  localStorage.setItem(FINANCE_STORAGE_KEY, JSON.stringify(entradas))
}

// Remove entrada financeira (quando agendamento é cancelado/excluído)
function removerEntradaFinanceira(agendamentoId: string): void {
  const entradas = getEntradasFinanceiras()
  const filtered = entradas.filter(e => e.id !== agendamentoId)
  localStorage.setItem(FINANCE_STORAGE_KEY, JSON.stringify(filtered))
}

// Busca todas as entradas financeiras
export function getEntradasFinanceiras(): EntradaFinanceira[] {
  if (typeof window === 'undefined') return []
  
  const stored = localStorage.getItem(FINANCE_STORAGE_KEY)
  if (!stored) return []
  
  try {
    return JSON.parse(stored) as EntradaFinanceira[]
  } catch {
    return []
  }
}

// Calcula total de receitas (agendamentos confirmados/concluídos)
// Por que: Usado no dashboard para mostrar receita total
export function calcularTotalReceitas(): number {
  const agendamentos = getAgendamentos()
  return agendamentos
    .filter(a => a.status === 'confirmado' || a.status === 'concluido')
    .reduce((total, a) => total + a.price, 0)
}

// Calcula receitas do mês atual
// Por que: Dashboard mostra receita mensal para controle financeiro
export function calcularReceitasMesAtual(): number {
  const agendamentos = getAgendamentos()
  const hoje = new Date()
  const mesAtual = hoje.getMonth()
  const anoAtual = hoje.getFullYear()
  
  return agendamentos
    .filter(a => {
      const dataAgendamento = new Date(a.date)
      return (
        (a.status === 'confirmado' || a.status === 'concluido') &&
        dataAgendamento.getMonth() === mesAtual &&
        dataAgendamento.getFullYear() === anoAtual
      )
    })
    .reduce((total, a) => total + a.price, 0)
}

// Conta agendamentos pendentes
// Por que: Dashboard mostra quantos agendamentos precisam de atenção
export function contarAgendamentosPendentes(): number {
  return getAgendamentosPorStatus('pendente').length
}

