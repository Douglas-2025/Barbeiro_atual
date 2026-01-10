-- AlterTable
ALTER TABLE "Agendamento" ADD COLUMN     "clientWhatsApp" TEXT,
ADD COLUMN     "whatsappEnviado" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Agendamento_whatsappEnviado_idx" ON "Agendamento"("whatsappEnviado");
