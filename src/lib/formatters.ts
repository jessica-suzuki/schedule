export function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function formatarDataBR(dataIso: string): string {
  const [ano, mes, dia] = dataIso.split('-')
  return `${dia}/${mes}/${ano}`
}

export function formatarDuracao(minutos: number): string {
  const h = Math.floor(minutos / 60)
  const m = minutos % 60
  if (h === 0) return `${m}min`
  if (m === 0) return `${h}h`
  return `${h}h${String(m).padStart(2, '0')}`
}

export function maskCPF(value: string): string {
  return value
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

export function maskTelefone(value: string): string {
  return value
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{4})$/, '$1-$2')
}

export const FORMAS_PAGAMENTO: Record<string, string> = {
  pix: 'Pix',
  credito: 'Cartão de Crédito',
  debito: 'Cartão de Débito',
  dinheiro: 'Dinheiro',
}
