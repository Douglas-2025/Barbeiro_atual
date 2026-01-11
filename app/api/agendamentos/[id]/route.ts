import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PUT /api/agendamentos/[id]
// Por que: Atualiza um agendamento existente (ex: mudar status)
// Uso: Frontend chama quando barbeiro confirma/cancela agendamento
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = await request.json()

    // Busca agendamento atual para comparar mudanças
    // Por que: Precisamos saber o status anterior para detectar mudanças
    const agendamentoAntigo = await prisma.agendamento.findUnique({
      where: { id: id },
    })

    if (!agendamentoAntigo) {
      return NextResponse.json(
        { error: 'Agendamento não encontrado' },
        { status: 404 }
      )
    }

    // Detecta se está mudando status ou data/hora
    const statusMudou = body.status && body.status !== agendamentoAntigo.status
    const dataMudou =
      (body.date && body.date !== agendamentoAntigo.date) ||
      (body.time && body.time !== agendamentoAntigo.time)

    // Atualiza agendamento no banco
    // Por que: Permite mudar status, dados do cliente, etc sem criar novo registro
    const agendamento = await prisma.agendamento.update({
      where: { id: id }, // Encontra agendamento pelo ID
      data: body, // Atualiza apenas campos enviados no body
    })

    // Envia WhatsApp automaticamente quando status muda para confirmado
    // Por que: Cliente recebe confirmação imediatamente sem ação manual do barbeiro
    if (
      statusMudou &&
      agendamento.status === 'confirmado' &&
      agendamento.clientWhatsApp
    ) {
      try {
        // Chama API de WhatsApp em background (não bloqueia resposta)
        // Por que: Não queremos que erro no WhatsApp impeça atualização do agendamento
        fetch(
          `${
            process.env.NEXTAUTH_URL || 'http://localhost:3000'
          }/api/whatsapp/enviar`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              agendamentoId: agendamento.id,
              tipo: 'confirmacao',
            }),
          }
        ).catch((err) => console.error('Erro ao enviar WhatsApp:', err))
      } catch (error) {
        console.error('Erro ao disparar envio de WhatsApp:', error)
        // Não falha a requisição se WhatsApp der erro
      }
    }

    // Envia WhatsApp quando agendamento é remarcado (data ou hora muda)
    // Por que: Cliente precisa ser notificado sobre mudança de horário
    if (
      dataMudou &&
      agendamento.status === 'confirmado' &&
      agendamento.clientWhatsApp
    ) {
      try {
        fetch(
          `${
            process.env.NEXTAUTH_URL || 'http://localhost:3000'
          }/api/whatsapp/enviar`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              agendamentoId: agendamento.id,
              tipo: 'remarcacao',
            }),
          }
        ).catch((err) => console.error('Erro ao enviar WhatsApp:', err))
      } catch (error) {
        console.error('Erro ao disparar envio de WhatsApp:', error)
      }
    }

    // Envia WhatsApp quando agendamento é cancelado
    // Por que: Cliente precisa ser notificado sobre cancelamento
    if (
      statusMudou &&
      agendamento.status === 'cancelado' &&
      agendamento.clientWhatsApp
    ) {
      try {
        fetch(
          `${
            process.env.NEXTAUTH_URL || 'http://localhost:3000'
          }/api/whatsapp/enviar`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              agendamentoId: agendamento.id,
              tipo: 'cancelamento',
            }),
          }
        ).catch((err) => console.error('Erro ao enviar WhatsApp:', err))
      } catch (error) {
        console.error('Erro ao disparar envio de WhatsApp:', error)
      }
    }

    return NextResponse.json(agendamento)
  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error)

    // Se agendamento não existe, retorna 404
    if ((error as { code?: string }).code === 'P2025') {
      return NextResponse.json(
        { error: 'Agendamento não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao atualizar agendamento' },
      { status: 500 }
    )
  }
}

// DELETE /api/agendamentos/[id]
// Por que: Remove agendamento do banco de dados
// Uso: Frontend chama quando barbeiro exclui agendamento
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    // Remove agendamento do banco
    // Por que: Permite excluir agendamentos definitivamente
    await prisma.agendamento.delete({
      where: { id: id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar agendamento:', error)

    // Se agendamento não existe, retorna 404
    if ((error as { code?: string }).code === 'P2025') {
      return NextResponse.json(
        { error: 'Agendamento não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao deletar agendamento' },
      { status: 500 }
    )
  }
}
