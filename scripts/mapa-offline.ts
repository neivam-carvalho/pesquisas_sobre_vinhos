#!/usr/bin/env tsx
/**
 * 🗺️ Georeferenciamento Offline - Mapa com Base Local de CEPs
 * 
 * Script que usa mapeamento local de CEPs para gerar coordenadas aproximadas
 */

import { PrismaClient } from '@prisma/client'
import { writeFileSync } from 'fs'

const prisma = new PrismaClient()

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

// Base de dados local de CEPs com coordenadas aproximadas
const COORDENADAS_CEP: Record<string, {
  latitude: number
  longitude: number
  cidade: string
  bairro: string
  uf: string
}> = {
  // São Paulo - Centro
  '01': { latitude: -23.5489, longitude: -46.6388, cidade: 'São Paulo', bairro: 'Centro', uf: 'SP' },
  
  // São Paulo - Zona Norte
  '02': { latitude: -23.4814, longitude: -46.6339, cidade: 'São Paulo', bairro: 'Zona Norte', uf: 'SP' },
  
  // São Paulo - Zona Leste
  '03': { latitude: -23.5606, longitude: -46.5634, cidade: 'São Paulo', bairro: 'Zona Leste', uf: 'SP' },
  
  // São Paulo - Zona Sul
  '04': { latitude: -23.6158, longitude: -46.6565, cidade: 'São Paulo', bairro: 'Zona Sul', uf: 'SP' },
  
  // São Paulo - Zona Oeste
  '05': { latitude: -23.5482, longitude: -46.7362, cidade: 'São Paulo', bairro: 'Zona Oeste', uf: 'SP' },
  
  // Osasco
  '06': { latitude: -23.5329, longitude: -46.7920, cidade: 'Osasco', bairro: 'Centro', uf: 'SP' },
  
  // Grande São Paulo - Zona Leste
  '08': { latitude: -23.5475, longitude: -46.4563, cidade: 'São Paulo', bairro: 'Grande SP Leste', uf: 'SP' },
  
  // Grande ABC
  '09': { latitude: -23.6819, longitude: -46.5653, cidade: 'Santo André', bairro: 'Grande ABC', uf: 'SP' },
  
  // Campinas região
  '13': { latitude: -22.9056, longitude: -47.0608, cidade: 'Campinas', bairro: 'Centro', uf: 'SP' },
  
  // Bauru região
  '14': { latitude: -22.3208, longitude: -49.0767, cidade: 'Bauru', bairro: 'Centro', uf: 'SP' },
  
  // Sorocaba região
  '15': { latitude: -23.5015, longitude: -47.4526, cidade: 'Sorocaba', bairro: 'Centro', uf: 'SP' },
  
  // Ribeirão Preto região
  '16': { latitude: -21.1699, longitude: -47.8099, cidade: 'Ribeirão Preto', bairro: 'Centro', uf: 'SP' },
  
  // São José do Rio Preto região
  '17': { latitude: -20.8197, longitude: -49.3794, cidade: 'São José do Rio Preto', bairro: 'Centro', uf: 'SP' },
  
  // Presidente Prudente região
  '18': { latitude: -22.1256, longitude: -51.3895, cidade: 'Presidente Prudente', bairro: 'Centro', uf: 'SP' },
  
  // Americana região
  '19': { latitude: -22.7391, longitude: -47.3313, cidade: 'Americana', bairro: 'Centro', uf: 'SP' },
  
  // Rio de Janeiro - Centro
  '20': { latitude: -22.9068, longitude: -43.1729, cidade: 'Rio de Janeiro', bairro: 'Centro', uf: 'RJ' },
  
  // Rio de Janeiro - Zona Norte
  '21': { latitude: -22.8747, longitude: -43.2436, cidade: 'Rio de Janeiro', bairro: 'Zona Norte', uf: 'RJ' },
  
  // Rio de Janeiro - Zona Sul/Oeste
  '22': { latitude: -22.9711, longitude: -43.1882, cidade: 'Rio de Janeiro', bairro: 'Zona Sul', uf: 'RJ' },
  
  // Rio de Janeiro - Baixada
  '23': { latitude: -22.7635, longitude: -43.4536, cidade: 'Nova Iguaçu', bairro: 'Baixada Fluminense', uf: 'RJ' },
  
  // Niterói
  '24': { latitude: -22.8833, longitude: -43.1036, cidade: 'Niterói', bairro: 'Centro', uf: 'RJ' },
  
  // Belo Horizonte
  '30': { latitude: -19.9191, longitude: -43.9386, cidade: 'Belo Horizonte', bairro: 'Centro', uf: 'MG' },
  
  // BH Metropolitana
  '31': { latitude: -19.8157, longitude: -43.9542, cidade: 'Contagem', bairro: 'Grande BH', uf: 'MG' },
  
  // MG Interior
  '32': { latitude: -20.4606, longitude: -45.2471, cidade: 'Divinópolis', bairro: 'Interior de MG', uf: 'MG' }
}

function obterCoordenadasPorCEP(cep: string): {
  latitude: number
  longitude: number
  cidade: string
  bairro: string
  uf: string
} | null {
  const cepLimpo = cep.replace(/\D/g, '')
  
  if (cepLimpo.length < 2) {
    return null
  }
  
  // Buscar pelos primeiros 2 dígitos
  const prefixo = cepLimpo.substring(0, 2)
  const coordenadas = COORDENADAS_CEP[prefixo]
  
  if (coordenadas) {
    // Adicionar pequena variação para evitar sobreposição exata
    const variacao = 0.02 // ~2km de variação
    const randomLat = (Math.random() - 0.5) * variacao
    const randomLng = (Math.random() - 0.5) * variacao
    
    return {
      latitude: coordenadas.latitude + randomLat,
      longitude: coordenadas.longitude + randomLng,
      cidade: coordenadas.cidade,
      bairro: coordenadas.bairro,
      uf: coordenadas.uf
    }
  }
  
  return null
}

async function obterDadosGeograficos(): Promise<RespondenteMapa[]> {
  console.log('🗺️ === INICIANDO GEOREFERENCIAMENTO OFFLINE ===\n')
  
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
      const coordenadas = obterCoordenadasPorCEP(resposta.cep)
      
      if (coordenadas) {
        respondentesComCoordenadas.push({
          id: resposta.id,
          cep: resposta.cep,
          latitude: coordenadas.latitude,
          longitude: coordenadas.longitude,
          endereco: `${coordenadas.bairro}, ${coordenadas.cidade}`,
          cidade: coordenadas.cidade,
          uf: coordenadas.uf,
          ageRange: resposta.ageRange || undefined,
          gender: resposta.gender || undefined,
          frequency: resposta.frequency || undefined,
          priceRange: resposta.priceRange || undefined,
          wineType: resposta.wineType
        })
        sucessos++
        console.log(`✅ ${resposta.cep} → ${coordenadas.cidade}, ${coordenadas.uf}`)
      } else {
        console.log(`❌ CEP não mapeado: ${resposta.cep}`)
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
        <div style="min-width: 280px; font-family: 'Segoe UI', sans-serif;">
          <h3 style="margin: 0 0 12px 0; color: #722F37; border-bottom: 2px solid #722F37; padding-bottom: 8px;">
            📍 ${r.cidade}, ${r.uf}
          </h3>
          <div style="background: #f8f9fa; padding: 10px; border-radius: 6px; margin-bottom: 10px;">
            <p style="margin: 4px 0;"><strong>CEP:</strong> ${r.cep}</p>
            <p style="margin: 4px 0;"><strong>Região:</strong> ${r.endereco}</p>
          </div>
          
          <h4 style="margin: 8px 0 6px 0; color: #722F37; font-size: 14px;">👤 Perfil do Respondente</h4>
          <div style="background: #fff3cd; padding: 8px; border-radius: 4px; margin-bottom: 10px; font-size: 13px;">
            <p style="margin: 3px 0;"><strong>Idade:</strong> ${r.ageRange || 'Não informado'}</p>
            <p style="margin: 3px 0;"><strong>Gênero:</strong> ${r.gender || 'Não informado'}</p>
            <p style="margin: 3px 0;"><strong>Frequência:</strong> ${r.frequency || 'Não informado'}</p>
            <p style="margin: 3px 0;"><strong>Faixa de preço:</strong> ${r.priceRange || 'Não informado'}</p>
            <p style="margin: 3px 0;"><strong>Tipos preferidos:</strong> ${tiposVinho}</p>
          </div>
          
          <h4 style="margin: 8px 0 6px 0; color: #722F37; font-size: 14px;">📊 Estatísticas da Região</h4>
          <div style="background: #d1ecf1; padding: 8px; border-radius: 4px; font-size: 13px;">
            <p style="margin: 3px 0;"><strong>Total na região:</strong> ${stats.count} respondente${stats.count > 1 ? 's' : ''}</p>
            <p style="margin: 3px 0;"><strong>Consumidores premium:</strong> ${stats.premium} (${((stats.premium/stats.count)*100).toFixed(1)}%)</p>
            <p style="margin: 3px 0;"><strong>Consumidores frequentes:</strong> ${stats.frequentes} (${((stats.frequentes/stats.count)*100).toFixed(1)}%)</p>
            <p style="margin: 3px 0;"><strong>Gênero:</strong> ${stats.masculino}M / ${stats.feminino}F</p>
          </div>
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
    <title>🍷 Mapa de Respondentes - Pesquisa sobre Vinhos</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
        * { box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            min-height: 100vh;
        }
        .header {
            background: linear-gradient(135deg, #722F37, #8B4513);
            color: white;
            padding: 25px 20px;
            text-align: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            position: relative;
            overflow: hidden;
        }
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="2" fill="white" opacity="0.1"/><circle cx="80" cy="40" r="1.5" fill="white" opacity="0.1"/><circle cx="40" cy="80" r="1" fill="white" opacity="0.1"/></svg>');
        }
        .header h1 {
            margin: 0;
            font-size: 2.8em;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            position: relative;
            z-index: 1;
        }
        .header p {
            margin: 15px 0 0 0;
            font-size: 1.3em;
            opacity: 0.95;
            position: relative;
            z-index: 1;
        }
        .stats-container {
            background: white;
            margin: 0;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .stats-bar {
            padding: 20px;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            max-width: 1200px;
            margin: 0 auto;
        }
        .stat-item {
            text-align: center;
            padding: 20px;
            background: linear-gradient(145deg, #ffffff, #f8f9fa);
            border-radius: 12px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.08);
            transition: transform 0.3s ease;
        }
        .stat-item:hover {
            transform: translateY(-2px);
        }
        .stat-number {
            font-size: 2.5em;
            font-weight: bold;
            color: #722F37;
            display: block;
            margin-bottom: 8px;
        }
        .stat-label {
            color: #666;
            font-size: 1em;
            font-weight: 500;
        }
        .map-container {
            position: relative;
            height: 70vh;
            margin: 0;
            box-shadow: inset 0 4px 8px rgba(0,0,0,0.1);
        }
        #map {
            height: 100%;
            width: 100%;
        }
        .footer {
            background: linear-gradient(135deg, #722F37, #8B4513);
            color: white;
            text-align: center;
            padding: 20px;
            margin-top: 0;
        }
        .footer p {
            margin: 5px 0;
            opacity: 0.9;
        }
        .leaflet-popup-content {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.4;
        }
        .custom-marker {
            border-radius: 50% !important;
            border: 3px solid white !important;
            box-shadow: 0 3px 8px rgba(0,0,0,0.3) !important;
            transition: transform 0.2s ease;
        }
        .custom-marker:hover {
            transform: scale(1.1);
        }
        @media (max-width: 768px) {
            .header h1 { font-size: 2.2em; }
            .header p { font-size: 1.1em; }
            .stats-bar { grid-template-columns: repeat(2, 1fr); gap: 15px; padding: 15px; }
            .map-container { height: 60vh; }
            .stat-item { padding: 15px; }
            .stat-number { font-size: 2em; }
        }
        @media (max-width: 480px) {
            .stats-bar { grid-template-columns: 1fr; }
            .header { padding: 20px 15px; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🍷 Mapa de Respondentes</h1>
        <p>Pesquisa sobre Vinhos e Espumantes - Distribuição Geográfica Interativa</p>
    </div>
    
    <div class="stats-container">
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
    </div>

    <div class="map-container">
        <div id="map"></div>
    </div>

    <div class="footer">
        <p>📍 <strong>Mapa gerado em ${new Date().toLocaleDateString('pt-BR', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</strong></p>
        <p>🎯 ${respondentes.length} respondentes mapeados com coordenadas aproximadas por região</p>
        <p>🍷 Pesquisa sobre Vinhos e Espumantes - Sistema de Georeferenciamento Local</p>
    </div>

    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
        // Inicializar mapa com visual aprimorado
        const map = L.map('map', {
            zoomControl: true,
            attributionControl: true
        }).setView([${centroLatitude}, ${centroLongitude}], 6);

        // Adicionar camada de tiles com melhor visual
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18,
            tileSize: 256,
            zoomOffset: 0
        }).addTo(map);

        // Dados dos respondentes
        const respondentes = [${pontosMapa}];

        // Criar clusters por cidade para melhor visualização
        const cidadesClusters = {};
        respondentes.forEach(r => {
            const chave = Math.round(r.lat * 100) + ',' + Math.round(r.lng * 100);
            if (!cidadesClusters[chave]) {
                cidadesClusters[chave] = [];
            }
            cidadesClusters[chave].push(r);
        });

        // Cores por quantidade de respondentes
        function obterCorMarcador(quantidade) {
            if (quantidade >= 20) return '#8B0000';
            if (quantidade >= 10) return '#A0522D';
            if (quantidade >= 5) return '#CD853F';
            if (quantidade >= 3) return '#D2691E';
            return '#722F37';
        }

        // Adicionar marcadores com animação
        Object.values(cidadesClusters).forEach((cluster, index) => {
            setTimeout(() => {
                const ponto = cluster[0];
                const quantidade = cluster.length;
                const cor = obterCorMarcador(quantidade);
                const tamanho = Math.min(50, 25 + quantidade * 2);
                
                // Criar ícone personalizado com gradiente
                const icone = L.divIcon({
                    html: \`<div style="
                        background: linear-gradient(145deg, \${cor}, #333);
                        color: white;
                        border-radius: 50%;
                        width: \${tamanho}px;
                        height: \${tamanho}px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: bold;
                        border: 4px solid white;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                        font-size: \${quantidade >= 10 ? '16' : '14'}px;
                        transition: all 0.3s ease;
                        cursor: pointer;
                    " onmouseover="this.style.transform='scale(1.1)'" 
                       onmouseout="this.style.transform='scale(1)'">\${quantidade}</div>\`,
                    className: 'custom-marker',
                    iconSize: [tamanho, tamanho],
                    iconAnchor: [tamanho/2, tamanho/2]
                });

                // Adicionar marcador ao mapa com evento de clique
                const marker = L.marker([ponto.lat, ponto.lng], { icon: icone })
                    .addTo(map)
                    .bindPopup(ponto.popup, {
                        maxWidth: 350,
                        className: 'custom-popup',
                        closeButton: true,
                        autoPan: true,
                        keepInView: true
                    });

                // Adicionar efeito de bounce ao clicar
                marker.on('click', function() {
                    this.setIcon(L.divIcon({
                        html: \`<div style="
                            background: linear-gradient(145deg, \${cor}, #333);
                            color: white;
                            border-radius: 50%;
                            width: \${tamanho}px;
                            height: \${tamanho}px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-weight: bold;
                            border: 4px solid white;
                            box-shadow: 0 6px 16px rgba(0,0,0,0.4);
                            font-size: \${quantidade >= 10 ? '16' : '14'}px;
                            animation: bounce 0.6s ease-in-out;
                        ">\${quantidade}</div>
                        <style>
                        @keyframes bounce {
                            0%, 100% { transform: scale(1); }
                            50% { transform: scale(1.2); }
                        }
                        </style>\`,
                        className: 'custom-marker',
                        iconSize: [tamanho, tamanho],
                        iconAnchor: [tamanho/2, tamanho/2]
                    }));
                });
                
            }, index * 100); // Animação escalonada
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

        // Adicionar controles personalizados
        L.control.scale({
            position: 'bottomleft',
            metric: true,
            imperial: false
        }).addTo(map);

        // Adicionar informações no canto superior direito
        const info = L.control({position: 'topright'});
        info.onAdd = function() {
            const div = L.DomUtil.create('div', 'info-box');
            div.style.cssText = \`
                background: rgba(255,255,255,0.95);
                padding: 12px;
                border-radius: 8px;
                box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                font-size: 13px;
                line-height: 1.4;
                max-width: 200px;
            \`;
            div.innerHTML = \`
                <h4 style="margin: 0 0 8px 0; color: #722F37;">📊 Legenda</h4>
                <p style="margin: 4px 0;"><strong>Círculos:</strong> Quantidade de respondentes</p>
                <p style="margin: 4px 0;"><strong>Cores:</strong></p>
                <div style="margin: 4px 0;">
                    <span style="display: inline-block; width: 12px; height: 12px; background: #8B0000; border-radius: 50%; margin-right: 6px;"></span>20+ respondentes
                </div>
                <div style="margin: 4px 0;">
                    <span style="display: inline-block; width: 12px; height: 12px; background: #A0522D; border-radius: 50%; margin-right: 6px;"></span>10-19 respondentes
                </div>
                <div style="margin: 4px 0;">
                    <span style="display: inline-block; width: 12px; height: 12px; background: #722F37; border-radius: 50%; margin-right: 6px;"></span>1-9 respondentes
                </div>
                <p style="margin: 8px 0 4px 0; font-size: 12px; color: #666;">Clique nos círculos para ver detalhes</p>
            \`;
            return div;
        };
        info.addTo(map);

        // Log para debug
        console.log('🗺️ Mapa carregado com', respondentes.length, 'respondentes');
        console.log('📍 Cidades mapeadas:', Object.keys(cidadesClusters).length);
    </script>
</body>
</html>`
}

async function exportarDadosGeoJSON(respondentes: RespondenteMapa[]) {
  const geoJSON = {
    type: "FeatureCollection",
    name: "Respondentes_Pesquisa_Vinhos",
    crs: {
      type: "name",
      properties: {
        name: "urn:ogc:def:crs:OGC:1.3:CRS84"
      }
    },
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
        ageRange: r.ageRange || null,
        gender: r.gender || null,
        frequency: r.frequency || null,
        priceRange: r.priceRange || null,
        wineType: r.wineType ? r.wineType.join(';') : null,
        coordinates: `${r.latitude},${r.longitude}`
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
    ).sort(([,a], [,b]) => b - a).slice(0, 10),
    
    // Análise de densidade
    densidadeAlta: Object.entries(
      respondentes.reduce((acc, r) => {
        const chave = `${r.cidade}, ${r.uf}`
        acc[chave] = (acc[chave] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    ).filter(([,count]) => count >= 5)
  }

  console.log('\n🗺️ === RELATÓRIO GEOGRÁFICO DETALHADO ===')
  console.log(`📍 Total de pontos mapeados: ${estatisticas.totalPontos}`)
  console.log(`🏙️ Cidades únicas: ${estatisticas.cidadesUnicas}`)
  console.log(`🗺️ Estados únicos: ${estatisticas.estadosUnicos}`)
  
  console.log('\n📊 Distribuição por Estado:')
  Object.entries(estatisticas.porEstado)
    .sort(([,a], [,b]) => b - a)
    .forEach(([estado, count]) => {
      const porcentagem = ((count / estatisticas.totalPontos) * 100).toFixed(1)
      console.log(`  ${estado}: ${count} respondentes (${porcentagem}%)`)
    })
  
  console.log('\n🏙️ Top 10 Cidades com Mais Respondentes:')
  estatisticas.porCidade.forEach(([cidade, count], index) => {
    const porcentagem = ((count / estatisticas.totalPontos) * 100).toFixed(1)
    const emoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '📍'
    console.log(`  ${emoji} ${cidade}: ${count} respondentes (${porcentagem}%)`)
  })

  if (estatisticas.densidadeAlta.length > 0) {
    console.log('\n🎯 Regiões de Alta Densidade (5+ respondentes):')
    estatisticas.densidadeAlta
      .sort(([,a], [,b]) => b - a)
      .forEach(([cidade, count]) => {
        console.log(`  🔥 ${cidade}: ${count} respondentes - POTENCIAL PARA EVENTOS LOCAIS`)
      })
  }

  // Análise de oportunidades
  console.log('\n💡 Insights Geográficos:')
  const spConcentracao = (estatisticas.porEstado['SP'] || 0) / estatisticas.totalPontos
  if (spConcentracao > 0.8) {
    console.log(`  🎯 Forte concentração em São Paulo (${(spConcentracao * 100).toFixed(1)}%) - oportunidade de expansão`)
  }
  
  if (estatisticas.densidadeAlta.length > 0) {
    console.log(`  📍 ${estatisticas.densidadeAlta.length} cidades com densidade alta - focar em eventos locais`)
  }
  
  if (estatisticas.cidadesUnicas >= 10) {
    console.log(`  🌐 Boa distribuição geográfica (${estatisticas.cidadesUnicas} cidades) - base sólida para expansão`)
  }

  return estatisticas
}

async function main() {
  console.log('🗺️ === GEOREFERENCIAMENTO LOCAL DE RESPONDENTES ===\n')
  
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
      metodo: 'georeferenciamento_local',
      base_dados: 'coordenadas_aproximadas_por_cep',
      respondentes: respondentes.map(r => ({
        ...r,
        coordenadas_aproximadas: true
      }))
    }
    writeFileSync('coordenadas-respondentes.json', JSON.stringify(dadosCompletos, null, 2), 'utf8')
    console.log('✅ Dados de coordenadas salvos: coordenadas-respondentes.json')
    
    console.log('\n🎉 === GEOREFERENCIAMENTO CONCLUÍDO COM SUCESSO ===')
    console.log(`📍 ${respondentes.length} respondentes mapeados com coordenadas aproximadas`)
    console.log(`🎯 ${Object.keys(COORDENADAS_CEP).length} regiões de CEP suportadas`)
    console.log('\n📂 Arquivos gerados:')
    console.log('  🗺️ mapa-respondentes.html - Mapa interativo (abra no navegador)')
    console.log('  📊 respondentes-georeferenciados.geojson - Dados para GIS')
    console.log('  📋 coordenadas-respondentes.json - Dados completos')
    
  } catch (error) {
    console.error('❌ Erro durante o georeferenciamento:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()