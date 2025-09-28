# 🚀 Deploy Railway + Vercel - Instruções Completas

## 📋 Pré-requisitos
- Conta no [Railway](https://railway.app)
- Conta no [Vercel](https://vercel.com)
- Repositório GitHub já configurado ✅

## 🗄️ PASSO 1: Configurar PostgreSQL no Railway

### 1.1 Criar Projeto
1. Acesse [railway.app](https://railway.app)
2. Faça login com GitHub
3. Clique **"New Project"**
4. Selecione **"Provision PostgreSQL"**
5. Aguarde a criação (1-2 minutos)

### 1.2 Obter DATABASE_URL
1. Clique no **serviço PostgreSQL** criado
2. Vá na aba **"Variables"**
3. **Copie completamente** a `DATABASE_URL`
   - Formato: `postgresql://postgres:senha@host:porta/railway`
   - Exemplo: `postgresql://postgres:Abc123XyZ@containers-us-west-123.railway.app:1234/railway`

## 🌐 PASSO 2: Configurar Vercel

### 2.1 Deploy Automático
1. Acesse [vercel.com](https://vercel.com)
2. Clique **"New Project"**
3. Import o repositório: **`neivam-carvalho/pesquisas_sobre_vinhos`**
4. **NÃO clique em Deploy ainda!**

### 2.2 Configurar Variável de Ambiente
1. Antes do deploy, clique **"Environment Variables"**
2. Adicione:
   - **Key**: `DATABASE_URL`
   - **Value**: [Cole aqui a URL do Railway]
   - **Environments**: Marque **Production**, **Preview**, **Development**
3. Clique **"Add"**

### 2.3 Deploy
1. Agora clique **"Deploy"**
2. Aguarde a compilação (3-5 minutos)

## 🗃️ PASSO 3: Executar Migrações do Banco

### 3.1 Opção A - Via Vercel CLI (Recomendado)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login no Vercel
vercel login

# Executar migração
vercel env pull .env.local
npm run db:migrate
```

### 3.2 Opção B - Local com URL do Railway
1. Crie arquivo `.env` na raiz do projeto
2. Cole: `DATABASE_URL="[sua-url-do-railway]"`
3. Execute:
```bash
npm run db:migrate
```

## ✅ PASSO 4: Verificar Deploy

### 4.1 Teste a Aplicação
1. Acesse sua URL do Vercel (ex: `pesquisas-sobre-vinhos.vercel.app`)
2. Teste o formulário completo
3. Verifique se os dados são salvos

### 4.2 Verificar Analytics
1. Acesse: `sua-url.vercel.app/analytics`
2. Deve mostrar as estatísticas dos dados salvos

## 🎯 URLs Finais
- **Formulário**: `https://sua-app.vercel.app/`
- **Analytics**: `https://sua-app.vercel.app/analytics`

## 🔧 Comandos Úteis

```bash
# Ver logs do Railway
railway logs

# Executar migrações
npm run db:migrate

# Gerar novo Prisma client
npx prisma generate

# Ver dados no banco (local)
npx prisma studio
```

## 🆘 Troubleshooting

### Erro: "DATABASE_URL not found"
- ✅ Verifique se a variável foi adicionada no Vercel
- ✅ Certifique-se que marcou todos os environments

### Erro: "Can't reach database"
- ✅ Verifique se a URL do Railway está correta
- ✅ Verifique se o PostgreSQL está rodando no Railway

### Erro de migração
- ✅ Execute: `npm run db:migrate`
- ✅ Verifique se as migrações estão na pasta `prisma/migrations`

## 📞 Suporte
Se tiver problemas, compartilhe:
1. Mensagem de erro completa
2. URL do projeto Vercel
3. Screenshot do Railway (sem mostrar senhas)