import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Função utilitária para mesclar classes Tailwind
// Por que: Permite combinar classes condicionalmente sem conflitos
// Usa clsx para lógica condicional e tailwind-merge para resolver conflitos de classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

