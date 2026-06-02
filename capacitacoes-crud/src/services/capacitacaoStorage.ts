import type { Capacitacao } from '../types/Capacitacao';

const STORAGE_KEY = 'capacitacoes';

export function getAll(): Capacitacao[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? (JSON.parse(data) as Capacitacao[]) : [];
}

export function save(dados: Omit<Capacitacao, 'id'>): Capacitacao {
  const nova: Capacitacao = { ...dados, id: crypto.randomUUID() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...getAll(), nova]));
  return nova;
}

export function update(capacitacao: Capacitacao): void {
  const lista = getAll().map((c) => (c.id === capacitacao.id ? capacitacao : c));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
}

export function remove(id: string): void {
  const lista = getAll().filter((c) => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
}
