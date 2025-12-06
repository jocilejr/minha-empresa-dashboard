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

# Verificar requisitos
echo -e "\n${YELLOW}Verificando requisitos...${NC}\n"

HAS_DOCKER=false
HAS_NODE=false

if check_command docker; then
    HAS_DOCKER=true
fi

if check_command node; then
    HAS_NODE=true
    NODE_VERSION=$(node -v)
    echo -e "  Versão: $NODE_VERSION"
fi

if [ "$HAS_DOCKER" = false ] && [ "$HAS_NODE" = false ]; then
    echo -e "\n${RED}Erro: Você precisa ter Docker ou Node.js instalado.${NC}"
    echo -e "Instale um deles e tente novamente.\n"
    exit 1
fi

# Escolher método de instalação
echo -e "\n${YELLOW}Escolha o método de instalação:${NC}\n"
echo "1) Docker (recomendado para produção)"
echo "2) Node.js (desenvolvimento/teste)"
echo ""

read -p "Opção [1/2]: " INSTALL_METHOD

case $INSTALL_METHOD in
    1)
        if [ "$HAS_DOCKER" = false ]; then
            echo -e "${RED}Docker não está instalado!${NC}"
            exit 1
        fi
        
        echo -e "\n${BLUE}Iniciando instalação com Docker...${NC}\n"
        
        # Build da imagem
        echo -e "${YELLOW}Construindo imagem Docker...${NC}"
        docker-compose build
        
        # Iniciar container
        echo -e "${YELLOW}Iniciando container...${NC}"
        docker-compose up -d
        
        echo -e "\n${GREEN}✓ Dashboard instalado com sucesso!${NC}"
        echo -e "\nAcesse: ${BLUE}http://localhost:3000${NC}\n"
        
        echo -e "Comandos úteis:"
        echo -e "  ${YELLOW}docker-compose logs -f${NC}  - Ver logs"
        echo -e "  ${YELLOW}docker-compose down${NC}    - Parar"
        echo -e "  ${YELLOW}docker-compose up -d${NC}   - Iniciar"
        ;;
        
    2)
        if [ "$HAS_NODE" = false ]; then
            echo -e "${RED}Node.js não está instalado!${NC}"
            exit 1
        fi
        
        echo -e "\n${BLUE}Iniciando instalação com Node.js...${NC}\n"
        
        # Instalar dependências
        echo -e "${YELLOW}Instalando dependências...${NC}"
        npm install
        
        # Build
        echo -e "${YELLOW}Gerando build de produção...${NC}"
        npm run build
        
        # Verificar se serve está instalado
        if ! command -v serve &> /dev/null; then
            echo -e "${YELLOW}Instalando servidor estático...${NC}"
            npm install -g serve
        fi
        
        echo -e "\n${GREEN}✓ Build concluído com sucesso!${NC}"
        echo -e "\nPara iniciar o servidor:"
        echo -e "  ${YELLOW}serve -s dist -l 3000${NC}"
        echo -e "\nOu para desenvolvimento:"
        echo -e "  ${YELLOW}npm run dev${NC}"
        ;;
        
    *)
        echo -e "${RED}Opção inválida!${NC}"
        exit 1
        ;;
esac

echo -e "\n${GREEN}Instalação concluída!${NC}\n"
