#!/usr/bin/env bash
#
# build-push.sh — builda a imagem de produção e publica no GitHub Container
# Registry (ghcr.io). Mesmo artefato gerado pelo pipeline de CD; este script
# permite reproduzir/publicar manualmente.
#
# Pré-requisitos:
#   - Estar logado no GHCR:
#       echo "$GHCR_TOKEN" | docker login ghcr.io -u <usuario> --password-stdin
#     (o token precisa do escopo write:packages)
#
# Uso:
#   ./scripts/build-push.sh [TAG]      # TAG padrão: latest
#
set -euo pipefail

cd "$(dirname "$0")/.."

IMAGE_NAME="${IMAGE_NAME:-ghcr.io/bdoprado/projeto-devops}"
TAG="${1:-latest}"
CONTEXT="capacitacoes-crud"

echo "==> Buildando ${IMAGE_NAME}:${TAG}"
docker build -t "${IMAGE_NAME}:${TAG}" -t "${IMAGE_NAME}:latest" "${CONTEXT}"

echo "==> Publicando no GHCR"
docker push "${IMAGE_NAME}:${TAG}"
docker push "${IMAGE_NAME}:latest"

echo "==> Publicado: ${IMAGE_NAME}:${TAG}"
