#!/bin/bash

# Script d'initialisation du projet React-Fastify
# Ce script configure l'environnement de développement Docker

set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Initialisation du projet React-Fastify${NC}"
echo -e "${GREEN}=======================================${NC}"

# Variables
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKEND_DIR="$PROJECT_ROOT/backend"
DOCKER_DIR="$PROJECT_ROOT/docker"

# Fonction pour vérifier et créer les fichiers .env
check_env_files() {
    echo -e "${YELLOW}📁 Vérification des fichiers d'environnement...${NC}"
    
    # Fichier .env pour développement local
    if [ ! -f "$BACKEND_DIR/.env" ]; then
        echo -e "${YELLOW}⚠️  Création du fichier: $BACKEND_DIR/.env${NC}"
        cat > "$BACKEND_DIR/.env" << 'EOF'
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
EOF
        echo -e "${GREEN}✅ Fichier créé: $BACKEND_DIR/.env${NC}"
    else
        echo -e "${GREEN}✅ Fichier existant: $BACKEND_DIR/.env${NC}"
    fi

    # Fichier .env.docker.dev pour Docker
    if [ ! -f "$BACKEND_DIR/.env.docker.dev" ]; then
        echo -e "${YELLOW}⚠️  Création du fichier: $BACKEND_DIR/.env.docker.dev${NC}"
        cat > "$BACKEND_DIR/.env.docker.dev" << 'EOF'
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
EOF
        echo -e "${GREEN}✅ Fichier créé: $BACKEND_DIR/.env.docker.dev${NC}"
    else
        echo -e "${GREEN}✅ Fichier existant: $BACKEND_DIR/.env.docker.dev${NC}"
    fi
}

# Fonction pour gérer Docker
start_docker_environment() {
    echo -e "${YELLOW}🐳 Gestion de l'environnement Docker...${NC}"
    
    # Vérifier si Docker est disponible
    if ! command -v docker &> /dev/null || ! command -v docker compose &> /dev/null; then
        echo -e "${RED}❌ Docker ou docker compose n'est pas installé ou disponible${NC}"
        exit 1
    fi

    # Naviguer vers le dossier Docker
    cd "$DOCKER_DIR"
    
    # Arrêter les conteneurs existants s'ils existent
    echo -e "${YELLOW}🛑 Arrêt des conteneurs existants...${NC}"
    docker compose -f docker-compose.dev.yml down --remove-orphans || true

    # Construire et démarrer les conteneurs
    echo -e "${YELLOW}🔨 Construction et démarrage des conteneurs...${NC}"
    docker compose -f docker-compose.dev.yml up -d --build

    # Attendre que la base de données soit prête
    echo -e "${YELLOW}⏳ Attente de la base de données...${NC}"
    sleep 10

    echo -e "${GREEN}✅ Conteneurs Docker démarrés${NC}"
}

# Fonction pour initialiser Prisma
initialize_prisma() {
    echo -e "${YELLOW}🗄️  Initialisation de Prisma...${NC}"
    
    # Attendre un peu plus pour s'assurer que le backend est prêt
    echo -e "${YELLOW}⏳ Attente du démarrage complet du backend...${NC}"
    sleep 10

    # Générer le client Prisma
    echo -e "${YELLOW}🔧 Génération du client Prisma...${NC}"
    if docker exec fastify-backend-dev sh -c "cd /app/backend && pnpm prisma generate"; then
        # Exécuter les migrations et seed
        echo -e "${YELLOW}📊 Exécution des migrations et seed...${NC}"
        if docker exec fastify-backend-dev sh -c "cd /app/backend && pnpm prisma migrate dev --name init && pnpm prisma:seed"; then
            echo -e "${GREEN}✅ Prisma initialisé avec succès${NC}"
        else
            echo -e "${YELLOW}⚠️  Erreur lors des migrations/seed${NC}"
            show_manual_commands
        fi
    else
        echo -e "${YELLOW}⚠️  Erreur lors de la génération du client Prisma${NC}"
        show_manual_commands
    fi
}

# Fonction pour afficher les commandes manuelles en cas d'erreur
show_manual_commands() {
    echo -e "${CYAN}💡 Vous pouvez réessayer manuellement avec:${NC}"
    echo -e "${CYAN}   docker exec fastify-backend-dev sh -c \"cd /app/backend && pnpm prisma generate\"${NC}"
    echo -e "${CYAN}   docker exec fastify-backend-dev sh -c \"cd /app/backend && pnpm prisma migrate dev --name init\"${NC}"
    echo -e "${CYAN}   docker exec fastify-backend-dev sh -c \"cd /app/backend && pnpm prisma:seed\"${NC}"
}

# Fonction pour afficher les informations finales
show_project_info() {
    echo ""
    echo -e "${GREEN}🎉 Initialisation terminée !${NC}"
    echo -e "${GREEN}=========================${NC}"
    echo ""
    echo -e "${CYAN}📋 Services disponibles:${NC}"
    echo -e "${WHITE}   🌐 Frontend:     http://localhost:5173${NC}"
    echo -e "${WHITE}   ⚡ Backend API:  http://localhost:3000${NC}"
    echo -e "${WHITE}   🗄️  phpMyAdmin:  http://localhost:8080${NC}"
    echo -e "${WHITE}   📧 MailHog:      http://localhost:8025${NC}"
    echo -e "${WHITE}   📊 Grafana:      http://localhost:3001 (admin/admin)${NC}"
    echo -e "${WHITE}   💾 MinIO:        http://localhost:9001 (minioadmin/minioadmin)${NC}"
    echo ""
    echo -e "${CYAN}🔧 Commandes utiles:${NC}"
    echo -e "${WHITE}   Voir les logs:           docker compose -f docker/docker-compose.dev.yml logs -f${NC}"
    echo -e "${WHITE}   Arrêter:                 docker compose -f docker/docker-compose.dev.yml down${NC}"
    echo -e "${WHITE}   Redémarrer:              docker compose -f docker/docker-compose.dev.yml restart${NC}"
    echo -e "${WHITE}   Shell backend:           docker exec -it fastify-backend-dev sh${NC}"
    echo -e "${WHITE}   Shell frontend:          docker exec -it fastify-frontend-dev sh${NC}"
    echo ""
    echo -e "${YELLOW}📝 Les fichiers .env ont été créés dans le dossier backend/${NC}"
    echo -e "${YELLOW}   Pensez à les personnaliser selon vos besoins !${NC}"
}

# Exécution du script principal
main() {
    check_env_files
    start_docker_environment
    initialize_prisma
    show_project_info
}

# Gestion des erreurs
trap 'echo -e "${RED}❌ Erreur durant l'\''initialisation${NC}"; exit 1' ERR

# Exécuter le script principal
main "$@" 