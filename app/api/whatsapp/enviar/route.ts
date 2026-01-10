import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  enviarConfirmacao,
  enviarRemarcacao,
  enviarCancelamento,
  formatarNumeroWhatsApp,
  type DadosAgendamento,
} from '@/lib/whatsapp'

// POST /api/whatsapp/enviar
// Por que: Endpoint para enviar mensagens WhatsApp quando agendamento é confirmado/remarcado/cancelado
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { agendamentoId, tipo } = body

    // Validação básica
    if (!agendamentoId || !tipo) {
      return NextResponse.json(
        { error: 'agendamentoId e tipo são obrigatórios' },
        { status: 400 }
      )
    }

    // Busca agendamento no banco
    const agendamento = await prisma.agendamento.findUnique({
      where: { id: agendamentoId },
    })

    if (!agendamento) {
      return NextResponse.json(
        { error: 'Agendamento não encontrado' },
        { status: 404 }
      )
    }

    // Verifica se tem WhatsApp cadastrado
    if (!agendamento.clientWhatsApp) {
      return NextResponse.json(
        { error: 'WhatsApp do cliente não cadastrado' },
        { status: 400 }
      )
    }

    // Prepara dados para envio
    const dados: DadosAgendamento = {
      clientName: agendamento.clientName,
      clientWhatsApp: agendamento.clientWhatsApp,
      date: agendamento.date,
      time: agendamento.time,
      service: agendamento.service,
      price: agendamento.price,
    }

    // Lê configuração da API do WhatsApp do .env
    // Por que: Credenciais devem estar em variáveis de ambiente por segurança
    const apiUrl = process.env.WHATSAPP_API_URL
    const apiKey = process.env.WHATSAPP_API_KEY

    // Envia mensagem baseado no tipo
    let sucesso = false
    switch (tipo) {
      case 'confirmacao':
        sucesso = await enviarConfirmacao(dados, apiUrl, apiKey)
        break
      case 'remarcacao':
        sucesso = await enviarRemarcacao(dados, apiUrl, apiKey)
        break
      case 'cancelamento':
        sucesso = await enviarCancelamento(dados, apiUrl, apiKey)
        break
      default:
        return NextResponse.json(
          { error: 'Tipo de mensagem inválido. Use: confirmacao, remarcacao ou cancelamento' },
          { status: 400 }
        )
    }

    // Atualiza flag de WhatsApp enviado no banco
    // Por que: Evita enviar mensagem duplicada e permite rastreamento
    if (sucesso) {
      await prisma.agendamento.update({
        where: { id: agendamentoId },
        data: { whatsappEnviado: true },
      })
    }

    return NextResponse.json({
      success: sucesso,
      message: sucesso ? 'Mensagem enviada com sucesso' : 'Erro ao enviar mensagem',
    })
  } catch (error) {
    console.error('Erro ao enviar mensagem WhatsApp:', error)
    return NextResponse.json(
      { error: 'Erro ao enviar mensagem WhatsApp' },
      { status: 500 }
    )
  }
}

