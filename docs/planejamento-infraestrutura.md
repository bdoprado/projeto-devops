# Planejamento de Infraestrutura — Capacitações CRUD

## Sumário

1. [Descrição do projeto](#1-descrição-do-projeto)
2. [Integração e entrega contínua](#2-integração-e-entrega-contínua)
3. [Especificação da infraestrutura](#3-especificação-da-infraestrutura)

---

## 1. Descrição do projeto

### Visão geral

O **Capacitações CRUD** é uma aplicação web frontend desenvolvida em React + TypeScript, empacotada com Vite. Permite registrar, visualizar, editar e excluir capacitações (treinamentos internos), com persistência local via `localStorage`. Por ser uma SPA (Single Page Application) puramente estática, não requer servidor de aplicação — todo o runtime é executado no navegador do usuário.

### Objetivos

| # | Objetivo |
|---|---|
| 1 | Disponibilizar a aplicação de forma pública, segura e com alta disponibilidade |
| 2 | Automatizar o ciclo de testes, build e deploy via pipeline de CI/CD |
| 3 | Provisionar e gerenciar toda a infraestrutura como código (IaC) com Terraform |
| 4 | Minimizar custos utilizando os recursos do AWS Free Tier |

### Requisitos

#### Funcionais
- Interface de CRUD completo para o cadastro de capacitações
- Campos: título, instrutor, data, carga horária e descrição
- Persistência de dados no `localStorage` do navegador

#### Não funcionais

| Requisito | Critério |
|---|---|
| Disponibilidade | ≥ 99,9% (SLA padrão do CloudFront) |
| Performance | Entrega via CDN com cache nas bordas (edge locations) |
| Segurança | HTTPS obrigatório; bucket S3 privado, acessível apenas pelo CloudFront via OAC |
| Manutenibilidade | Infraestrutura inteiramente reproduzível via Terraform |
| Rastreabilidade | Todo deploy vinculado a um commit na branch `main` |

---

## 2. Integração e entrega contínua

### Visão geral do pipeline

O pipeline é definido em dois workflows GitHub Actions separados: **CI** (executado em todo push e pull request para `main`) e **CD** (executado automaticamente quando o workflow CI conclui com sucesso na branch `main`).

```
Push / PR para main
    │
    ▼
┌─────────────────────────────────┐
│  Workflow: CI                   │
│  ├── Checkout                   │
│  ├── Setup Node 20              │
│  ├── npm ci                     │
│  ├── npm run lint               │
│  └── npm test                   │
└─────────────────────────────────┘
    │ (workflow_run: completed + success)
    │ (apenas branch main)
    ▼
┌─────────────────────────────────┐
│  Workflow: CD                   │
│  ├── Checkout                   │
│  ├── Setup Node 20              │
│  ├── npm ci                     │
│  ├── npm run build              │
│  ├── Configure AWS credentials  │
│  ├── aws s3 sync dist/ → S3     │
│  └── CloudFront invalidation    │
└─────────────────────────────────┘
```

### Arquivos de workflow

**`.github/workflows/ci.yml`**

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  ci:
    name: Lint e Testes
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: capacitacoes-crud

    steps:
      - name: Checkout do repositório
        uses: actions/checkout@v4

      - name: Configurar Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: capacitacoes-crud/package-lock.json

      - name: Instalar dependências
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Testes
        run: npm test
```

**`.github/workflows/cd.yml`**

```yaml
name: CD

on:
  workflow_run:
    workflows: [CI]
    branches: [main]
    types: [completed]

jobs:
  deploy:
    name: Build e Deploy
    runs-on: ubuntu-latest
    if: github.event.workflow_run.conclusion == 'success'
    defaults:
      run:
        working-directory: capacitacoes-crud

    steps:
      - name: Checkout do repositório
        uses: actions/checkout@v4

      - name: Configurar Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: capacitacoes-crud/package-lock.json

      - name: Instalar dependências
        run: npm ci

      - name: Build
        run: npm run build

      - name: Configurar credenciais AWS
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Publicar no S3
        run: |
          aws s3 sync dist/ s3://${{ secrets.S3_BUCKET_NAME }} \
            --delete \
            --exclude "index.html"
          aws s3 cp dist/index.html s3://${{ secrets.S3_BUCKET_NAME }}/index.html \
            --cache-control "no-cache, no-store, must-revalidate"

      - name: Invalidar cache do CloudFront
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} \
            --paths "/*"
```

### Secrets necessários no repositório

| Secret | Descrição |
|---|---|
| `AWS_ACCESS_KEY_ID` | Chave de acesso do usuário IAM de deploy |
| `AWS_SECRET_ACCESS_KEY` | Chave secreta do usuário IAM de deploy |
| `S3_BUCKET_NAME` | Nome do bucket S3 |
| `CLOUDFRONT_DISTRIBUTION_ID` | ID da distribuição CloudFront |

### Regras de proteção de branch (recomendadas)

- `main` requer pull request antes do merge
- Merge bloqueado enquanto o job `ci` não estiver verde
- Histórico linear obrigatório (no merge commits)

---

## 3. Especificação da infraestrutura

### Diagrama de arquitetura

```
                        ┌──────────────┐
  Usuário ──── HTTPS ──▶│  CloudFront  │──▶ Edge Locations (CDN)
                        │ Distribution │
                        └──────┬───────┘
                               │ OAC (Origin Access Control)
                               ▼
                        ┌──────────────┐
                        │   S3 Bucket  │  (privado, sem acesso público)
                        │   dist/      │
                        └──────────────┘

  GitHub Actions ──── aws s3 sync ──▶ S3 Bucket
                 └─── CloudFront invalidation
```

### AWS S3

| Configuração | Valor |
|---|---|
| Nome do bucket | `capacitacoes-crud-<account-id>` (único globalmente) |
| Região | `us-east-1` |
| Acesso público | **Bloqueado** (Block Public Access habilitado) |
| Criptografia | AES-256 (padrão AWS, habilitada automaticamente) |
| Versionamento | Desabilitado (sem necessidade para arquivos estáticos com hash) |
| Website hosting | Desabilitado (o roteamento é feito pelo CloudFront) |
| Política de acesso | Permite `s3:GetObject` apenas para o OAC do CloudFront |

### AWS CloudFront

| Configuração | Valor |
|---|---|
| Origin | S3 bucket via OAC |
| Viewer Protocol Policy | `redirect-to-https` |
| Allowed HTTP Methods | `GET, HEAD` |
| Cache Policy | `CachingOptimized` (padrão AWS) |
| Compressão | Habilitada (`compress = true`) |
| Price Class | `PriceClass_100` (América do Norte e Europa) |
| Default Root Object | `index.html` |
| Custom Error Response | 403 e 404 → `/index.html` com status 200 (SPA routing) |
| Certificado | CloudFront default (ou ACM para domínio customizado) |

### Terraform

#### Estrutura de arquivos

```
terraform/
├── main.tf          # Provider, versões e recursos principais
├── variables.tf     # Variáveis de entrada
└── outputs.tf       # Valores de saída (bucket, distribuição, credenciais)
```

> **Nota:** o estado do Terraform é armazenado localmente em `terraform.tfstate`. Para ambientes colaborativos ou de produção, recomenda-se migrar para um backend remoto (ex: S3 + DynamoDB).

#### Recursos provisionados

```hcl
# main.tf

terraform {
  required_version = ">= 1.6"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# ── S3 Bucket ────────────────────────────────────────────────────────────────

resource "aws_s3_bucket" "app" {
  bucket = var.bucket_name
}

resource "aws_s3_bucket_public_access_block" "app" {
  bucket                  = aws_s3_bucket.app.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# ── CloudFront OAC ───────────────────────────────────────────────────────────

resource "aws_cloudfront_origin_access_control" "app" {
  name                              = "${var.bucket_name}-oac"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# ── CloudFront Distribution ──────────────────────────────────────────────────

resource "aws_cloudfront_distribution" "app" {
  enabled             = true
  default_root_object = "index.html"
  price_class         = "PriceClass_100"

  origin {
    domain_name              = aws_s3_bucket.app.bucket_regional_domain_name
    origin_id                = "s3-${var.bucket_name}"
    origin_access_control_id = aws_cloudfront_origin_access_control.app.id
  }

  default_cache_behavior {
    target_origin_id       = "s3-${var.bucket_name}"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6" # CachingOptimized
  }

  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
  }

  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}

# ── Política do bucket (permite apenas o CloudFront via OAC) ─────────────────

resource "aws_s3_bucket_policy" "app" {
  bucket     = aws_s3_bucket.app.id
  depends_on = [aws_s3_bucket_public_access_block.app]

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontOAC"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.app.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.app.arn
          }
        }
      }
    ]
  })
}

# ── Usuário IAM para deploy (GitHub Actions) ─────────────────────────────────

resource "aws_iam_user" "deploy" {
  name = "${var.project_name}-deploy"
}

resource "aws_iam_access_key" "deploy" {
  user = aws_iam_user.deploy.name
}

resource "aws_iam_user_policy" "deploy" {
  user = aws_iam_user.deploy.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "S3Sync"
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.app.arn,
          "${aws_s3_bucket.app.arn}/*"
        ]
      },
      {
        Sid    = "CloudFrontInvalidation"
        Effect = "Allow"
        Action = "cloudfront:CreateInvalidation"
        Resource = aws_cloudfront_distribution.app.arn
      }
    ]
  })
}
```

#### Variáveis

```hcl
# variables.tf

variable "aws_region" {
  description = "Região AWS onde os recursos serão criados"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Nome do projeto, usado como prefixo nos recursos"
  type        = string
  default     = "capacitacoes-crud"
}

variable "bucket_name" {
  description = "Nome do bucket S3 — deve ser único globalmente na AWS"
  type        = string
}
```

#### Outputs

```hcl
# outputs.tf

output "cloudfront_url" {
  description = "URL pública da aplicação"
  value       = "https://${aws_cloudfront_distribution.app.domain_name}"
}

output "s3_bucket_name" {
  description = "Nome do bucket S3"
  value       = aws_s3_bucket.app.bucket
}

output "cloudfront_distribution_id" {
  description = "ID da distribuição CloudFront — necessário para invalidação no CI/CD"
  value       = aws_cloudfront_distribution.app.id
}

output "deploy_access_key_id" {
  description = "AWS_ACCESS_KEY_ID para configurar nos Secrets do GitHub Actions"
  value       = aws_iam_access_key.deploy.id
}

output "deploy_secret_access_key" {
  description = "AWS_SECRET_ACCESS_KEY para configurar nos Secrets do GitHub Actions"
  value       = aws_iam_access_key.deploy.secret
  sensitive   = true
}
```

### Comandos para provisionar

```bash
cd terraform

# Inicializar e baixar providers
terraform init

# Visualizar o plano de execução
terraform plan -var="bucket_name=capacitacoes-crud-<account-id>"

# Aplicar a infraestrutura
terraform apply -var="bucket_name=capacitacoes-crud-<account-id>"

# Obter as credenciais do usuário de deploy
terraform output deploy_access_key_id
terraform output -raw deploy_secret_access_key
```

Após o `apply`, copie os valores de `s3_bucket_name`, `cloudfront_distribution_id`, `deploy_access_key_id` e `deploy_secret_access_key` e cadastre-os como Secrets no repositório do GitHub.
