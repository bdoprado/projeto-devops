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
