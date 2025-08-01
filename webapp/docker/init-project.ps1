#!/usr/bin/env pwsh

# Script d'initialisation du projet React-Fastify
# Ce script configure l'environnement de développement Docker

Write-Host "🚀 Initialisation du projet React-Fastify" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green

# Variables
$PROJECT_ROOT = Split-Path -Parent $PSScriptRoot
$BACKEND_DIR = Join-Path $PROJECT_ROOT "backend"
$DOCKER_DIR = $PSScriptRoot

# Fonction pour vérifier et créer les fichiers .env
function Test-EnvFiles {
    Write-Host "📁 Vérification des fichiers d'environnement..." -ForegroundColor Yellow
    
    $envFiles = @(
        @{
            Path = Join-Path $BACKEND_DIR ".env"
            Template = @"
# Configuration de base
NODE_ENV=development
PORT=3000

# Base de données MySQL
DATABASE_URL="mysql://fastify:password@localhost:3306/fastify"

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# MinIO (Stockage)
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=fastify

# Email (MailHog pour le développement)
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=noreply@fastify.local

# Redis
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=redispassword

# Autres
API_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173
"@
        }
        @{
            Path = Join-Path $BACKEND_DIR ".env.docker.dev"
            Template = @"
# Configuration Docker pour le développement
NODE_ENV=development
PORT=3000

# Base de données MySQL (noms de services Docker)
DATABASE_URL="mysql://fastify:password@database:3306/fastify"

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# MinIO (Stockage) - noms de services Docker
MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=fastify

# Email (MailHog pour le développement)
SMTP_HOST=mailhog
SMTP_PORT=1025
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=noreply@fastify.local

# Redis
REDIS_URL=redis://redis:6379
REDIS_PASSWORD=redispassword

# Autres
API_URL=http://backend:3000
FRONTEND_URL=http://frontend:5173

# Loki pour les logs
LOKI_HOST=http://loki:3100
"@
        }
    )

    foreach ($envFile in $envFiles) {
        if (-not (Test-Path $envFile.Path)) {
            Write-Host "⚠️  Création du fichier: $($envFile.Path)" -ForegroundColor Yellow
            $envFile.Template | Out-File -FilePath $envFile.Path -Encoding utf8
            Write-Host "✅ Fichier créé: $($envFile.Path)" -ForegroundColor Green
        } else {
            Write-Host "✅ Fichier existant: $($envFile.Path)" -ForegroundColor Green
        }
    }
}

# Fonction pour gérer Docker
function Start-DockerEnvironment {
    Write-Host "🐳 Gestion de l'environnement Docker..." -ForegroundColor Yellow
    
    # Vérifier si Docker est disponible
    try {
        docker --version | Out-Null
        docker-compose --version | Out-Null
    } catch {
        Write-Host "❌ Docker ou docker-compose n'est pas installé ou disponible" -ForegroundColor Red
        exit 1
    }

    # Naviguer vers le dossier Docker
    Push-Location $DOCKER_DIR
    
    try {
        # Arrêter les conteneurs existants s'ils existent
        Write-Host "🛑 Arrêt des conteneurs existants..." -ForegroundColor Yellow
        docker-compose -f docker-compose.dev.yml down --remove-orphans

        # Construire et démarrer les conteneurs
        Write-Host "🔨 Construction et démarrage des conteneurs..." -ForegroundColor Yellow
        docker-compose -f docker-compose.dev.yml up -d --build

        # Attendre que la base de données soit prête
        Write-Host "⏳ Attente de la base de données..." -ForegroundColor Yellow
        Start-Sleep -Seconds 30

        Write-Host "✅ Conteneurs Docker démarrés" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Erreur lors du démarrage des conteneurs Docker: $_" -ForegroundColor Red
        exit 1
    }
    finally {
        Pop-Location
    }
}

# Fonction pour initialiser Prisma
function Initialize-Prisma {
    Write-Host "🗄️  Initialisation de Prisma..." -ForegroundColor Yellow
    
    # Attendre un peu plus pour s'assurer que le backend est prêt
    Write-Host "⏳ Attente du démarrage complet du backend..." -ForegroundColor Yellow
    Start-Sleep -Seconds 20

    try {
        # Générer le client Prisma
        Write-Host "🔧 Génération du client Prisma..." -ForegroundColor Yellow
        docker exec fastify-backend-dev sh -c "cd /app/backend && pnpm prisma generate"

        # Exécuter les migrations et seed
        Write-Host "📊 Exécution des migrations et seed..." -ForegroundColor Yellow
        docker exec fastify-backend-dev sh -c "cd /app/backend && pnpm prisma migrate dev --name init && pnpm prisma:seed"

        Write-Host "✅ Prisma initialisé avec succès" -ForegroundColor Green
    }
    catch {
        Write-Host "⚠️  Erreur lors de l'initialisation de Prisma: $_" -ForegroundColor Yellow
        Write-Host "💡 Vous pouvez réessayer manuellement avec:" -ForegroundColor Cyan
        Write-Host "   docker exec fastify-backend-dev sh -c `"cd /app/backend && pnpm prisma generate`"" -ForegroundColor Cyan
        Write-Host "   docker exec fastify-backend-dev sh -c `"cd /app/backend && pnpm prisma migrate dev --name init`"" -ForegroundColor Cyan
        Write-Host "   docker exec fastify-backend-dev sh -c `"cd /app/backend && pnpm prisma:seed`"" -ForegroundColor Cyan
    }
}

# Fonction pour afficher les informations finales
function Show-ProjectInfo {
    Write-Host ""
    Write-Host "🎉 Initialisation terminée !" -ForegroundColor Green
    Write-Host "=========================" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Services disponibles:" -ForegroundColor Cyan
    Write-Host "   🌐 Frontend:     http://localhost:5173" -ForegroundColor White
    Write-Host "   ⚡ Backend API:  http://localhost:3000" -ForegroundColor White
    Write-Host "   🗄️  phpMyAdmin:  http://localhost:8080" -ForegroundColor White
    Write-Host "   📧 MailHog:      http://localhost:8025" -ForegroundColor White
    Write-Host "   📊 Grafana:      http://localhost:3001 (admin/admin)" -ForegroundColor White
    Write-Host "   💾 MinIO:        http://localhost:9001 (minioadmin/minioadmin)" -ForegroundColor White
    Write-Host ""
    Write-Host "🔧 Commandes utiles:" -ForegroundColor Cyan
    Write-Host "   Voir les logs:           docker-compose -f docker-compose.dev.yml logs -f" -ForegroundColor White
    Write-Host "   Arrêter:                 docker-compose -f docker-compose.dev.yml down" -ForegroundColor White
    Write-Host "   Redémarrer:              docker-compose -f docker-compose.dev.yml restart" -ForegroundColor White
    Write-Host "   Shell backend:           docker exec -it fastify-backend-dev sh" -ForegroundColor White
    Write-Host "   Shell frontend:          docker exec -it fastify-frontend-dev sh" -ForegroundColor White
    Write-Host ""
    Write-Host "📝 Les fichiers .env ont été créés dans le dossier backend/" -ForegroundColor Yellow
    Write-Host "   Pensez à les personnaliser selon vos besoins !" -ForegroundColor Yellow
}

# Exécution du script principal
try {
    Test-EnvFiles
    Start-DockerEnvironment
    Initialize-Prisma
    Show-ProjectInfo
}
catch {
    Write-Host "❌ Erreur durant l'initialisation: $_" -ForegroundColor Red
    exit 1
} 