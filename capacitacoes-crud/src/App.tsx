import { useState, useEffect } from 'react';
import { CapacitacaoForm } from './components/CapacitacaoForm';
import { CapacitacaoTable } from './components/CapacitacaoTable';
import { getAll, save, update, remove } from './services/capacitacaoStorage';
import type { Capacitacao } from './types/Capacitacao';
import './App.css';

function App() {
  const [capacitacoes, setCapacitacoes] = useState<Capacitacao[]>([]);
  const [emEdicao, setEmEdicao] = useState<Capacitacao | null>(null);

  useEffect(() => {
    setCapacitacoes(getAll());
  }, []);

  function handleSave(dados: Omit<Capacitacao, 'id'>) {
    if (emEdicao) {
      update({ ...dados, id: emEdicao.id });
    } else {
      save(dados);
    }
    setCapacitacoes(getAll());
    setEmEdicao(null);
  }

  function handleDelete(id: string) {
    remove(id);
    setCapacitacoes(getAll());
  }

  return (
    <main>
      <h1>Capacitações</h1>
      <CapacitacaoForm
        onSave={handleSave}
        emEdicao={emEdicao}
        onCancelar={() => setEmEdicao(null)}
      />
      <CapacitacaoTable
        capacitacoes={capacitacoes}
        onEdit={setEmEdicao}
        onDelete={handleDelete}
      />
    </main>
  );
}

export default App;
