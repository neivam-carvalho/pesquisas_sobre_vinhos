#!/usr/bin/env tsx
/**
 * 🚀 Deploy Automático - Vercel
 * 
 * Script para fazer deploy das mudanças incluindo o novo favicon
 */

import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

async function deployToVercel() {
  console.log('🚀 === DEPLOY PARA VERCEL ===\n')
  
  try {
    console.log('📦 1. Fazendo build da aplicação...')
    await execAsync('npm run build')
    console.log('✅ Build concluído com sucesso!')
    
    console.log('\n🔍 2. Verificando arquivos de favicon...')
    
    const { stdout: files } = await execAsync('ls -la public/favicon* public/icon* public/apple* public/manifest.json')
    console.log('📁 Arquivos encontrados:')
    console.log(files)
    
    console.log('\n🌐 3. Fazendo commit das mudanças...')
    await execAsync('git add .')
    await execAsync('git commit -m "🍷 Atualizar favicon para taça de vinho personalizada"')
    console.log('✅ Commit realizado!')
    
    console.log('\n🚀 4. Fazendo push para GitHub...')
    await execAsync('git push origin main')
    console.log('✅ Push realizado!')
    
    console.log('\n🎉 === DEPLOY CONCLUÍDO ===')
    console.log('📍 O Vercel irá detectar automaticamente as mudanças e fazer o deploy')
    console.log('🍷 O novo favicon (taça de vinho) será aplicado em alguns minutos')
    console.log('🔗 Verifique em: https://pesquisas-sobre-vinhos.vercel.app/')
    
    console.log('\n📋 Mudanças aplicadas:')
    console.log('  🍷 Favicon personalizado (taça de vinho)')
    console.log('  📱 Ícones para iOS/Android (PWA ready)')
    console.log('  🌐 Manifest.json para instalação como app')
    console.log('  📄 Meta tags atualizadas')
    console.log('  🎯 Título com emoji 🍷')
    
  } catch (error) {
    console.error('❌ Erro durante o deploy:', error)
    console.log('\n🔧 Para fazer deploy manual:')
    console.log('1. git add .')
    console.log('2. git commit -m "Atualizar favicon"')
    console.log('3. git push origin main')
  }
}

deployToVercel()