// Biblioteca para envio de mensagens WhatsApp
// Por que: Centraliza lógica de envio de mensagens, facilitando manutenção e permitindo trocar provedor facilmente

// Tipos de mensagens que podem ser enviadas
// Por que: Define templates de mensagens para diferentes situações
export type TipoMensagem = 'confirmacao' | 'remarcacao' | 'cancelamento' | 'lembrete'

// Interface para dados do agendamento
// Por que: Type-safe para garantir que todos os dados necessários estão presentes
export interface DadosAgendamento {
  clientName: string
  clientWhatsApp: string
  date: string
  time: string
  service: string
  price: number
}

// Formata número de telefone para WhatsApp
// Por que: WhatsApp precisa de número no formato internacional sem caracteres especiais
// Exemplo: (11) 99999-9999 → 5511999999999
export function formatarNumeroWhatsApp(telefone: string): string {
  // Remove todos os caracteres não numéricos
  const apenasNumeros = telefone.replace(/\D/g, '')
  
  // Se não começar com código do país (55 para Brasil), adiciona
  if (apenasNumeros.length === 10 || apenasNumeros.length === 11) {
    return `55${apenasNumeros}`
  }
  
  return apenasNumeros
}

// Gera mensagem baseada no tipo
// Por que: Templates de mensagens padronizados melhoram comunicação e profissionalismo
export function gerarMensagem(
  tipo: TipoMensagem,
  dados: DadosAgendamento
): string {
  const nomeServico = dados.service === 'corte' ? 'Corte' :
                      dados.service === 'barba' ? 'Barba' :
                      'Corte + Barba'
  
  const dataFormatada = new Date(`${dados.date}T00:00:00`).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  })

  switch (tipo) {
    case 'confirmacao':
      return `✅ *Agendamento Confirmado!*

Olá ${dados.clientName}! 

Seu agendamento foi *confirmado* com sucesso:

📅 *Data:* ${dataFormatada}
🕐 *Horário:* ${dados.time}
✂️ *Serviço:* ${nomeServico}
💰 *Valor:* R$ ${dados.price.toFixed(2)}

Estamos ansiosos para atendê-lo! 

Em caso de dúvidas, entre em contato conosco.`

    case 'remarcacao':
      return `🔄 *Agendamento Remarcado!*

Olá ${dados.clientName}!

Seu agendamento foi *remarcado*:

📅 *Nova Data:* ${dataFormatada}
🕐 *Novo Horário:* ${dados.time}
✂️ *Serviço:* ${nomeServico}
💰 *Valor:* R$ ${dados.price.toFixed(2)}

Aguardamos você no novo horário! 

Em caso de dúvidas, entre em contato conosco.`

    case 'cancelamento':
      return `❌ *Agendamento Cancelado*

Olá ${dados.clientName}!

Infelizmente seu agendamento foi *cancelado*:

📅 *Data:* ${dataFormatada}
🕐 *Horário:* ${dados.time}
✂️ *Serviço:* ${nomeServico}

Sentimos muito pelo inconveniente.

Para reagendar, entre em contato conosco ou acesse nosso sistema.`

    case 'lembrete':
      return `⏰ *Lembrete de Agendamento*

Olá ${dados.clientName}!

Este é um lembrete do seu agendamento:

📅 *Data:* ${dataFormatada}
🕐 *Horário:* ${dados.time}
✂️ *Serviço:* ${nomeServico}
💰 *Valor:* R$ ${dados.price.toFixed(2)}

Nos vemos em breve! 🎉

Em caso de necessidade de remarcar, entre em contato com antecedência.`

    default:
      return `Olá ${dados.clientName}! Seu agendamento está confirmado para ${dataFormatada} às ${dados.time}.`
  }
}

// Envia mensagem via WhatsApp usando Evolution API
// Por que: Evolution API é popular no Brasil e fácil de integrar
export async function enviarMensagemWhatsApp(
  numero: string,
  mensagem: string,
  apiUrl?: string,
  apiKey?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    // Se não tiver API configurada, retorna erro
    // Por que: Em desenvolvimento, pode não ter WhatsApp configurado ainda
    if (!apiUrl || !apiKey) {
      console.warn('WhatsApp API não configurada. Mensagem simulada:', mensagem)
      return {
        success: true,
        messageId: 'simulado-' + Date.now(),
      }
    }

    const numeroFormatado = formatarNumeroWhatsApp(numero)
    
    // Faz requisição para Evolution API
    // Por que: Evolution API é uma solução brasileira popular para WhatsApp Business
    const response = await fetch(`${apiUrl}/message/sendText/${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey,
      },
      body: JSON.stringify({
        number: numeroFormatado, // Número no formato internacional
        text: mensagem, // Mensagem a ser enviada
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }))
      throw new Error(error.error || 'Erro ao enviar mensagem')
    }

    const data = await response.json()
    
    return {
      success: true,
      messageId: data.key?.id || data.messageId,
    }
  } catch (error) {
    console.error('Erro ao enviar mensagem WhatsApp:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}

// Envia mensagem de confirmação de agendamento
// Por que: Função helper que combina geração de mensagem + envio
export async function enviarConfirmacao(
  dados: DadosAgendamento,
  apiUrl?: string,
  apiKey?: string
): Promise<boolean> {
  const mensagem = gerarMensagem('confirmacao', dados)
  const resultado = await enviarMensagemWhatsApp(
    dados.clientWhatsApp,
    mensagem,
    apiUrl,
    apiKey
  )
  return resultado.success
}

// Envia mensagem de remarcação
export async function enviarRemarcacao(
  dados: DadosAgendamento,
  apiUrl?: string,
  apiKey?: string
): Promise<boolean> {
  const mensagem = gerarMensagem('remarcacao', dados)
  const resultado = await enviarMensagemWhatsApp(
    dados.clientWhatsApp,
    mensagem,
    apiUrl,
    apiKey
  )
  return resultado.success
}

// Envia mensagem de cancelamento
export async function enviarCancelamento(
  dados: DadosAgendamento,
  apiUrl?: string,
  apiKey?: string
): Promise<boolean> {
  const mensagem = gerarMensagem('cancelamento', dados)
  const resultado = await enviarMensagemWhatsApp(
    dados.clientWhatsApp,
    mensagem,
    apiUrl,
    apiKey
  )
  return resultado.success
}

