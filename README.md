# Pesquisa sobre Vinhos - Formulário Typeform-style

Uma aplicação web moderna para coleta de dados sobre preferências de vinhos, com design inspirado no Typeform, construída com Next.js, TypeScript, Tailwind CSS e PostgreSQL.

## 🍷 Características

- **Interface Moderna**: Design inspirado no Typeform com animações suaves
- **3 Tipos de Perguntas**: 
  - Pergunta aberta (textarea)
  - Seleção única (radio buttons)
  - Múltipla escolha (checkboxes)
- **Base de dados**: PostgreSQL hospedado no Railway
- **Deploy**: Vercel
- **Análise de Dados**: Dashboard com estatísticas das respostas

## 🚀 Tecnologias

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS
- **Animações**: Framer Motion
- **Ícones**: Lucide React
- **Base de Dados**: PostgreSQL (Railway)
- **ORM**: Prisma
- **Deploy**: Vercel

## 📋 Estrutura da Pesquisa

### 1. **Perfil Demográfico**
- Faixa etária (5 opções)
- Sexo (3 opções)
- Estado civil (4 opções)
- Quantidade de pessoas na casa (5 opções)

### 2. **Hábitos de Consumo**
- Frequência de consumo (5 opções)
- Estilo de vinho preferido (3 opções)
- Tipo mais consumido (4 opções)
- Classificação preferida (3 opções)
- Faixa de preço por garrafa (6 opções)

### 3. **Preferências**
- Variedades que mais consome (texto livre)
- Interesse em conhecer novas variedades (2 opções)
- Origens preferidas (múltipla escolha - 7 opções)
- Onde costuma comprar (múltipla escolha - 9 opções)
- Fatores mais atrativos (6 opções)

### 4. **Novidades**
- Participação em eventos de vinhos (2 opções)
- Conhecimento sobre vinhos em lata (3 opções)
- Conhecimento sobre vinhos naturais/biodinâmicos (3 opções)

### 5. **Contato**
- Nome (texto livre)
- E-mail (texto livre)
- Telefone/WhatsApp (texto livre)
- Preferência de comunicação (3 opções)

## 🛠️ Configuração Local

### Pré-requisitos
- Node.js 18+
- PostgreSQL (ou conta no Railway)

### Instalação

1. Clone o repositório:
```bash
git clone <repository-url>
cd pesquisas-sobre-vinhos
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

4. Configure sua base de dados PostgreSQL no `.env`:
```env
DATABASE_URL="postgresql://username:password@host:port/database"
```

5. Execute as migrações do Prisma:
```bash
npx prisma migrate dev
npx prisma generate
```

6. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

## 🗄️ Base de Dados

### Schema Prisma

```prisma
model Survey {
  id                      String   @id @default(cuid())
  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt
  
  // Demographics
  ageRange                String?
  gender                  String?
  maritalStatus           String?
  householdSize           String?
  
  // Consumption Habits
  frequency               String?
  wineStyle               String?
  wineType                String?
  classification          String?
  priceRange              String?
  
  // Preferences
  grapeVarieties          String?
  tryNewVarieties         String?
  preferredOrigins        String[] @default([])
  purchaseChannels        String[] @default([])
  attractiveFactors       String?
  
  // Novelties
  wineEvents              String?
  cannedWines             String?
  naturalWines            String?
  
  // Contact
  name                    String?
  email                   String?
  phone                   String?
  communicationPreference String?
  
  // Metadata
  userAgent               String?
  ipAddress               String?
  completedAt             DateTime?
  
  @@map("surveys")
}
```

## 🔧 Deploy

### Railway (Base de Dados)

1. Crie uma conta no [Railway](https://railway.app/)
2. Crie um novo projeto PostgreSQL
3. Copie a URL de conexão para o `.env`

### Vercel (Frontend)

1. Conecte seu repositório ao [Vercel](https://vercel.com/)
2. Configure as variáveis de ambiente no dashboard do Vercel
3. Deploy automático será feito a cada push

## 📊 Analytics

A aplicação inclui um dashboard de analytics em `/analytics` que mostra:

- Total de respostas coletadas
- Distribuição de preferências de tipos de vinho
- Canais de compra mais utilizados
- Respostas recentes com detalhes
- Estatísticas demográficas
- Análise de frequência de consumo

## 🎨 Funcionalidades da UI

- **Progress Bar**: Indicador visual do progresso através das 5 seções
- **Animações Suaves**: Transições entre seções
- **Layout Multi-seção**: Cada página agrupa perguntas relacionadas
- **Responsivo**: Funciona em dispositivos móveis e desktop
- **Validação**: Validação em tempo real das respostas
- **Loading States**: Estados de carregamento durante envio
- **Formulários Dinâmicos**: Suporte para diferentes tipos de input

## 🔗 Rotas da API

- `POST /api/survey` - Submeter nova resposta
- `GET /api/survey` - Obter respostas e analytics

## 📱 URLs

- **Pesquisa**: `/` (página principal)
- **Analytics**: `/analytics`

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para dúvidas ou suporte, abra uma issue no repositório do GitHub.
