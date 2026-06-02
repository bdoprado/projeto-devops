# Capacitações CRUD

Aplicação frontend de gerenciamento de capacitações, desenvolvida com React, TypeScript e Vite. Os dados são persistidos localmente via `localStorage`, sem necessidade de backend.

## Funcionalidades

- Cadastrar nova capacitação (título, instrutor, data, carga horária e descrição)
- Listar todas as capacitações em tabela
- Editar um registro existente
- Excluir um registro
- Persistência automática no `localStorage` do navegador

## Tecnologias

| Tecnologia | Uso |
|---|---|
| React 19 | Interface e gerenciamento de estado |
| TypeScript | Tipagem estática |
| Vite | Bundler e servidor de desenvolvimento |
| Jest + ts-jest | Execução dos testes |
| Testing Library | Testes de componentes React |

## Estrutura do projeto

```
src/
├── components/
│   ├── CapacitacaoForm.tsx       # Formulário de criação e edição
│   ├── CapacitacaoForm.test.tsx
│   ├── CapacitacaoTable.tsx      # Tabela de listagem
│   └── CapacitacaoTable.test.tsx
├── services/
│   ├── capacitacaoStorage.ts     # CRUD sobre localStorage
│   └── capacitacaoStorage.test.ts
├── types/
│   └── Capacitacao.ts            # Interface do modelo
├── App.tsx
├── App.css
└── main.tsx
```

## Pré-requisitos

- Node.js 18+
- npm 9+

## Instalação

```bash
npm install
```

## Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera o build de produção |
| `npm test` | Executa os testes com Jest |
| `npm run lint` | Verifica o código com ESLint |
| `npm run preview` | Visualiza o build de produção localmente |

## Executando os testes

```bash
npm test
```

A suíte cobre o serviço de storage (operações de CRUD no `localStorage`) e os dois componentes principais (renderização, submissão de formulário e interações de edição/exclusão). Todos os testes rodam em ambiente jsdom, sem necessidade de navegador.
