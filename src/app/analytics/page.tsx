'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Users, TrendingUp, Wine } from 'lucide-react'

interface SurveyStats {
  total: number
  wineTypeStats: Array<{
    type: string
    count: number
  }>
}

interface Survey {
  id: string
  createdAt: string
  name: string
  email: string
  wineType: string
  frequency: string
  priceRange: string
  preferredOrigins: string[]
  purchaseChannels: string[]
}

export default function AnalyticsPage() {
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [stats, setStats] = useState<SurveyStats>({ total: 0, wineTypeStats: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSurveyData()
  }, [])

  const fetchSurveyData = async () => {
    try {
      const response = await fetch('/api/survey')
      if (response.ok) {
        const data = await response.json()
        setSurveys(data.surveys)
        setStats(data.analytics)
      }
    } catch (error) {
      console.error('Error fetching survey data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getChannelsStats = () => {
    const allChannels: string[] = []
    surveys.forEach(survey => {
      if (survey.purchaseChannels) {
        allChannels.push(...survey.purchaseChannels)
      }
    })

    const channelCounts = allChannels.reduce((acc, channel) => {
      acc[channel] = (acc[channel] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(channelCounts)
      .map(([channel, count]) => ({ channel, count }))
      .sort((a, b) => b.count - a.count)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  const channelsStats = getChannelsStats()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Wine size={60} className="mx-auto text-purple-600 mb-4" />
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Análise da Pesquisa sobre Vinhos
          </h1>
          <p className="text-xl text-gray-600">
            Insights e estatísticas dos dados coletados
          </p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <Users size={40} className="mx-auto text-blue-600 mb-3" />
            <h3 className="text-2xl font-bold text-gray-800 mb-1">
              {stats.total}
            </h3>
            <p className="text-gray-600">Respostas coletadas</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <BarChart size={40} className="mx-auto text-green-600 mb-3" />
            <h3 className="text-2xl font-bold text-gray-800 mb-1">
              {stats.wineTypeStats.length}
            </h3>
            <p className="text-gray-600">Tipos de vinho mencionados</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <TrendingUp size={40} className="mx-auto text-purple-600 mb-3" />
            <h3 className="text-2xl font-bold text-gray-800 mb-1">
              {channelsStats.length}
            </h3>
            <p className="text-gray-600">Canais de compra únicos</p>
          </div>
        </motion.div>

        {/* Wine Type Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-lg p-6 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Preferências de Tipos de Vinho
          </h2>
          
          {stats.wineTypeStats.length > 0 ? (
            <div className="space-y-4">
              {stats.wineTypeStats.map((stat, index) => (
                <motion.div
                  key={stat.type}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-center justify-between"
                >
                  <span className="text-gray-700 font-medium">{stat.type}</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-gray-200 rounded-full h-3">
                      <motion.div
                        className="bg-purple-600 h-3 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(stat.count / stats.total) * 100}%` }}
                        transition={{ delay: 0.3 + (0.1 * index), duration: 0.8 }}
                      />
                    </div>
                    <span className="text-gray-600 font-medium min-w-[40px]">
                      {stat.count}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Nenhum dado disponível ainda.</p>
          )}
        </motion.div>

        {/* Valued Characteristics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-lg p-6 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Canais de Compra Preferidos
          </h2>
          
          {channelsStats.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {channelsStats.slice(0, 8).map((stat: { channel: string; count: number }, index: number) => (
                <motion.div
                  key={stat.channel}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-center justify-between p-3 bg-purple-50 rounded-lg"
                >
                  <span className="text-gray-700 font-medium">
                    {stat.channel}
                  </span>
                  <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {stat.count}
                  </span>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Nenhum dado disponível ainda.</p>
          )}
        </motion.div>

        {/* Recent Responses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Respostas Recentes
          </h2>
          
          {surveys.length > 0 ? (
            <div className="space-y-6">
              {surveys.slice(0, 5).map((survey, index) => (
                <motion.div
                  key={survey.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="border-l-4 border-purple-500 pl-4 py-2"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-800">
                      {survey.wineType || 'Tipo não informado'}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {formatDate(survey.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                    {survey.name || 'Nome não informado'} - {survey.frequency || 'Frequência não informada'}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {survey.purchaseChannels?.slice(0, 3).map((channel: string, chanIndex: number) => (
                      <span
                        key={chanIndex}
                        className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded"
                      >
                        {channel}
                      </span>
                    ))}
                    {survey.purchaseChannels && survey.purchaseChannels.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{survey.purchaseChannels.length - 3} mais
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Nenhuma resposta disponível ainda.</p>
          )}
        </motion.div>
      </div>
    </div>
  )
}