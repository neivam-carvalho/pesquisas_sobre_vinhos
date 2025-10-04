#!/usr/bin/env tsx
/**
 * 🍷 Gerador de Favicon - Taça de Vinho
 * 
 * Script para converter SVG em favicon.ico
 */

import sharp from 'sharp'
import { writeFileSync, readFileSync } from 'fs'

async function gerarFavicon() {
  console.log('🍷 === GERANDO FAVICON PERSONALIZADO ===\n')
  
  try {
    // Ler o SVG
    const svgBuffer = readFileSync('public/favicon.svg')
    
    // Gerar favicon.ico (32x32)
    const faviconBuffer = await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toBuffer()
    
    // Gerar apple-touch-icon (180x180)
    const appleTouchBuffer = await sharp(svgBuffer)
      .resize(180, 180)
      .png()
      .toBuffer()
    
    // Gerar icon-192x192
    const icon192Buffer = await sharp(svgBuffer)
      .resize(192, 192)
      .png()
      .toBuffer()
    
    // Gerar icon-512x512
    const icon512Buffer = await sharp(svgBuffer)
      .resize(512, 512)
      .png()
      .toBuffer()
    
    // Salvar arquivos
    writeFileSync('public/favicon.ico', faviconBuffer)
    writeFileSync('public/apple-touch-icon.png', appleTouchBuffer)
    writeFileSync('public/icon-192x192.png', icon192Buffer)
    writeFileSync('public/icon-512x512.png', icon512Buffer)
    
    console.log('✅ Favicon gerado com sucesso!')
    console.log('📁 Arquivos criados:')
    console.log('  🔹 favicon.ico (32x32)')
    console.log('  🔹 apple-touch-icon.png (180x180)')
    console.log('  🔹 icon-192x192.png (192x192)')
    console.log('  🔹 icon-512x512.png (512x512)')
    console.log('  🔹 favicon.svg (vetor original)')
    
  } catch (error) {
    console.error('❌ Erro ao gerar favicon:', error)
  }
}

gerarFavicon()