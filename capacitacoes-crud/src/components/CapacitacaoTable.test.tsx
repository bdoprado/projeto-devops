import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CapacitacaoTable } from './CapacitacaoTable';
import type { Capacitacao } from '../types/Capacitacao';

const lista: Capacitacao[] = [
  { id: '1', titulo: 'React', descricao: 'Frontend', data: '2024-01-01', cargaHoraria: 8, instrutor: 'Ana' },
  { id: '2', titulo: 'Docker', descricao: 'Container', data: '2024-02-01', cargaHoraria: 4, instrutor: 'Bob' },
];

describe('CapacitacaoTable — lista vazia', () => {
  it('exibe mensagem quando não há capacitações', () => {
    render(<CapacitacaoTable capacitacoes={[]} onEdit={jest.fn()} onDelete={jest.fn()} />);
    expect(screen.getByText('Nenhuma capacitação cadastrada.')).toBeInTheDocument();
  });
});

describe('CapacitacaoTable — com dados', () => {
  it('renderiza todas as capacitações da lista', () => {
    render(<CapacitacaoTable capacitacoes={lista} onEdit={jest.fn()} onDelete={jest.fn()} />);
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Docker')).toBeInTheDocument();
  });

  it('chama onEdit com a capacitação correta ao clicar em Editar', () => {
    const onEdit = jest.fn();
    render(<CapacitacaoTable capacitacoes={lista} onEdit={onEdit} onDelete={jest.fn()} />);
    fireEvent.click(screen.getAllByRole('button', { name: 'Editar' })[0]);
    expect(onEdit).toHaveBeenCalledWith(lista[0]);
  });

  it('chama onDelete com o id correto ao clicar em Excluir', () => {
    const onDelete = jest.fn();
    render(<CapacitacaoTable capacitacoes={lista} onEdit={jest.fn()} onDelete={onDelete} />);
    fireEvent.click(screen.getAllByRole('button', { name: 'Excluir' })[0]);
    expect(onDelete).toHaveBeenCalledWith('1');
  });

  it('renderiza um botão Editar e Excluir por linha', () => {
    render(<CapacitacaoTable capacitacoes={lista} onEdit={jest.fn()} onDelete={jest.fn()} />);
    expect(screen.getAllByRole('button', { name: 'Editar' })).toHaveLength(2);
    expect(screen.getAllByRole('button', { name: 'Excluir' })).toHaveLength(2);
  });
});
