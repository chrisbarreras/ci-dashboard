export const ORG = 'chrisbarreras'
export const GITHUB_API_BASE = 'https://api.github.com'
export const REFRESH_INTERVAL_MS = 5 * 60 * 1000
export const SLOW_REFRESH_INTERVAL_MS = 8 * 60 * 1000
export const CACHE_TTL_MS = 4.5 * 60 * 1000
export const RUNS_PER_PAGE = 10
export const RATE_LIMIT_SLOW_THRESHOLD = 15
export const RATE_LIMIT_STOP_THRESHOLD = 5

export const REPO_DESCRIPTIONS: Record<string, string> = {
  'llm-ci-pipeline': 'LLM evaluation pipeline with automated testing',
  'dockerized-typescript-api': 'TypeScript REST API in a Docker container',
  'terraform-basic-infrastructure': 'Infrastructure as Code with Terraform',
  'studyjarvis': 'AI-powered study assistant',
  'stock-prediction-ml': 'Machine learning stock prediction with CI pipeline',
  'studyjarviswebapp': 'Web application for StudyJarvis',
  'facebreak': 'Social media application',
}
