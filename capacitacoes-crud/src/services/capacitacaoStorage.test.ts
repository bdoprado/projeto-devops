import { getAll, save, update, remove } from './capacitacaoStorage';

beforeEach(() => {
  localStorage.clear();
});

describe('getAll', () => {
  it('retorna array vazio quando não há dados', () => {
    expect(getAll()).toEqual([]);
  });

  it('retorna a lista salva no localStorage', () => {
    const item = {
      id: '1',
      titulo: 'React',
      descricao: 'Frontend',
      data: '2024-01-01',
      cargaHoraria: 8,
      instrutor: 'Ana',
    };
    localStorage.setItem('capacitacoes', JSON.stringify([item]));
    expect(getAll()).toEqual([item]);
  });
});

describe('save', () => {
  it('adiciona uma capacitação com id gerado', () => {
    const nova = save({ titulo: 'Teste', descricao: 'Desc', data: '2024-01-01', cargaHoraria: 4, instrutor: 'José' });
    expect(nova.id).toBeDefined();
    expect(getAll()).toHaveLength(1);
    expect(getAll()[0].titulo).toBe('Teste');
  });

  it('acumula múltiplas capacitações', () => {
    save({ titulo: 'A', descricao: '', data: '2024-01-01', cargaHoraria: 1, instrutor: 'I' });
    save({ titulo: 'B', descricao: '', data: '2024-01-02', cargaHoraria: 2, instrutor: 'J' });
    expect(getAll()).toHaveLength(2);
  });
});

describe('update', () => {
  it('atualiza os dados de uma capacitação existente', () => {
    const salva = save({ titulo: 'Original', descricao: '', data: '2024-01-01', cargaHoraria: 4, instrutor: 'I' });
    update({ ...salva, titulo: 'Atualizado' });
    expect(getAll()[0].titulo).toBe('Atualizado');
  });

  it('não altera as demais capacitações', () => {
    save({ titulo: 'A', descricao: '', data: '2024-01-01', cargaHoraria: 1, instrutor: 'I' });
    const b = save({ titulo: 'B', descricao: '', data: '2024-01-02', cargaHoraria: 2, instrutor: 'J' });
    update({ ...b, titulo: 'B atualizado' });
    expect(getAll()[0].titulo).toBe('A');
    expect(getAll()[1].titulo).toBe('B atualizado');
  });
});

describe('remove', () => {
  it('remove uma capacitação pelo id', () => {
    const salva = save({ titulo: 'A', descricao: '', data: '2024-01-01', cargaHoraria: 4, instrutor: 'I' });
    remove(salva.id);
    expect(getAll()).toHaveLength(0);
  });

  it('mantém as demais capacitações ao remover uma', () => {
    const a = save({ titulo: 'A', descricao: '', data: '2024-01-01', cargaHoraria: 4, instrutor: 'I' });
    save({ titulo: 'B', descricao: '', data: '2024-01-02', cargaHoraria: 2, instrutor: 'J' });
    remove(a.id);
    expect(getAll()).toHaveLength(1);
    expect(getAll()[0].titulo).toBe('B');
  });
});
