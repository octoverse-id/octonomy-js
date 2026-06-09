.DEFAULT_GOAL := help
.PHONY: help install build test typecheck lint format check version-check release-check

help: ## List available targets
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies
	npm install

build: ## Build dual ESM + CJS + type declarations
	npm run build

test: ## Run the test suite
	npm run test

typecheck: ## Type-check without emitting
	npm run typecheck

lint: ## Lint + format check (Biome)
	npm run lint

format: ## Apply formatting (Biome)
	npm run format

check: ## Fast pre-push gate (lint + typecheck + test)
	npm run check

version-check: ## Verify src/version.ts, package.json, and CHANGELOG.md agree
	@code_ver=$$(grep -E 'export const VERSION' src/version.ts | sed -E 's/.*"([^"]+)".*/\1/'); \
	pkg_ver=$$(node -p "require('./package.json').version"); \
	log_ver=$$(grep -m1 -E '^## \[[0-9]' CHANGELOG.md | sed -E 's/^## \[([^]]+)\].*/\1/'); \
	if [ "$$code_ver" != "$$pkg_ver" ] || [ "$$code_ver" != "$$log_ver" ]; then \
		echo "version mismatch: version.ts=$$code_ver package.json=$$pkg_ver CHANGELOG.md=$$log_ver"; exit 1; \
	fi; \
	echo "version OK: $$code_ver"

release-check: lint typecheck test build version-check ## Full pre-release gate
	@echo "release-check passed"
