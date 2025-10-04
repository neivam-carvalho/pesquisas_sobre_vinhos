#!/usr/bin/env tsx
/**
 * 🗺️ Georeferenciamento - Análise com Mapa Interativo
 * 
 * Script para gerar mapa com localização dos respondentes baseado no CEP
 */

import { PrismaClient } from '@prisma/client'
import axios from 'axios'
import { writeFileSync } from 'fs'

const prisma = new PrismaClient()

interface CoordenadasCEP {
  cep: string
  latitude?: number
  longitude?: number
  logradouro?: string
  bairro?: string
  localidade?: string
  uf?: string
  erro?: string
}

interface RespondenteMapa {
  id: string
  cep: string
  latitude: number
  longitude: number
  endereco: string
  cidade: string
  uf: string
  ageRange?: string
  gender?: string
  frequency?: string
  priceRange?: string
  wineType?: string[]
}

// Cache para evitar consultas repetidas à API
const cacheCoordinadas: Map<string, CoordenadasCEP> = new Map()

async function buscarCoordenadasCEP(cep: string): Promise<CoordenadasCEP> {
  // Verificar cache primeiro
  if (cacheCoordinadas.has(cep)) {
    return cacheCoordinadas.get(cep)!
  }

  const cepLimpo = cep.replace(/\D/g, '')
  
  if (cepLimpo.length !== 8) {
    const resultado = { cep, erro: 'CEP inválido' }
    cacheCoordinadas.set(cep, resultado)
    return resultado
  }

  try {
    console.log(`🔍 Buscando coordenadas para CEP: ${cepLimpo}`)
    
    // Usar ViaCEP para obter dados do endereço
    const responseViaCEP = await axios.get(`https://viacep.com.br/ws/${cepLimpo}/json/`, {
      timeout: 5000
    })
    
    if (responseViaCEP.data.erro) {
      const resultado = { cep, erro: 'CEP não encontrado' }
      cacheCoordinadas.set(cep, resultado)
      return resultado
    }

    const dadosEndereco = responseViaCEP.data

    // Usar API do OpenStreetMap Nominatim para geocoding
    const enderecoCompleto = `${dadosEndereco.logradouro}, ${dadosEndereco.bairro}, ${dadosEndereco.localidade}, ${dadosEndereco.uf}, Brasil`
    
    await new Promise(resolve => setTimeout(resolve, 1000)) // Rate limit para Nominatim
    
    const responseGeo = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: enderecoCompleto,
        format: 'json',
        limit: 1,
        countrycodes: 'br'
      },
      headers: {
        'User-Agent': 'PesquisaVinhos/1.0 (contato@example.com)'
      },
      timeout: 10000
    })

    if (responseGeo.data && responseGeo.data.length > 0) {
      const coordenadas = responseGeo.data[0]
      const resultado: CoordenadasCEP = {
        cep,
        latitude: parseFloat(coordenadas.lat),
        longitude: parseFloat(coordenadas.lon),
        logradouro: dadosEndereco.logradouro,
        bairro: dadosEndereco.bairro,
        localidade: dadosEndereco.localidade,
        uf: dadosEndereco.uf
      }
      
      cacheCoordinadas.set(cep, resultado)
      console.log(`✅ Coordenadas encontradas: ${resultado.latitude}, ${resultado.longitude}`)
      return resultado
    } else {
      // Fallback: usar coordenadas aproximadas por cidade
      const cidadeResponse = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: `${dadosEndereco.localidade}, ${dadosEndereco.uf}, Brasil`,
          format: 'json',
          limit: 1,
          countrycodes: 'br'
        },
        headers: {
          'User-Agent': 'PesquisaVinhos/1.0 (contato@example.com)'
        },
        timeout: 10000
      })

      if (cidadeResponse.data && cidadeResponse.data.length > 0) {
        const coordenadas = cidadeResponse.data[0]
        const resultado: CoordenadasCEP = {
          cep,
          latitude: parseFloat(coordenadas.lat),
          longitude: parseFloat(coordenadas.lon),
          logradouro: 'Aproximado por cidade',
          bairro: dadosEndereco.bairro || '',
          localidade: dadosEndereco.localidade,
          uf: dadosEndereco.uf
        }
        
        cacheCoordinadas.set(cep, resultado)
        console.log(`⚠️ Coordenadas aproximadas por cidade: ${resultado.latitude}, ${resultado.longitude}`)
        return resultado
      }
    }

    const resultado = { cep, erro: 'Coordenadas não encontradas' }
    cacheCoordinadas.set(cep, resultado)
    return resultado

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    console.error(`❌ Erro ao buscar CEP ${cep}:`, errorMessage)
    const resultado = { cep, erro: `Erro na API: ${errorMessage}` }
    cacheCoordinadas.set(cep, resultado)
    return resultado
  }
}

async function obterDadosGeograficos(): Promise<RespondenteMapa[]> {
  console.log('🗺️ === INICIANDO GEOREFERENCIAMENTO ===\n')
  
  const respostas = await prisma.survey.findMany({
    select: {
      id: true,
      cep: true,
      ageRange: true,
      gender: true,
      frequency: true,
      priceRange: true,
      wineType: true
    },
    where: {
      cep: { not: null }
    }
  })

  console.log(`📍 Total de respostas com CEP: ${respostas.length}`)
  
  const respondentesComCoordenadas: RespondenteMapa[] = []
  let sucessos = 0
  let erros = 0

  for (const resposta of respostas) {
    if (resposta.cep) {
      const coordenadas = await buscarCoordenadasCEP(resposta.cep)
      
      if (coordenadas.latitude && coordenadas.longitude) {
        respondentesComCoordenadas.push({
          id: resposta.id,
          cep: resposta.cep,
          latitude: coordenadas.latitude,
          longitude: coordenadas.longitude,
          endereco: coordenadas.logradouro || 'Endereço não disponível',
          cidade: coordenadas.localidade || 'Cidade não disponível',
          uf: coordenadas.uf || '',
          ageRange: resposta.ageRange || undefined,
          gender: resposta.gender || undefined,
          frequency: resposta.frequency || undefined,
          priceRange: resposta.priceRange || undefined,
          wineType: resposta.wineType
        })
        sucessos++
      } else {
        console.log(`❌ Falha ao geocodificar CEP: ${resposta.cep} - ${coordenadas.erro}`)
        erros++
      }
    }
  }

  console.log(`\n📊 Resultados do Georeferenciamento:`)
  console.log(`✅ Sucessos: ${sucessos}`)
  console.log(`❌ Erros: ${erros}`)
  console.log(`📍 Total de pontos no mapa: ${respondentesComCoordenadas.length}`)

  return respondentesComCoordenadas
}

function gerarMapaHTML(respondentes: RespondenteMapa[]): string {
  const centroLatitude = -23.5505; // São Paulo como centro
  const centroLongitude = -46.6333;

interface CidadeStats {
  count: number
  premium: number
  frequentes: number
  masculino: number
  feminino: number
}

  // Calcular estatísticas por região
  const estatisticasPorCidade = respondentes.reduce((acc, r) => {
    const chave = `${r.cidade}, ${r.uf}`
    if (!acc[chave]) {
      acc[chave] = {
        count: 0,
        premium: 0,
        frequentes: 0,
        masculino: 0,
        feminino: 0
      }
    }
    acc[chave].count++
    if (r.priceRange?.includes('101') || r.priceRange?.includes('200')) acc[chave].premium++
    if (r.frequency?.includes('semana')) acc[chave].frequentes++
    if (r.gender === 'Masculino') acc[chave].masculino++
    if (r.gender === 'Feminino') acc[chave].feminino++
    return acc
  }, {} as Record<string, CidadeStats>)

  const pontosMapa = respondentes.map(r => {
    const tiposVinho = r.wineType ? r.wineType.join(', ') : 'Não informado'
    const stats = estatisticasPorCidade[`${r.cidade}, ${r.uf}`]
    
    return `
    {
      lat: ${r.latitude},
      lng: ${r.longitude},
      popup: \`
        <div style="min-width: 250px;">
          <h3 style="margin: 0 0 10px 0; color: #722F37;">📍 ${r.cidade}, ${r.uf}</h3>
          <p><strong>CEP:</strong> ${r.cep}</p>
          <p><strong>Endereço:</strong> ${r.endereco}</p>
          <hr style="margin: 10px 0;">
          <h4 style="margin: 5px 0; color: #722F37;">👤 Perfil do Respondente</h4>
          <p><strong>Idade:</strong> ${r.ageRange || 'Não informado'}</p>
          <p><strong>Gênero:</strong> ${r.gender || 'Não informado'}</p>
          <p><strong>Frequência:</strong> ${r.frequency || 'Não informado'}</p>
          <p><strong>Faixa de preço:</strong> ${r.priceRange || 'Não informado'}</p>
          <p><strong>Tipos preferidos:</strong> ${tiposVinho}</p>
          <hr style="margin: 10px 0;">
          <h4 style="margin: 5px 0; color: #722F37;">📊 Estatísticas da Região</h4>
          <p><strong>Total de respondentes:</strong> ${stats.count}</p>
          <p><strong>Consumidores premium:</strong> ${stats.premium} (${((stats.premium/stats.count)*100).toFixed(1)}%)</p>
          <p><strong>Consumidores frequentes:</strong> ${stats.frequentes} (${((stats.frequentes/stats.count)*100).toFixed(1)}%)</p>
          <p><strong>Distribuição por gênero:</strong> ${stats.masculino}M / ${stats.feminino}F</p>
        </div>
      \`
    }`
  }).join(',')

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mapa de Respondentes - Pesquisa sobre Vinhos</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f8f9fa;
        }
        .header {
            background: linear-gradient(135deg, #722F37, #8B4513);
            color: white;
            padding: 20px;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        .header p {
            margin: 10px 0 0 0;
            font-size: 1.2em;
            opacity: 0.9;
        }
        .stats-bar {
            background: white;
            padding: 15px;
            display: flex;
            justify-content: space-around;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            flex-wrap: wrap;
        }
        .stat-item {
            text-align: center;
            margin: 5px;
        }
        .stat-number {
            font-size: 2em;
            font-weight: bold;
            color: #722F37;
            display: block;
        }
        .stat-label {
            color: #666;
            font-size: 0.9em;
        }
        #map {
            height: 70vh;
            margin: 0;
        }
        .footer {
            background: #722F37;
            color: white;
            text-align: center;
            padding: 15px;
            margin-top: 0;
        }
        .leaflet-popup-content {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        @media (max-width: 768px) {
            .header h1 { font-size: 2em; }
            .header p { font-size: 1em; }
            #map { height: 60vh; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🍷 Mapa de Respondentes</h1>
        <p>Pesquisa sobre Vinhos e Espumantes - Distribuição Geográfica</p>
    </div>
    
    <div class="stats-bar">
        <div class="stat-item">
            <span class="stat-number">${respondentes.length}</span>
            <span class="stat-label">Respondentes Localizados</span>
        </div>
        <div class="stat-item">
            <span class="stat-number">${Object.keys(estatisticasPorCidade).length}</span>
            <span class="stat-label">Cidades Diferentes</span>
        </div>
        <div class="stat-item">
            <span class="stat-number">${respondentes.filter(r => r.priceRange?.includes('101') || r.priceRange?.includes('200')).length}</span>
            <span class="stat-label">Consumidores Premium</span>
        </div>
        <div class="stat-item">
            <span class="stat-number">${respondentes.filter(r => r.frequency?.includes('semana')).length}</span>
            <span class="stat-label">Consumidores Frequentes</span>
        </div>
    </div>

    <div id="map"></div>

    <div class="footer">
        <p>📍 Mapa gerado em ${new Date().toLocaleDateString('pt-BR')} | 🍷 Pesquisa sobre Vinhos</p>
        <p>Dados obtidos via ViaCEP e OpenStreetMap Nominatim</p>
    </div>

    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
        // Inicializar mapa
        const map = L.map('map').setView([${centroLatitude}, ${centroLongitude}], 6);

        // Adicionar camada de tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Dados dos respondentes
        const respondentes = [${pontosMapa}];

        // Criar clusters por cidade para melhor visualização
        const cidadesClusters = {};
        respondentes.forEach(r => {
            const chave = r.lat + ',' + r.lng;
            if (!cidadesClusters[chave]) {
                cidadesClusters[chave] = [];
            }
            cidadesClusters[chave].push(r);
        });

        // Adicionar marcadores
        Object.values(cidadesClusters).forEach(cluster => {
            const ponto = cluster[0];
            const quantidade = cluster.length;
            
            // Definir cor do marcador baseado na quantidade
            let cor = '#722F37';
            if (quantidade >= 10) cor = '#8B0000';
            else if (quantidade >= 5) cor = '#A0522D';
            else if (quantidade >= 3) cor = '#CD853F';
            
            // Criar ícone personalizado
            const icone = L.divIcon({
                html: \`<div style="
                    background-color: \${cor};
                    color: white;
                    border-radius: 50%;
                    width: \${Math.min(40, 20 + quantidade * 3)}px;
                    height: \${Math.min(40, 20 + quantidade * 3)}px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    border: 3px solid white;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    font-size: \${quantidade >= 10 ? '14' : '12'}px;
                ">\${quantidade}</div>\`,
                className: 'custom-marker',
                iconSize: [Math.min(40, 20 + quantidade * 3), Math.min(40, 20 + quantidade * 3)],
                iconAnchor: [Math.min(20, 10 + quantidade * 1.5), Math.min(20, 10 + quantidade * 1.5)]
            });

            // Adicionar marcador ao mapa
            L.marker([ponto.lat, ponto.lng], { icon: icone })
                .addTo(map)
                .bindPopup(ponto.popup, {
                    maxWidth: 350,
                    className: 'custom-popup'
                });
        });

        // Ajustar visualização para mostrar todos os pontos
        if (respondentes.length > 0) {
            const grupo = new L.featureGroup(
                Object.values(cidadesClusters).map(cluster => 
                    L.marker([cluster[0].lat, cluster[0].lng])
                )
            );
            map.fitBounds(grupo.getBounds().pad(0.1));
        }

        // Adicionar controles
        L.control.scale().addTo(map);
    </script>
</body>
</html>`
}

async function exportarDadosGeoJSON(respondentes: RespondenteMapa[]) {
  const geoJSON = {
    type: "FeatureCollection",
    features: respondentes.map(r => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [r.longitude, r.latitude]
      },
      properties: {
        id: r.id,
        cep: r.cep,
        endereco: r.endereco,
        cidade: r.cidade,
        uf: r.uf,
        ageRange: r.ageRange,
        gender: r.gender,
        frequency: r.frequency,
        priceRange: r.priceRange,
        wineType: r.wineType
      }
    }))
  }

  writeFileSync('respondentes-georeferenciados.geojson', JSON.stringify(geoJSON, null, 2), 'utf8')
  console.log('📁 Arquivo GeoJSON exportado: respondentes-georeferenciados.geojson')
}

async function gerarRelatorioGeografico(respondentes: RespondenteMapa[]) {
  const estatisticas = {
    totalPontos: respondentes.length,
    cidadesUnicas: new Set(respondentes.map(r => `${r.cidade}, ${r.uf}`)).size,
    estadosUnicos: new Set(respondentes.map(r => r.uf)).size,
    
    // Por estado
    porEstado: respondentes.reduce((acc, r) => {
      acc[r.uf] = (acc[r.uf] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    
    // Por cidade (top 10)
    porCidade: Object.entries(
      respondentes.reduce((acc, r) => {
        const chave = `${r.cidade}, ${r.uf}`
        acc[chave] = (acc[chave] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    ).sort(([,a], [,b]) => b - a).slice(0, 10)
  }

  console.log('\n🗺️ === RELATÓRIO GEOGRÁFICO ===')
  console.log(`📍 Total de pontos mapeados: ${estatisticas.totalPontos}`)
  console.log(`🏙️ Cidades únicas: ${estatisticas.cidadesUnicas}`)
  console.log(`🗺️ Estados únicos: ${estatisticas.estadosUnicos}`)
  
  console.log('\n📊 Distribuição por Estado:')
  Object.entries(estatisticas.porEstado)
    .sort(([,a], [,b]) => b - a)
    .forEach(([estado, count]) => {
      const porcentagem = ((count / estatisticas.totalPontos) * 100).toFixed(1)
      console.log(`  ${estado}: ${count} (${porcentagem}%)`)
    })
  
  console.log('\n🏙️ Top 10 Cidades:')
  estatisticas.porCidade.forEach(([cidade, count], index) => {
    const porcentagem = ((count / estatisticas.totalPontos) * 100).toFixed(1)
    console.log(`  ${index + 1}. ${cidade}: ${count} (${porcentagem}%)`)
  })

  return estatisticas
}

async function main() {
  console.log('🗺️ === GEOREFERENCIAMENTO DE RESPONDENTES ===\n')
  
  try {
    await prisma.$connect()
    
    // Obter dados geográficos
    const respondentes = await obterDadosGeograficos()
    
    if (respondentes.length === 0) {
      console.log('❌ Nenhum respondente foi georeferenciado com sucesso.')
      return
    }
    
    // Gerar relatório
    await gerarRelatorioGeografico(respondentes)
    
    // Gerar mapa HTML
    console.log('\n🗺️ Gerando mapa interativo...')
    const mapaHTML = gerarMapaHTML(respondentes)
    writeFileSync('mapa-respondentes.html', mapaHTML, 'utf8')
    console.log('✅ Mapa interativo gerado: mapa-respondentes.html')
    
    // Exportar GeoJSON
    await exportarDadosGeoJSON(respondentes)
    
    // Salvar dados de coordenadas
    const dadosCompletos = {
      timestamp: new Date().toISOString(),
      total: respondentes.length,
      respondentes: respondentes
    }
    writeFileSync('coordenadas-respondentes.json', JSON.stringify(dadosCompletos, null, 2), 'utf8')
    console.log('✅ Dados de coordenadas salvos: coordenadas-respondentes.json')
    
    console.log('\n🎉 === GEOREFERENCIAMENTO CONCLUÍDO ===')
    console.log(`📍 ${respondentes.length} respondentes mapeados com sucesso`)
    console.log('🔗 Abra o arquivo "mapa-respondentes.html" no navegador para visualizar o mapa')
    
  } catch (error) {
    console.error('❌ Erro durante o georeferenciamento:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()