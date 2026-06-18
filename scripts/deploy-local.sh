#!/usr/bin/env bash
#
# deploy-local.sh — builda a imagem do container e sobe a aplicação localmente
# usando Docker Compose. Útil para validar o artefato de deploy (a imagem)
# exatamente como ele será executado em produção.
#
# Uso:
#   ./scripts/deploy-local.sh            # build + up
#   ./scripts/deploy-local.sh --no-build # sobe a imagem já existente
#
set -euo pipefail

cd "$(dirname "$0")/.."

PORT="${PORT:-8080}"

echo "==> Encerrando instância anterior (se houver)..."
docker compose down --remove-orphans || true

if [[ "${1:-}" == "--no-build" ]]; then
  echo "==> Subindo container (sem rebuild)..."
  docker compose up -d
else
  echo "==> Buildando imagem e subindo container..."
  docker compose up -d --build
fi

echo "==> Aguardando o container ficar saudável..."
for _ in $(seq 1 10); do
  status="$(docker inspect --format '{{.State.Health.Status}}' capacitacoes-crud 2>/dev/null || echo "starting")"
  if [[ "$status" == "healthy" ]]; then
    break
  fi
  sleep 3
done

docker compose ps
echo ""
echo "==> Aplicação disponível em: http://localhost:${PORT}"
