import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/agendamentos
// Por que: Retorna todos os agendamentos do banco de dados
// Uso: Frontend chama esta API para listar agendamentos
export async function GET(request: NextRequest) {
  try {
    // Busca todos os agendamentos ordenados por data
    // Por que: Barbeiro precisa ver agendamentos em ordem cronológica
    const agendamentos = await prisma.agendamento.findMany({
      orderBy: [
        { date: 'asc' }, // Primeiro ordena por data
        { time: 'asc' }, // Depois por horário
      ],
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

// POST /api/agendamentos
// Por que: Cria novo agendamento no banco de dados
// Uso: Frontend chama esta API quando cliente faz agendamento
export async function POST(request: NextRequest) {
  try {
    // Lê dados do body da requisição
    // Por que: Frontend envia dados do formulário aqui
    const body = await request.json()
    
    // Validação básica - garante que campos obrigatórios estão presentes
    // Por que: Previne erros no banco e dados incompletos
    if (!body.clientName || !body.date || !body.time || !body.service) {
      return NextResponse.json(
        { error: 'Campos obrigatórios faltando: clientName, date, time, service' },
        { status: 400 }
      )
    }

    // Cria agendamento no banco usando Prisma
    // Por que: Prisma traduz isso para SQL INSERT automaticamente
    const agendamento = await prisma.agendamento.create({
      data: {
        date: body.date,
        time: body.time,
        dateTime: new Date(`${body.date}T${body.time}:00`), // Combina data e hora
        clientName: body.clientName,
        clientPhone: body.clientPhone || '',
        clientWhatsApp: body.clientWhatsApp || body.clientPhone || null, // Usa WhatsApp se informado, senão usa telefone
        service: body.service,
        duration: body.duration || 30,
        price: body.price || 0,
        status: body.status || 'pendente',
        whatsappEnviado: false, // WhatsApp ainda não foi enviado
      },
    })

    // Retorna agendamento criado com status 201 (Created)
    // Por que: Frontend precisa saber que foi criado com sucesso e receber o ID
    return NextResponse.json(agendamento, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar agendamento:', error)
    return NextResponse.json(
      { error: 'Erro ao criar agendamento' },
      { status: 500 }
    )
  }
}

