import { useState } from 'react';
import type { Capacitacao } from '../types/Capacitacao';

interface Props {
  onSave: (dados: Omit<Capacitacao, 'id'>) => void;
  emEdicao?: Capacitacao | null;
  onCancelar?: () => void;
}

const camposVazios = {
  titulo: '',
  descricao: '',
  data: '',
  cargaHoraria: 0,
  instrutor: '',
};

export function CapacitacaoForm({ onSave, emEdicao, onCancelar }: Props) {
  const [campos, setCampos] = useState(
    emEdicao
      ? {
          titulo: emEdicao.titulo,
          descricao: emEdicao.descricao,
          data: emEdicao.data,
          cargaHoraria: emEdicao.cargaHoraria,
          instrutor: emEdicao.instrutor,
        }
      : camposVazios,
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(campos);
    setCampos(camposVazios);
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>{emEdicao ? 'Editar Capacitação' : 'Nova Capacitação'}</h2>
      <div className="form-grid">
        <div className="form-field">
          <label htmlFor="titulo">Título</label>
          <input
            id="titulo"
            value={campos.titulo}
            onChange={(e) => setCampos({ ...campos, titulo: e.target.value })}
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor="instrutor">Instrutor</label>
          <input
            id="instrutor"
            value={campos.instrutor}
            onChange={(e) => setCampos({ ...campos, instrutor: e.target.value })}
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor="data">Data</label>
          <input
            id="data"
            type="date"
            value={campos.data}
            onChange={(e) => setCampos({ ...campos, data: e.target.value })}
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor="cargaHoraria">Carga Horária (h)</label>
          <input
            id="cargaHoraria"
            type="number"
            min={1}
            value={campos.cargaHoraria}
            onChange={(e) => setCampos({ ...campos, cargaHoraria: Number(e.target.value) })}
            required
          />
        </div>
        <div className="form-field full-width">
          <label htmlFor="descricao">Descrição</label>
          <textarea
            id="descricao"
            value={campos.descricao}
            onChange={(e) => setCampos({ ...campos, descricao: e.target.value })}
          />
        </div>
      </div>
      <div className="form-actions">
        <button type="submit" className="btn-primary">
          {emEdicao ? 'Salvar' : 'Adicionar'}
        </button>
        {emEdicao && onCancelar && (
          <button type="button" className="btn-secondary" onClick={onCancelar}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
