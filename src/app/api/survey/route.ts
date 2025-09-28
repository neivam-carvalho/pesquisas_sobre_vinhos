import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { 
      ageRange, gender, maritalStatus, cep,
      frequency, wineStyle, wineType, classification, priceRange, alcoholFreeWine,
      grapeVarieties, tryNewVarieties, preferredOrigins, purchaseChannels, attractiveFactors,
      wineEvents, cannedWines, naturalWines,
      name, email, phone, communicationPreference
    } = body

    // Get client info
    const userAgent = request.headers.get('user-agent') || undefined
    const forwardedFor = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const ipAddress = forwardedFor?.split(',')[0] || realIp || undefined

    // Create survey response
    const survey = await prisma.survey.create({
      data: {
        // Demographics
        ageRange: ageRange || null,
        gender: gender || null,
        maritalStatus: maritalStatus || null,
        cep: cep || null,
        
        // Consumption Habits
        frequency: frequency || null,
        wineStyle: wineStyle || [],
        wineType: wineType || null,
        classification: classification || null,
        priceRange: priceRange || null,
        alcoholFreeWine: alcoholFreeWine || null,
        
        // Preferences
        grapeVarieties: grapeVarieties || null,
        tryNewVarieties: tryNewVarieties || null,
        preferredOrigins: preferredOrigins || [],
        purchaseChannels: purchaseChannels || [],
        attractiveFactors: attractiveFactors || [],
        
        // Novelties
        wineEvents: wineEvents || null,
        cannedWines: cannedWines || null,
        naturalWines: naturalWines || null,
        
        // Contact
        name: name || null,
        email: email || null,
        phone: phone || null,
        communicationPreference: communicationPreference || null,
        
        // Metadata
        userAgent,
        ipAddress,
        completedAt: new Date(),
      },
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Pesquisa enviada com sucesso!',
      surveyId: survey.id 
    })

  } catch (error) {
    console.error('Error saving survey:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const surveys = await prisma.survey.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100, // Limit to last 100 responses
    })

    // Simple analytics
    const totalSurveys = await prisma.survey.count()
    
    const wineTypeStats = await prisma.survey.groupBy({
      by: ['wineType'],
      _count: {
        wineType: true,
      },
      where: {
        wineType: {
          not: null,
        },
      },
    })

    return NextResponse.json({
      surveys,
      analytics: {
        total: totalSurveys,
        wineTypeStats: wineTypeStats.map((stat: { 
          wineType: string | null; 
          _count: { wineType: number } 
        }) => ({
          type: stat.wineType || 'Não informado',
          count: stat._count.wineType,
        })),
      },
    })

  } catch (error) {
    console.error('Error fetching surveys:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}