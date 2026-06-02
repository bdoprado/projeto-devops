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
