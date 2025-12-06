# Guia de Instalação - Origem Viva Dashboard

## Requisitos

- Node.js 18+ ou Docker
- Nginx (opcional, para proxy reverso)

---

## Opção 1: Instalação Rápida (Recomendada)

```bash
# Clone o repositório
git clone <seu-repositorio> origem-viva-dashboard
cd origem-viva-dashboard

# Execute o instalador
chmod +x install.sh
./install.sh
```

---

## Opção 2: Docker (Produção)

```bash
# Build e start
docker-compose up -d --build

# O dashboard estará disponível em http://localhost:3000
```

---

## Opção 3: Instalação Manual

### 1. Instalar dependências

```bash
npm install
```

### 2. Build para produção

```bash
npm run build
```

### 3. Servir os arquivos

Os arquivos estáticos estarão na pasta `dist/`. Você pode servi-los com qualquer servidor web.

#### Com Node.js (serve):
```bash
npm install -g serve
serve -s dist -l 3000
```

#### Com Nginx:
```nginx
server {
    listen 80;
    server_name seu-dominio.com;
    root /caminho/para/origem-viva-dashboard/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## Configuração de Proxy Reverso (Nginx)

Se você já tem outros serviços na VPS, configure um proxy reverso:

```nginx
server {
    listen 80;
    server_name dashboard.seudominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## SSL com Certbot (HTTPS)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d dashboard.seudominio.com
```

---

## Comandos Úteis

```bash
# Ver logs do container
docker-compose logs -f

# Parar o serviço
docker-compose down

# Atualizar o dashboard
git pull
docker-compose up -d --build
```

---

## Suporte

Para dúvidas ou problemas, entre em contato com o suporte técnico.
