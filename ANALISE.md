# 📊 Sistema de Análise de Dados - Pesquisa sobre Vinhos

Este projeto possui um sistema completo de análise de dados das respostas coletadas na pesquisa sobre vinhos e espumantes.

## 🗃️ Scripts de Análise Disponíveis

### 1. 📈 Análise Básica (`npm run analise`)
**Arquivo**: `scripts/analise-dados.ts`

Executa análise fundamental dos dados coletados:
- Total de respostas
- Distribuição demográfica (idade, gênero, estado civil)
- Hábitos de consumo (frequência, tipos, preços)
- Preferências (variedades, origens, canais de compra)
- Interesse em novidades (eventos, vinhos em lata, naturais)

### 2. 📋 Relatório Avançado (`npm run relatorio`)
**Arquivo**: `scripts/relatorio-avancado.ts`

Gera análise aprofundada com segmentação de clientes:
- Perfis de consumidores detalhados
- Segmentação por poder aquisitivo
- Análise de comportamento por região
- Recomendações estratégicas de marketing
- **Exporta**: `relatorio-vinhos.csv` e `resumo-analise.json`

### 3. 🗺️ Análise Geográfica (`npm run geografia`)
**Arquivo**: `scripts/analise-geografica.ts`

Análise regional baseada nos CEPs coletados:
- Distribuição por regiões de São Paulo e outros estados
- Preferências de vinho por região
- Oportunidades de mercado por localização
- Insights para expansão geográfica

### 4. 🎯 Resumo Executivo (`npm run executivo`)
**Arquivo**: `scripts/resumo-executivo.ts`

Dashboard consolidado para tomada de decisão:
- Resumo executivo completo
- KPIs principais do negócio
- Recomendações estratégicas prioritárias
- **Exporta**: `resumo-executivo.json` e `relatorio-final.txt`

## 🚀 Como Executar as Análises

### Pré-requisitos
```bash
# Instalar dependências (se ainda não instalado)
npm install

# Configurar banco de dados
npm run db:migrate
```

### Executar Análises Individuais
```bash
# Análise básica dos dados
npm run analise

# Relatório avançado com segmentação
npm run relatorio

# Análise geográfica regional
npm run geografia

# Resumo executivo completo
npm run executivo
```

### Executar Todas as Análises
```bash
# Sequência completa de análises
npm run analise && npm run relatorio && npm run geografia && npm run executivo
```

## 📁 Arquivos de Saída

Após executar as análises, os seguintes arquivos são gerados:

- **`relatorio-vinhos.csv`** - Dados estruturados para Excel/BI
- **`resumo-analise.json`** - Dados completos em JSON
- **`resumo-executivo.json`** - Dashboard executivo em JSON
- **`relatorio-final.txt`** - Resumo executivo em texto

## 📊 Principais Métricas Analisadas

### Demografia
- Distribuição por faixa etária
- Proporção de gêneros
- Estado civil dos respondentes
- Localização geográfica (CEP)

### Consumo
- Frequência de consumo de vinhos
- Tipos preferidos (tinto, branco, rosé, espumante)
- Faixas de preço habituais
- Interesse em vinhos sem álcool

### Preferências
- Variedades de uva favoritas
- Países/regiões de origem preferidos
- Canais de compra utilizados
- Fatores que influenciam a escolha

### Oportunidades
- Segmento premium (dispostos a pagar mais)
- Consumidores frequentes (potencial fidelização)
- Regiões com potencial de expansão
- Novidades com maior interesse

## 🎯 Insights Estratégicos

As análises revelam oportunidades para:

1. **Segmentação de Clientes**
   - Foco em consumidores frequentes (59% da base)
   - Desenvolvimento de linha premium (22% pagam >R$100)

2. **Expansão Geográfica**
   - Base concentrada em SP (97%)
   - Oportunidade em RJ e MG

3. **Estratégia de Comunicação**
   - WhatsApp como canal preferido (43%)
   - E-mail como alternativa (32%)

4. **Portfólio de Produtos**
   - Tintos como preferência dominante
   - Origens: Argentina, Chile, Portugal
   - Interesse em vinhos naturais e eventos

## 🔄 Atualização dos Dados

Para analisar novos dados coletados:

1. As análises sempre consultam os dados mais recentes do banco
2. Execute novamente qualquer script para dados atualizados
3. Os arquivos de saída são sobrescritos com os novos resultados

## 🛠️ Tecnologias Utilizadas

- **TypeScript** - Linguagem de programação
- **Prisma** - ORM para acesso ao banco de dados
- **PostgreSQL** - Banco de dados (Railway)
- **tsx** - Executor TypeScript para Node.js
- **CSV/JSON** - Formatos de exportação

## 📞 Suporte

Para dúvidas sobre as análises ou personalização dos relatórios, consulte a documentação do projeto ou entre em contato com a equipe de desenvolvimento.

---

**Status**: ✅ Sistema completo e funcional
**Última atualização**: Janeiro 2025
**Total de respostas analisadas**: 37+