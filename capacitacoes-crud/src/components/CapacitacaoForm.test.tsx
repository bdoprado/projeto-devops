import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CapacitacaoForm } from './CapacitacaoForm';
import type { Capacitacao } from '../types/Capacitacao';

const capacitacaoBase: Capacitacao = {
  id: '1',
  titulo: 'DevOps',
  descricao: 'CI/CD',
  data: '2024-05-01',
  cargaHoraria: 16,
  instrutor: 'João',
};

describe('CapacitacaoForm — modo criação', () => {
  it('exibe título "Nova Capacitação"', () => {
    render(<CapacitacaoForm onSave={jest.fn()} />);
    expect(screen.getByText('Nova Capacitação')).toBeInTheDocument();
  });

  it('exibe botão "Adicionar"', () => {
    render(<CapacitacaoForm onSave={jest.fn()} />);
    expect(screen.getByRole('button', { name: 'Adicionar' })).toBeInTheDocument();
  });

  it('chama onSave com os dados preenchidos', () => {
    const onSave = jest.fn();
    render(<CapacitacaoForm onSave={onSave} />);

    fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'React Avançado' } });
    fireEvent.change(screen.getByLabelText('Instrutor'), { target: { value: 'Maria' } });
    fireEvent.change(screen.getByLabelText('Data'), { target: { value: '2024-06-01' } });
    fireEvent.change(screen.getByLabelText('Carga Horária (h)'), { target: { value: '8' } });
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar' }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        titulo: 'React Avançado',
        instrutor: 'Maria',
        data: '2024-06-01',
        cargaHoraria: 8,
      }),
    );
  });

  it('limpa os campos após salvar', async () => {
    render(<CapacitacaoForm onSave={jest.fn()} />);
    const input = screen.getByLabelText('Título') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Teste' } });
    fireEvent.change(screen.getByLabelText('Instrutor'), { target: { value: 'Ana' } });
    fireEvent.change(screen.getByLabelText('Data'), { target: { value: '2024-01-01' } });
    fireEvent.change(screen.getByLabelText('Carga Horária (h)'), { target: { value: '4' } });
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar' }));
    await waitFor(() => expect(input.value).toBe(''));
  });
});

describe('CapacitacaoForm — modo edição', () => {
  it('exibe título "Editar Capacitação"', () => {
    render(<CapacitacaoForm onSave={jest.fn()} emEdicao={capacitacaoBase} />);
    expect(screen.getByText('Editar Capacitação')).toBeInTheDocument();
  });

  it('pré-preenche os campos com os dados da capacitação', () => {
    render(<CapacitacaoForm onSave={jest.fn()} emEdicao={capacitacaoBase} />);
    expect(screen.getByDisplayValue('DevOps')).toBeInTheDocument();
    expect(screen.getByDisplayValue('João')).toBeInTheDocument();
  });

  it('exibe botão "Cancelar" e o chama ao clicar', () => {
    const onCancelar = jest.fn();
    render(<CapacitacaoForm onSave={jest.fn()} emEdicao={capacitacaoBase} onCancelar={onCancelar} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onCancelar).toHaveBeenCalled();
  });
});
