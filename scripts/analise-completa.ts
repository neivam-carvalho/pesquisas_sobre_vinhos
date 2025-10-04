#!/usr/bin/env tsx
/**
 * 🚀 Análise Completa - Executa Todas as Análises
 * 
 * Script que executa todas as análises em sequência e gera um resumo final
 */

import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

async function executarComando(comando: string, descricao: string) {
  console.log(`\n🔄 ${descricao}...`)
  console.log(`⚡ Executando: ${comando}`)
  
  try {
    const { stdout, stderr } = await execAsync(comando)
    
    if (stderr) {
      console.log(`⚠️  Avisos: ${stderr}`)
    }
    
    // Mostrar apenas as linhas mais importantes da saída
    const linhasImportantes = stdout
      .split('\n')
      .filter(linha => 
        linha.includes('===') || 
        linha.includes('Total') || 
        linha.includes('📊') ||
        linha.includes('✅') ||
        linha.includes('💾')
      )
      .slice(-5) // Últimas 5 linhas importantes
    
    linhasImportantes.forEach(linha => {
      if (linha.trim()) console.log(`   ${linha}`)
    })
    
    console.log(`✅ ${descricao} concluída!`)
    
  } catch (error) {
    console.error(`❌ Erro em ${descricao}:`, error)
    throw error
  }
}

async function gerarResumoFinal() {
  const timestamp = new Date().toLocaleString('pt-BR')
  
  console.log(`
🎉 ============================================
   ANÁLISE COMPLETA FINALIZADA COM SUCESSO!
============================================

📊 ANÁLISES EXECUTADAS:
   ✅ Análise Básica dos Dados
   ✅ Relatório Avançado com Segmentação
   ✅ Análise Geográfica Regional
   ✅ Resumo Executivo Consolidado

📁 ARQUIVOS GERADOS:
   📄 relatorio-vinhos.csv
   📄 resumo-analise.json
   📄 resumo-executivo.json
   📄 relatorio-final.txt

🎯 PRÓXIMOS PASSOS:
   1. Revisar os relatórios gerados
   2. Implementar as recomendações estratégicas
   3. Monitorar novas respostas da pesquisa
   4. Executar análises periodicamente

⏰ Análise realizada em: ${timestamp}

📖 Para mais detalhes, consulte: ANALISE.md
`)
}

async function main() {
  console.log(`
🚀 =============================================
   INICIANDO ANÁLISE COMPLETA DOS DADOS
=============================================

Este script executará todas as análises disponíveis:
• Análise básica dos dados coletados
• Relatório avançado com segmentação
• Análise geográfica por região
• Resumo executivo consolidado
`)

  const inicioTempo = Date.now()

  try {
    // Executar todas as análises em sequência
    await executarComando('npm run analise', 'Análise Básica')
    await executarComando('npm run relatorio', 'Relatório Avançado')
    await executarComando('npm run geografia', 'Análise Geográfica')
    await executarComando('npm run executivo', 'Resumo Executivo')

    const tempoTotal = ((Date.now() - inicioTempo) / 1000).toFixed(1)
    
    await gerarResumoFinal()
    
    console.log(`⚡ Tempo total de execução: ${tempoTotal}s`)
    console.log(`🎯 Todas as análises foram concluídas com sucesso!`)

  } catch (error) {
    console.error(`
❌ ============================================
   ERRO DURANTE A EXECUÇÃO DAS ANÁLISES
============================================

${error}

🔧 SOLUÇÕES POSSÍVEIS:
   1. Verificar se o banco de dados está acessível
   2. Confirmar se as dependências estão instaladas (npm install)
   3. Verificar as variáveis de ambiente (.env)
   4. Executar cada análise individualmente para identificar o problema

📞 Para suporte, consulte a documentação do projeto.
`)
    process.exit(1)
  }
}

main()