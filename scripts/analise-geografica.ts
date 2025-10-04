#!/usr/bin/env tsx
/**
 * 🗺️ Análise Geográfica Detalhada - CEPs
 * 
 * Script para análise regional baseada nos CEPs coletados
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface SurveyData {
  id: string
  cep: string | null
  ageRange: string | null
  gender: string | null
  frequency: string | null
  priceRange: string | null
  wineType: string[]
  preferredOrigins: string[]
}

// Mapeamento de regiões por CEP (primeiros 2 dígitos)
const REGIOES_CEP = {
  // São Paulo Capital e Região Metropolitana
  '01': 'São Paulo - Centro',
  '02': 'São Paulo - Zona Norte',
  '03': 'São Paulo - Zona Leste',
  '04': 'São Paulo - Zona Sul',
  '05': 'São Paulo - Zona Oeste',
  '08': 'São Paulo - Grande SP',
  '09': 'São Paulo - Grande ABC',
  
  // Outras capitais e regiões
  '20': 'Rio de Janeiro - Centro',
  '21': 'Rio de Janeiro - Zona Norte',
  '22': 'Rio de Janeiro - Zona Sul/Oeste',
  '23': 'Rio de Janeiro - Baixada',
  
  '30': 'Minas Gerais - Belo Horizonte',
  '31': 'Minas Gerais - BH Metropolitana',
  '32': 'Minas Gerais - Interior',
  
  '13': 'São Paulo - Campinas/Região',
  '14': 'São Paulo - Bauru/Região',
  '15': 'São Paulo - Sorocaba/Região',
  '16': 'São Paulo - Ribeirão Preto/Região',
  '17': 'São Paulo - São José do Rio Preto',
  '18': 'São Paulo - Presidente Prudente',
  '19': 'São Paulo - Americana/Região',
}

async function analisarDistribuicaoGeografica() {
  console.log('🗺️ === ANÁLISE GEOGRÁFICA DETALHADA ===\n')
  
  const respostas = await prisma.survey.findMany({
    select: {
      id: true,
      cep: true,
      ageRange: true,
      gender: true,
      frequency: true,
      priceRange: true,
      wineType: true,
      preferredOrigins: true
    },
    where: {
      cep: { not: null }
    }
  })
  
  // Agrupar por região
  const regioes: Record<string, SurveyData[]> = {}
  
  respostas.forEach(resposta => {
    if (resposta.cep && resposta.cep.length >= 2) {
      const codigoRegiao = resposta.cep.substring(0, 2)
      const nomeRegiao = REGIOES_CEP[codigoRegiao as keyof typeof REGIOES_CEP] || `Região ${codigoRegiao}`
      
      if (!regioes[nomeRegiao]) {
        regioes[nomeRegiao] = []
      }
      regioes[nomeRegiao].push(resposta)
    }
  })
  
  console.log('📍 Distribuição por Região:')
  const regioesOrdenadas = Object.entries(regioes)
    .sort(([,a], [,b]) => b.length - a.length)
  
  regioesOrdenadas.forEach(([regiao, clientes]) => {
    const porcentagem = ((clientes.length / respostas.length) * 100).toFixed(1)
    console.log(`  ${regiao}: ${clientes.length} (${porcentagem}%)`)
  })
  
  return regioes
}

async function analisarPreferenciasPorRegiao(regioes: Record<string, SurveyData[]>) {
  console.log('\n🍷 === PREFERÊNCIAS POR REGIÃO ===\n')
  
  Object.entries(regioes).forEach(([regiao, clientes]) => {
    if (clientes.length >= 2) { // Só analisar regiões com pelo menos 2 clientes
      console.log(`📍 ${regiao} (${clientes.length} clientes):`)
      
      // Tipos de vinho mais populares
      const tiposCount: Record<string, number> = {}
      clientes.forEach(cliente => {
        if (cliente.wineType && Array.isArray(cliente.wineType)) {
          cliente.wineType.forEach((tipo: string) => {
            tiposCount[tipo] = (tiposCount[tipo] || 0) + 1
          })
        }
      })
      
      const tiposMaisPopulares = Object.entries(tiposCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
      
      if (tiposMaisPopulares.length > 0) {
        console.log(`  🍷 Tipos preferidos: ${tiposMaisPopulares.map(([tipo, count]) => `${tipo} (${count})`).join(', ')}`)
      }
      
      // Origens preferidas
      const origensCount: Record<string, number> = {}
      clientes.forEach(cliente => {
        if (cliente.preferredOrigins && Array.isArray(cliente.preferredOrigins)) {
          cliente.preferredOrigins.forEach((origem: string) => {
            origensCount[origem] = (origensCount[origem] || 0) + 1
          })
        }
      })
      
      const origensMaisPopulares = Object.entries(origensCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
      
      if (origensMaisPopulares.length > 0) {
        console.log(`  🌍 Origens preferidas: ${origensMaisPopulares.map(([origem, count]) => `${origem} (${count})`).join(', ')}`)
      }
      
      // Faixa de preço predominante
      const precosCount: Record<string, number> = {}
      clientes.forEach(cliente => {
        if (cliente.priceRange) {
          precosCount[cliente.priceRange] = (precosCount[cliente.priceRange] || 0) + 1
        }
      })
      
      const precoMaisPopular = Object.entries(precosCount)
        .sort(([,a], [,b]) => b - a)[0]
      
      if (precoMaisPopular) {
        console.log(`  💰 Faixa de preço predominante: ${precoMaisPopular[0]} (${precoMaisPopular[1]} clientes)`)
      }
      
      console.log('')
    }
  })
}

async function identificarOportunidadesPorRegiao(regioes: Record<string, SurveyData[]>) {
  console.log('💡 === OPORTUNIDADES POR REGIÃO ===\n')
  
  Object.entries(regioes).forEach(([regiao, clientes]) => {
    if (clientes.length >= 3) { // Focar em regiões com potencial
      console.log(`🎯 ${regiao}:`)
      
      // Calcular poder aquisitivo médio
      const clientesPremium = clientes.filter(c => 
        c.priceRange?.includes('101') || c.priceRange?.includes('200')
      ).length
      
      const clientesFrequentes = clientes.filter(c => 
        c.frequency?.includes('semana')
      ).length
      
      const porcentagemPremium = ((clientesPremium / clientes.length) * 100).toFixed(1)
      const porcentagemFrequentes = ((clientesFrequentes / clientes.length) * 100).toFixed(1)
      
      console.log(`  📊 Perfil: ${porcentagemPremium}% premium, ${porcentagemFrequentes}% frequentes`)
      
      // Recomendações
      if (clientesPremium / clientes.length > 0.3) {
        console.log(`  💎 OPORTUNIDADE: Região com alto poder aquisitivo - focar em vinhos premium`)
      }
      
      if (clientesFrequentes / clientes.length > 0.6) {
        console.log(`  🔄 OPORTUNIDADE: Muitos consumidores frequentes - criar programa de fidelidade`)
      }
      
      if (clientes.length >= 5) {
        console.log(`  📍 OPORTUNIDADE: Base sólida de clientes - considerar eventos locais`)
      }
      
      console.log('')
    }
  })
}

async function gerarRelatorioGeografico() {
  console.log('📋 === RESUMO GEOGRÁFICO ===\n')
  
  const totalComCep = await prisma.survey.count({
    where: { cep: { not: null } }
  })
  
  const total = await prisma.survey.count()
  
  console.log(`📊 Cobertura geográfica: ${totalComCep}/${total} (${((totalComCep/total)*100).toFixed(1)}%)`)
  
  // Concentração por estado
  const estados = {
    'São Paulo': 0,
    'Rio de Janeiro': 0,
    'Minas Gerais': 0,
    'Outros': 0
  }
  
  const respostas = await prisma.survey.findMany({
    select: { cep: true },
    where: { cep: { not: null } }
  })
  
  respostas.forEach(r => {
    if (r.cep) {
      const codigo = r.cep.substring(0, 2)
      if (['01', '02', '03', '04', '05', '08', '09', '13', '14', '15', '16', '17', '18', '19'].includes(codigo)) {
        estados['São Paulo']++
      } else if (['20', '21', '22', '23'].includes(codigo)) {
        estados['Rio de Janeiro']++
      } else if (['30', '31', '32'].includes(codigo)) {
        estados['Minas Gerais']++
      } else {
        estados['Outros']++
      }
    }
  })
  
  console.log('\n🗺️ Distribuição por Estado:')
  Object.entries(estados).forEach(([estado, count]) => {
    if (count > 0) {
      const porcentagem = ((count / totalComCep) * 100).toFixed(1)
      console.log(`  ${estado}: ${count} (${porcentagem}%)`)
    }
  })
  
  console.log('\n📈 INSIGHTS GEOGRÁFICOS:')
  if (estados['São Paulo'] > totalComCep * 0.7) {
    console.log('  🎯 Forte concentração em São Paulo - expandir para outros estados')
  }
  
  if (estados['São Paulo'] > 0) {
    console.log('  📍 Presença significativa em SP - aproveitar logística local')
  }
  
  if (totalComCep >= 30) {
    console.log('  📊 Base geográfica sólida para análise estatística')
  }
}

async function main() {
  console.log('🗺️ === ANÁLISE GEOGRÁFICA COMPLETA ===\n')
  
  try {
    await prisma.$connect()
    
    const regioes = await analisarDistribuicaoGeografica()
    await analisarPreferenciasPorRegiao(regioes)
    await identificarOportunidadesPorRegiao(regioes)
    await gerarRelatorioGeografico()
    
    console.log('\n✅ === ANÁLISE GEOGRÁFICA CONCLUÍDA ===')
    
  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()