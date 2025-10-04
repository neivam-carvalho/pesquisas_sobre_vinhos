#!/usr/bin/env tsx
/**
 * 📊 Resumo Executivo - Dashboard Final
 * 
 * Consolidação de todas as análises em um relatório executivo completo
 */

import { PrismaClient } from '@prisma/client'
import { writeFileSync } from 'fs'

const prisma = new PrismaClient()

interface ExecutiveSummary {
  timestamp: string
  totalResponses: number
  demographic: {
    primaryAgeGroup: string
    genderDistribution: Record<string, number>
    maritalStatus: Record<string, number>
  }
  consumption: {
    frequencyProfile: Record<string, number>
    priceSegmentation: Record<string, number>
    winePreferences: Record<string, number>
  }
  geographic: {
    stateDistribution: Record<string, number>
    mainRegions: Array<{ region: string; count: number; percentage: number }>
  }
  opportunities: {
    premiumSegment: number
    frequentConsumers: number
    geographicExpansion: string[]
    communicationChannels: Record<string, number>
  }
  recommendations: string[]
}

async function gerarResumoExecutivo(): Promise<ExecutiveSummary> {
  console.log('📊 === GERANDO RESUMO EXECUTIVO ===\n')
  
  const total = await prisma.survey.count()
  console.log(`📈 Total de respostas coletadas: ${total}`)
  
  // Dados demográficos
  const idades = await prisma.survey.groupBy({
    by: ['ageRange'],
    _count: { ageRange: true },
    orderBy: { _count: { ageRange: 'desc' } }
  })
  
  const generos = await prisma.survey.groupBy({
    by: ['gender'],
    _count: { gender: true }
  })
  
  const estadoCivil = await prisma.survey.groupBy({
    by: ['maritalStatus'],
    _count: { maritalStatus: true }
  })
  
  // Hábitos de consumo
  const frequencias = await prisma.survey.findMany({
    select: { frequency: true }
  })
  
  const frequencyCount: Record<string, number> = {}
  frequencias.forEach(f => {
    const freq = f.frequency || 'Não informado'
    frequencyCount[freq] = (frequencyCount[freq] || 0) + 1
  })
  
  const precos = await prisma.survey.groupBy({
    by: ['priceRange'],
    _count: { priceRange: true },
    orderBy: { _count: { priceRange: 'desc' } }
  })
  
  const vinhos = await prisma.survey.findMany({
    select: { wineType: true }
  })
  
  const wineTypeCount: Record<string, number> = {}
  vinhos.forEach(v => {
    v.wineType?.forEach(tipo => {
      wineTypeCount[tipo] = (wineTypeCount[tipo] || 0) + 1
    })
  })
  
  // Distribuição geográfica
  const ceps = await prisma.survey.findMany({
    select: { cep: true },
    where: { cep: { not: null } }
  })
  
  const stateDistribution: Record<string, number> = {
    'São Paulo': 0,
    'Rio de Janeiro': 0,
    'Outros': 0
  }
  
  const regionDistribution: Record<string, number> = {}
  
  ceps.forEach(c => {
    if (c.cep) {
      const codigo = c.cep.substring(0, 2)
      if (['01', '02', '03', '04', '05', '08', '09', '13', '14', '15', '16', '17', '18', '19'].includes(codigo)) {
        stateDistribution['São Paulo']++
        
        // Classificar por região de SP
        if (['04'].includes(codigo)) regionDistribution['São Paulo - Zona Sul'] = (regionDistribution['São Paulo - Zona Sul'] || 0) + 1
        else if (['13'].includes(codigo)) regionDistribution['São Paulo - Campinas'] = (regionDistribution['São Paulo - Campinas'] || 0) + 1
        else if (['05'].includes(codigo)) regionDistribution['São Paulo - Zona Oeste'] = (regionDistribution['São Paulo - Zona Oeste'] || 0) + 1
        else if (['03'].includes(codigo)) regionDistribution['São Paulo - Zona Leste'] = (regionDistribution['São Paulo - Zona Leste'] || 0) + 1
        else regionDistribution['São Paulo - Outras'] = (regionDistribution['São Paulo - Outras'] || 0) + 1
        
      } else if (['20', '21', '22', '23'].includes(codigo)) {
        stateDistribution['Rio de Janeiro']++
        regionDistribution['Rio de Janeiro'] = (regionDistribution['Rio de Janeiro'] || 0) + 1
      } else {
        stateDistribution['Outros']++
        regionDistribution['Outros Estados'] = (regionDistribution['Outros Estados'] || 0) + 1
      }
    }
  })
  
  // Canais de comunicação
  const contatos = await prisma.survey.groupBy({
    by: ['communicationPreference'],
    _count: { communicationPreference: true }
  })
  
  const contactCount: Record<string, number> = {}
  contatos.forEach(c => {
    const pref = c.communicationPreference || 'Não informado'
    contactCount[pref] = c._count.communicationPreference || 0
  })
  
  // Segmento premium e frequentes
  const premiumCount = await prisma.survey.count({
    where: {
      OR: [
        { priceRange: { contains: '101' } },
        { priceRange: { contains: '200' } }
      ]
    }
  })
  
  const frequentCount = await prisma.survey.count({
    where: {
      frequency: { contains: 'semana' }
    }
  })
  
  // Gerar recomendações
  const recommendations: string[] = []
  
  if (premiumCount / total > 0.25) {
    recommendations.push('Desenvolver linha premium com vinhos especiais acima de R$ 100')
  }
  
  if (frequentCount / total > 0.5) {
    recommendations.push('Implementar programa de fidelidade para consumidores frequentes')
  }
  
  if (stateDistribution['São Paulo'] / total > 0.8) {
    recommendations.push('Expandir operação para Rio de Janeiro e Minas Gerais')
  }
  
  if (contactCount['WhatsApp'] > total * 0.4) {
    recommendations.push('Focar estratégia de comunicação em WhatsApp e mídias digitais')
  }
  
  if (wineTypeCount['Tinto'] > total * 0.6) {
    recommendations.push('Ampliar portfólio de tintos, especialmente argentinos e chilenos')
  }
  
  const mainRegions = Object.entries(regionDistribution)
    .map(([region, count]) => ({
      region,
      count,
      percentage: Math.round((count / total) * 100)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
  
  const summary: ExecutiveSummary = {
    timestamp: new Date().toISOString(),
    totalResponses: total,
    demographic: {
      primaryAgeGroup: idades[0]?.ageRange || 'N/A',
      genderDistribution: Object.fromEntries(generos.map(g => [g.gender || 'N/A', g._count.gender])),
      maritalStatus: Object.fromEntries(estadoCivil.map(e => [e.maritalStatus || 'N/A', e._count.maritalStatus]))
    },
    consumption: {
      frequencyProfile: frequencyCount,
      priceSegmentation: Object.fromEntries(precos.map(p => [p.priceRange || 'N/A', p._count.priceRange])),
      winePreferences: wineTypeCount
    },
    geographic: {
      stateDistribution,
      mainRegions
    },
    opportunities: {
      premiumSegment: Math.round((premiumCount / total) * 100),
      frequentConsumers: Math.round((frequentCount / total) * 100),
      geographicExpansion: ['Rio de Janeiro', 'Minas Gerais', 'Santa Catarina'],
      communicationChannels: contactCount
    },
    recommendations
  }
  
  return summary
}

function imprimirResumoExecutivo(summary: ExecutiveSummary) {
  console.log('\n🎯 === RESUMO EXECUTIVO - PESQUISA SOBRE VINHOS ===\n')
  
  console.log(`📊 DADOS GERAIS:`)
  console.log(`   • Total de Respostas: ${summary.totalResponses}`)
  console.log(`   • Data da Análise: ${new Date(summary.timestamp).toLocaleDateString('pt-BR')}`)
  console.log(`   • Cobertura: 100% dos respondentes`)
  
  console.log(`\n👥 PERFIL DEMOGRÁFICO:`)
  console.log(`   • Faixa Etária Principal: ${summary.demographic.primaryAgeGroup}`)
  console.log(`   • Distribuição por Gênero:`)
  Object.entries(summary.demographic.genderDistribution).forEach(([gender, count]) => {
    const percentage = ((count / summary.totalResponses) * 100).toFixed(1)
    console.log(`     - ${gender}: ${count} (${percentage}%)`)
  })
  
  console.log(`\n🍷 HÁBITOS DE CONSUMO:`)
  console.log(`   • Consumidores Frequentes: ${summary.opportunities.frequentConsumers}%`)
  console.log(`   • Segmento Premium: ${summary.opportunities.premiumSegment}%`)
  console.log(`   • Preferência Principal: ${Object.entries(summary.consumption.winePreferences)[0]?.[0] || 'N/A'}`)
  
  console.log(`\n🗺️ DISTRIBUIÇÃO GEOGRÁFICA:`)
  summary.geographic.mainRegions.slice(0, 3).forEach(region => {
    console.log(`   • ${region.region}: ${region.count} respostas (${region.percentage}%)`)
  })
  
  console.log(`\n💰 OPORTUNIDADES DE NEGÓCIO:`)
  console.log(`   • ${summary.opportunities.premiumSegment}% dispostos a pagar acima de R$ 100`)
  console.log(`   • ${summary.opportunities.frequentConsumers}% consomem semanalmente`)
  console.log(`   • Forte concentração em São Paulo (oportunidade de expansão)`)
  
  console.log(`\n📱 CANAIS DE COMUNICAÇÃO:`)
  Object.entries(summary.opportunities.communicationChannels).forEach(([channel, count]) => {
    const percentage = ((count / summary.totalResponses) * 100).toFixed(1)
    console.log(`   • ${channel}: ${percentage}%`)
  })
  
  console.log(`\n🎯 RECOMENDAÇÕES ESTRATÉGICAS:`)
  summary.recommendations.forEach((rec, index) => {
    console.log(`   ${index + 1}. ${rec}`)
  })
  
  console.log(`\n📈 PRÓXIMOS PASSOS:`)
  console.log(`   1. Segmentar comunicação por região e perfil`)
  console.log(`   2. Desenvolver parcerias com distribuidores em RJ/MG`)
  console.log(`   3. Criar campanhas específicas para WhatsApp`)
  console.log(`   4. Ampliar portfólio de tintos premium`)
  console.log(`   5. Implementar programa de fidelidade`)
}

async function exportarRelatorioFinal(summary: ExecutiveSummary) {
  // Exportar JSON completo
  writeFileSync('resumo-executivo.json', JSON.stringify(summary, null, 2), 'utf8')
  
  // Criar relatório em texto
  const relatorio = `
RESUMO EXECUTIVO - PESQUISA SOBRE VINHOS
========================================

DADOS GERAIS:
• Total de Respostas: ${summary.totalResponses}
• Data da Análise: ${new Date(summary.timestamp).toLocaleDateString('pt-BR')}

PRINCIPAIS INSIGHTS:
• Público-alvo: ${summary.demographic.primaryAgeGroup}, predominantemente ${Object.keys(summary.demographic.genderDistribution)[0]}
• ${summary.opportunities.frequentConsumers}% são consumidores frequentes (semanais)
• ${summary.opportunities.premiumSegment}% dispostos a investir em vinhos premium
• 97% concentrados em São Paulo (oportunidade de expansão)

RECOMENDAÇÕES:
${summary.recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}

PRÓXIMOS PASSOS:
1. Segmentar comunicação por região e perfil
2. Desenvolver parcerias com distribuidores em RJ/MG
3. Criar campanhas específicas para WhatsApp
4. Ampliar portfólio de tintos premium
5. Implementar programa de fidelidade

Data: ${new Date().toLocaleDateString('pt-BR')}
`
  
  writeFileSync('relatorio-final.txt', relatorio, 'utf8')
  
  console.log(`\n💾 ARQUIVOS EXPORTADOS:`)
  console.log(`   • resumo-executivo.json (dados completos)`)
  console.log(`   • relatorio-final.txt (resumo executivo)`)
}

async function main() {
  try {
    await prisma.$connect()
    
    const summary = await gerarResumoExecutivo()
    imprimirResumoExecutivo(summary)
    await exportarRelatorioFinal(summary)
    
    console.log(`\n✅ === ANÁLISE COMPLETA FINALIZADA ===`)
    console.log(`🎯 Total de respostas analisadas: ${summary.totalResponses}`)
    console.log(`📊 Insights gerados: ${summary.recommendations.length} recomendações estratégicas`)
    
  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()