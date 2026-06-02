import type { Capacitacao } from '../types/Capacitacao';

interface Props {
  capacitacoes: Capacitacao[];
  onEdit: (capacitacao: Capacitacao) => void;
  onDelete: (id: string) => void;
}

export function CapacitacaoTable({ capacitacoes, onEdit, onDelete }: Props) {
  if (capacitacoes.length === 0) {
    return <p className="empty-message">Nenhuma capacitação cadastrada.</p>;
  }

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Título</th>
            <th>Instrutor</th>
            <th>Data</th>
            <th>Carga Horária</th>
            <th>Descrição</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {capacitacoes.map((c) => (
            <tr key={c.id}>
              <td>{c.titulo}</td>
              <td>{c.instrutor}</td>
              <td>{c.data}</td>
              <td>{c.cargaHoraria}h</td>
              <td>{c.descricao}</td>
              <td>
                <div className="table-actions">
                  <button className="btn-edit" onClick={() => onEdit(c)}>Editar</button>
                  <button className="btn-delete" onClick={() => onDelete(c.id)}>Excluir</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
