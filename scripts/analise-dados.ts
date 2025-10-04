#!/usr/bin/env tsx
/**
 * 📊 Script de Análise de Dados - Railway PostgreSQL
 * 
 * Este script se conecta ao banco Railway e faz análises estatísticas
 * dos dados coletados na pesquisa sobre vinhos e espumantes.
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function conectarBanco() {
  try {
    console.log('🔌 Conectando ao Railway PostgreSQL...')
    await prisma.$connect()
    console.log('✅ Conexão estabelecida com sucesso!')
    return true
  } catch (error) {
    console.error('❌ Erro ao conectar:', error)
    return false
  }
}

async function analisarTabelas() {
  console.log('\n📋 === ANÁLISE DAS TABELAS ===')
  
  try {
    // Verificar se a tabela Survey existe e contar registros
    const totalRespostas = await prisma.survey.count()
    console.log(`📊 Total de respostas coletadas: ${totalRespostas}`)
    
    if (totalRespostas === 0) {
      console.log('⚠️  Nenhuma resposta encontrada no banco de dados.')
      return
    }
    
    // Análise demográfica
    console.log('\n👥 === ANÁLISE DEMOGRÁFICA ===')
    
    const faixaEtaria = await prisma.survey.groupBy({
      by: ['ageRange'],
      _count: { ageRange: true },
      where: { ageRange: { not: null } }
    })
    
    const genero = await prisma.survey.groupBy({
      by: ['gender'],
      _count: { gender: true },
      where: { gender: { not: null } }
    })
    
    const estadoCivil = await prisma.survey.groupBy({
      by: ['maritalStatus'],
      _count: { maritalStatus: true },
      where: { maritalStatus: { not: null } }
    })
    
    console.log('\n🎯 Distribuição por Faixa Etária:')
    faixaEtaria.forEach(item => {
      const porcentagem = ((item._count.ageRange / totalRespostas) * 100).toFixed(1)
      console.log(`  ${item.ageRange}: ${item._count.ageRange} (${porcentagem}%)`)
    })
    
    console.log('\n👤 Distribuição por Gênero:')
    genero.forEach(item => {
      const porcentagem = ((item._count.gender / totalRespostas) * 100).toFixed(1)
      console.log(`  ${item.gender}: ${item._count.gender} (${porcentagem}%)`)
    })
    
    console.log('\n💍 Distribuição por Estado Civil:')
    estadoCivil.forEach(item => {
      const porcentagem = ((item._count.maritalStatus / totalRespostas) * 100).toFixed(1)
      console.log(`  ${item.maritalStatus}: ${item._count.maritalStatus} (${porcentagem}%)`)
    })
    
  } catch (error) {
    console.error('❌ Erro na análise demográfica:', error)
  }
}

async function analisarConsumo() {
  console.log('\n🍷 === ANÁLISE DE CONSUMO ===')
  
  try {
    const frequencia = await prisma.survey.groupBy({
      by: ['frequency'],
      _count: { frequency: true },
      where: { frequency: { not: null } }
    })
    
    const classificacao = await prisma.survey.groupBy({
      by: ['classification'],
      _count: { classification: true },
      where: { classification: { not: null } }
    })
    
    const faixaPreco = await prisma.survey.groupBy({
      by: ['priceRange'],
      _count: { priceRange: true },
      where: { priceRange: { not: null } }
    })
    
    console.log('\n📅 Frequência de Consumo:')
    frequencia.forEach(item => {
      console.log(`  ${item.frequency}: ${item._count.frequency}`)
    })
    
    console.log('\n🏷️  Classificação Preferida:')
    classificacao.forEach(item => {
      console.log(`  ${item.classification}: ${item._count.classification}`)
    })
    
    console.log('\n💰 Faixa de Preço:')
    faixaPreco.forEach(item => {
      console.log(`  ${item.priceRange}: ${item._count.priceRange}`)
    })
    
  } catch (error) {
    console.error('❌ Erro na análise de consumo:', error)
  }
}

async function analisarPreferencias() {
  console.log('\n🎯 === ANÁLISE DE PREFERÊNCIAS ===')
  
  try {
    // Buscar respostas para análise de arrays
    const respostas = await prisma.survey.findMany({
      select: {
        wineStyle: true,
        wineType: true,
        preferredOrigins: true,
        purchaseChannels: true,
        attractiveFactors: true
      }
    })
    
    // Analisar estilos de vinho
    const estilosCount: Record<string, number> = {}
    respostas.forEach(r => {
      r.wineStyle.forEach(estilo => {
        estilosCount[estilo] = (estilosCount[estilo] || 0) + 1
      })
    })
    
    // Analisar tipos de vinho
    const tiposCount: Record<string, number> = {}
    respostas.forEach(r => {
      r.wineType.forEach(tipo => {
        tiposCount[tipo] = (tiposCount[tipo] || 0) + 1
      })
    })
    
    // Analisar origens
    const origensCount: Record<string, number> = {}
    respostas.forEach(r => {
      r.preferredOrigins.forEach(origem => {
        origensCount[origem] = (origensCount[origem] || 0) + 1
      })
    })
    
    console.log('\n🍾 Estilos de Vinho Mais Populares:')
    Object.entries(estilosCount)
      .sort(([,a], [,b]) => b - a)
      .forEach(([estilo, count]) => {
        console.log(`  ${estilo}: ${count}`)
      })
    
    console.log('\n🍷 Tipos de Vinho Mais Consumidos:')
    Object.entries(tiposCount)
      .sort(([,a], [,b]) => b - a)
      .forEach(([tipo, count]) => {
        console.log(`  ${tipo}: ${count}`)
      })
    
    console.log('\n🌍 Origens Preferidas:')
    Object.entries(origensCount)
      .sort(([,a], [,b]) => b - a)
      .forEach(([origem, count]) => {
        console.log(`  ${origem}: ${count}`)
      })
    
  } catch (error) {
    console.error('❌ Erro na análise de preferências:', error)
  }
}

async function analisarGeografia() {
  console.log('\n📍 === ANÁLISE GEOGRÁFICA (CEP) ===')
  
  try {
    const ceps = await prisma.survey.findMany({
      select: { cep: true },
      where: { cep: { not: null } }
    })
    
    // Analisar por região (primeiros 2 dígitos do CEP)
    const regioes: Record<string, number> = {}
    
    ceps.forEach(item => {
      if (item.cep && item.cep.length >= 2) {
        const regiao = item.cep.substring(0, 2)
        regioes[regiao] = (regioes[regiao] || 0) + 1
      }
    })
    
    console.log('\n📍 Distribuição por Região (primeiros 2 dígitos do CEP):')
    Object.entries(regioes)
      .sort(([,a], [,b]) => b - a)
      .forEach(([regiao, count]) => {
        // Mapear algumas regiões conhecidas
        let nomeRegiao = regiao
        if (regiao === '01' || regiao === '02' || regiao === '03' || regiao === '04' || regiao === '05') {
          nomeRegiao = `${regiao} (São Paulo)`
        } else if (regiao === '20' || regiao === '21' || regiao === '22' || regiao === '23') {
          nomeRegiao = `${regiao} (Rio de Janeiro)`
        } else if (regiao === '30' || regiao === '31' || regiao === '32') {
          nomeRegiao = `${regiao} (Belo Horizonte/MG)`
        }
        console.log(`  ${nomeRegiao}: ${count}`)
      })
    
  } catch (error) {
    console.error('❌ Erro na análise geográfica:', error)
  }
}

async function analisarContato() {
  console.log('\n📞 === ANÁLISE DE CONTATO ===')
  
  try {
    const comunicacao = await prisma.survey.groupBy({
      by: ['communicationPreference'],
      _count: { communicationPreference: true },
      where: { communicationPreference: { not: null } }
    })
    
    const totalEmails = await prisma.survey.count({
      where: { email: { not: null } }
    })
    
    const totalTelefones = await prisma.survey.count({
      where: { phone: { not: null } }
    })
    
    console.log(`📧 Total com e-mail: ${totalEmails}`)
    console.log(`📱 Total com telefone: ${totalTelefones}`)
    
    console.log('\n📢 Preferência de Comunicação:')
    comunicacao.forEach(item => {
      console.log(`  ${item.communicationPreference}: ${item._count.communicationPreference}`)
    })
    
  } catch (error) {
    console.error('❌ Erro na análise de contato:', error)
  }
}

async function resumoExecutivo() {
  console.log('\n📈 === RESUMO EXECUTIVO ===')
  
  try {
    const total = await prisma.survey.count()
    const comEmail = await prisma.survey.count({ where: { email: { not: null } } })
    const comTelefone = await prisma.survey.count({ where: { phone: { not: null } } })
    
    const primeiraResposta = await prisma.survey.findFirst({
      orderBy: { createdAt: 'asc' },
      select: { createdAt: true }
    })
    
    const ultimaResposta = await prisma.survey.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true }
    })
    
    console.log(`📊 Total de Respostas: ${total}`)
    console.log(`📧 Taxa de E-mail: ${((comEmail / total) * 100).toFixed(1)}%`)
    console.log(`📱 Taxa de Telefone: ${((comTelefone / total) * 100).toFixed(1)}%`)
    
    if (primeiraResposta && ultimaResposta) {
      console.log(`📅 Primeira resposta: ${primeiraResposta.createdAt.toLocaleDateString('pt-BR')}`)
      console.log(`📅 Última resposta: ${ultimaResposta.createdAt.toLocaleDateString('pt-BR')}`)
    }
    
  } catch (error) {
    console.error('❌ Erro no resumo executivo:', error)
  }
}

async function main() {
  console.log('🍷 === ANÁLISE DE DADOS - PESQUISA VINHOS & ESPUMANTES ===\n')
  
  const conectado = await conectarBanco()
  if (!conectado) {
    console.log('❌ Não foi possível conectar ao banco. Verifique a DATABASE_URL.')
    process.exit(1)
  }
  
  await analisarTabelas()
  await analisarConsumo()
  await analisarPreferencias()
  await analisarGeografia()
  await analisarContato()
  await resumoExecutivo()
  
  console.log('\n✅ === ANÁLISE CONCLUÍDA ===')
  await prisma.$disconnect()
}

// Executar análise
main().catch((error) => {
  console.error('❌ Erro fatal:', error)
  process.exit(1)
})