# Guia de Deploy - MEMORIAS Frontend

Este documento fornece instruções detalhadas para fazer o deploy da aplicação MEMORIAS em diferentes plataformas.

## 📋 Pré-requisitos

Antes de fazer o deploy, certifique-se de que:

1. **Supabase está configurado** com:
   - Banco de dados PostgreSQL
   - Políticas RLS implementadas
   - Storage bucket configurado
   - Autenticação OAuth configurada

2. **Variáveis de ambiente** estão definidas:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Build de produção** funciona localmente:
   ```bash
   pnpm run build
   pnpm run preview
   ```

## 🚀 Deploy na Vercel (Recomendado)

A Vercel oferece a melhor experiência para aplicações React com Vite.

### 1. Deploy via CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer login
vercel login

# Deploy
vercel --prod
```

### 2. Deploy via GitHub

1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente no dashboard
3. O deploy será automático a cada push

### 3. Configuração Vercel

Crie o arquivo `vercel.json`:

```json
{
  "framework": "vite",
  "buildCommand": "pnpm run build",
  "outputDirectory": "dist",
  "installCommand": "pnpm install",
  "env": {
    "VITE_SUPABASE_URL": "@supabase_url",
    "VITE_SUPABASE_ANON_KEY": "@supabase_anon_key"
  },
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## 🌐 Deploy na Netlify

### 1. Deploy via CLI

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Build
pnpm run build

# Deploy
netlify deploy --prod --dir=dist
```

### 2. Configuração Netlify

Crie o arquivo `netlify.toml`:

```toml
[build]
  publish = "dist"
  command = "pnpm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[context.production.environment]
  VITE_SUPABASE_URL = "https://your-project.supabase.co"
  VITE_SUPABASE_ANON_KEY = "your-anon-key"
```

## ☁️ Deploy na AWS S3 + CloudFront

### 1. Configuração S3

```bash
# Criar bucket
aws s3 mb s3://memorias-frontend

# Configurar website
aws s3 website s3://memorias-frontend \
  --index-document index.html \
  --error-document index.html

# Upload dos arquivos
pnpm run build
aws s3 sync dist/ s3://memorias-frontend --delete
```

### 2. Configuração CloudFront

```json
{
  "Origins": [{
    "DomainName": "memorias-frontend.s3-website-us-east-1.amazonaws.com",
    "Id": "S3-memorias-frontend",
    "CustomOriginConfig": {
      "HTTPPort": 80,
      "OriginProtocolPolicy": "http-only"
    }
  }],
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-memorias-frontend",
    "ViewerProtocolPolicy": "redirect-to-https",
    "Compress": true
  },
  "CustomErrorResponses": [{
    "ErrorCode": 404,
    "ResponseCode": 200,
    "ResponsePagePath": "/index.html"
  }]
}
```

## 🔥 Deploy no Firebase Hosting

### 1. Configuração

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Inicializar projeto
firebase init hosting
```

### 2. Configuração Firebase

Arquivo `firebase.json`:

```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [{
      "source": "**",
      "destination": "/index.html"
    }],
    "headers": [{
      "source": "**/*.@(js|css)",
      "headers": [{
        "key": "Cache-Control",
        "value": "max-age=31536000"
      }]
    }]
  }
}
```

### 3. Deploy

```bash
pnpm run build
firebase deploy
```

## 🐳 Deploy com Docker

### 1. Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 2. nginx.conf

```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }

        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

### 3. Build e Deploy

```bash
# Build da imagem
docker build -t memorias-frontend .

# Run local
docker run -p 8080:80 memorias-frontend

# Deploy para registry
docker tag memorias-frontend your-registry/memorias-frontend
docker push your-registry/memorias-frontend
```

## 🔧 Configurações de Produção

### 1. Variáveis de Ambiente

Certifique-se de configurar todas as variáveis necessárias:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Aplicação
VITE_APP_NAME=MEMORIAS
VITE_APP_VERSION=1.0.0
VITE_PRODUCTION_URL=https://memorias.app

# Analytics (opcional)
VITE_GA_TRACKING_ID=G-XXXXXXXXXX
VITE_HOTJAR_ID=XXXXXXX
```

### 2. Otimizações de Build

No `vite.config.js`:

```javascript
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          supabase: ['@supabase/supabase-js']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
```

### 3. Headers de Segurança

Configure headers de segurança no seu servidor:

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co;
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

## 📊 Monitoramento

### 1. Analytics

Configure Google Analytics ou similar:

```javascript
// src/lib/analytics.js
import { gtag } from 'ga-gtag'

export const trackEvent = (action, category, label, value) => {
  gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value
  })
}
```

### 2. Error Tracking

Configure Sentry ou similar:

```javascript
// src/lib/sentry.js
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.NODE_ENV
})
```

### 3. Performance Monitoring

Use Web Vitals:

```javascript
// src/lib/vitals.js
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

function sendToAnalytics(metric) {
  gtag('event', metric.name, {
    event_category: 'Web Vitals',
    value: Math.round(metric.value),
    non_interaction: true
  })
}

getCLS(sendToAnalytics)
getFID(sendToAnalytics)
getFCP(sendToAnalytics)
getLCP(sendToAnalytics)
getTTFB(sendToAnalytics)
```

## 🔍 Troubleshooting

### Problemas Comuns

1. **Erro 404 em rotas**
   - Configure redirects para SPA
   - Verifique se o servidor está servindo index.html para todas as rotas

2. **Variáveis de ambiente não carregam**
   - Certifique-se que começam com `VITE_`
   - Verifique se estão configuradas na plataforma de deploy

3. **Build falha**
   - Verifique versão do Node.js (>=18)
   - Limpe cache: `rm -rf node_modules/.vite`
   - Reinstale dependências: `pnpm install`

4. **Problemas de CORS**
   - Configure domínios permitidos no Supabase
   - Verifique URLs de produção

### Logs e Debug

```bash
# Logs de build
pnpm run build --debug

# Análise de bundle
pnpm run build && npx vite-bundle-analyzer

# Preview local
pnpm run preview --host
```

## 📝 Checklist de Deploy

- [ ] Variáveis de ambiente configuradas
- [ ] Build de produção funciona
- [ ] Supabase configurado para produção
- [ ] Domínio configurado
- [ ] SSL/HTTPS habilitado
- [ ] Redirects para SPA configurados
- [ ] Headers de segurança configurados
- [ ] Analytics configurado
- [ ] Error tracking configurado
- [ ] Performance monitoring configurado
- [ ] Backup e recovery configurados

---

**Sucesso no seu deploy! 🚀**
