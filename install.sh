#!/bin/bash

# ============================================
# Origem Viva Dashboard - Instalador
# ============================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════╗"
echo "║     ORIGEM VIVA - DASHBOARD INSTALLER     ║"
echo "╚═══════════════════════════════════════════╝"
echo -e "${NC}"

# Função para verificar comandos
check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✓${NC} $1 encontrado"
        return 0
    else
        echo -e "${RED}✗${NC} $1 não encontrado"
        return 1
    fi
}

# Função para gerar string aleatória
generate_secret() {
    openssl rand -base64 32 2>/dev/null || cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1
}

# Verificar requisitos
echo -e "\n${YELLOW}Verificando requisitos...${NC}\n"

HAS_DOCKER=false

if check_command docker; then
    HAS_DOCKER=true
fi

if check_command docker-compose || docker compose version &> /dev/null; then
    echo -e "${GREEN}✓${NC} docker compose encontrado"
else
    echo -e "${RED}✗${NC} docker compose não encontrado"
    HAS_DOCKER=false
fi

if [ "$HAS_DOCKER" = false ]; then
    echo -e "\n${RED}Erro: Você precisa ter Docker e Docker Compose instalados.${NC}"
    echo -e "Instale-os e tente novamente.\n"
    exit 1
fi

# Coletar informações
echo -e "\n${CYAN}═══════════════════════════════════════════${NC}"
echo -e "${CYAN}           CONFIGURAÇÃO DO SISTEMA          ${NC}"
echo -e "${CYAN}═══════════════════════════════════════════${NC}\n"

# Domínio
echo -e "${YELLOW}1. Configuração de Domínio${NC}"
read -p "Digite o domínio (ex: dashboard.minhaempresa.com): " DOMAIN
if [ -z "$DOMAIN" ]; then
    DOMAIN="localhost"
    echo -e "${YELLOW}Usando domínio padrão: localhost${NC}"
fi

# Porta
echo -e "\n${YELLOW}2. Configuração de Porta${NC}"
read -p "Digite a porta (padrão: 3005): " PORT
if [ -z "$PORT" ]; then
    PORT="3005"
fi

# Admin username
echo -e "\n${YELLOW}3. Usuário Administrador${NC}"
read -p "Digite o nome de usuário admin: " ADMIN_USERNAME
if [ -z "$ADMIN_USERNAME" ]; then
    ADMIN_USERNAME="admin"
    echo -e "${YELLOW}Usando usuário padrão: admin${NC}"
fi

# Admin password
echo -e "\n${YELLOW}4. Senha do Administrador${NC}"
while true; do
    read -s -p "Digite a senha do admin (mínimo 6 caracteres): " ADMIN_PASSWORD
    echo
    if [ ${#ADMIN_PASSWORD} -lt 6 ]; then
        echo -e "${RED}Senha muito curta. Mínimo 6 caracteres.${NC}"
        continue
    fi
    read -s -p "Confirme a senha: " ADMIN_PASSWORD_CONFIRM
    echo
    if [ "$ADMIN_PASSWORD" != "$ADMIN_PASSWORD_CONFIRM" ]; then
        echo -e "${RED}Senhas não conferem. Tente novamente.${NC}"
        continue
    fi
    break
done

# Database password
echo -e "\n${YELLOW}5. Senha do Banco de Dados${NC}"
read -s -p "Digite a senha do banco de dados (Enter para gerar automaticamente): " DB_PASSWORD
echo
if [ -z "$DB_PASSWORD" ]; then
    DB_PASSWORD=$(generate_secret)
    echo -e "${GREEN}Senha do banco gerada automaticamente${NC}"
fi

# JWT Secret
JWT_SECRET=$(generate_secret)

# Criar arquivo .env
echo -e "\n${BLUE}Criando arquivo de configuração...${NC}"

cat > .env << EOF
# ============================================
# Origem Viva Dashboard - Configuração
# Gerado em: $(date)
# ============================================

# Domínio
DOMAIN=${DOMAIN}

# Porta
PORT=${PORT}

# Database
DB_NAME=origemviva
DB_USER=origemviva
DB_PASSWORD=${DB_PASSWORD}

# JWT Secret
JWT_SECRET=${JWT_SECRET}

# Admin credentials
ADMIN_USERNAME=${ADMIN_USERNAME}
ADMIN_PASSWORD=${ADMIN_PASSWORD}

# API URL
API_URL=/api
EOF

echo -e "${GREEN}✓${NC} Arquivo .env criado"

# Resumo da configuração
echo -e "\n${CYAN}═══════════════════════════════════════════${NC}"
echo -e "${CYAN}           RESUMO DA CONFIGURAÇÃO           ${NC}"
echo -e "${CYAN}═══════════════════════════════════════════${NC}\n"

echo -e "Domínio:           ${GREEN}${DOMAIN}${NC}"
echo -e "Porta:             ${GREEN}${PORT}${NC}"
echo -e "Usuário Admin:     ${GREEN}${ADMIN_USERNAME}${NC}"
echo -e "URL de Acesso:     ${GREEN}http://${DOMAIN}:${PORT}${NC}"

echo -e "\n${YELLOW}Deseja continuar com a instalação? [S/n]${NC}"
read -p "" CONFIRM
if [[ "$CONFIRM" =~ ^[Nn]$ ]]; then
    echo -e "${YELLOW}Instalação cancelada.${NC}"
    exit 0
fi

# Build e start
echo -e "\n${BLUE}Construindo containers...${NC}"
docker compose build

echo -e "\n${BLUE}Iniciando serviços...${NC}"
docker compose up -d

# Aguardar inicialização
echo -e "\n${YELLOW}Aguardando inicialização dos serviços...${NC}"
sleep 10

# Verificar status
echo -e "\n${BLUE}Verificando status dos serviços...${NC}"
docker compose ps

echo -e "\n${GREEN}╔═══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║       INSTALAÇÃO CONCLUÍDA COM SUCESSO    ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════╝${NC}\n"

echo -e "Acesse o dashboard em: ${BLUE}http://${DOMAIN}:${PORT}${NC}"
echo -e "Usuário: ${CYAN}${ADMIN_USERNAME}${NC}"
echo -e "Senha: ${CYAN}(a que você definiu)${NC}"

echo -e "\n${YELLOW}Comandos úteis:${NC}"
echo -e "  ${CYAN}docker compose logs -f${NC}      - Ver logs"
echo -e "  ${CYAN}docker compose down${NC}         - Parar serviços"
echo -e "  ${CYAN}docker compose up -d${NC}        - Iniciar serviços"
echo -e "  ${CYAN}docker compose restart${NC}      - Reiniciar serviços"

echo -e "\n${GREEN}Instalação concluída!${NC}\n"
