'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wine, CheckCircle, ExternalLink } from 'lucide-react'
import { 
  ProgressBar, 
  NavigationButtons, 
  QuestionContainer,
  MultiSectionQuestion,
  ValidationMessage
} from '@/components/SurveyComponents'
import { surveyQuestions } from '@/data/questions'
import { SurveyData, QuestionSection } from '@/types/survey'

const TOTAL_STEPS = surveyQuestions.length + 2 // +2 for welcome and thank you pages

export default function SurveyPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [surveyData, setSurveyData] = useState<SurveyData>({
    // Demographics
    ageRange: '',
    gender: '',
    maritalStatus: '',
    cep: '',
    
    // Consumption Habits
    frequency: '',
    wineStyle: [],
    wineType: '',
    classification: '',
    priceRange: '',
    alcoholFreeWine: '',
    
    // Preferences
    grapeVarieties: '',
    tryNewVarieties: '',
    preferredOrigins: [],
    purchaseChannels: [],
    attractiveFactors: [],
    
    // Novelties
    wineEvents: '',
    cannedWines: '',
    naturalWines: '',
    
    // Contact
    name: '',
    email: '',
    phone: '',
    communicationPreference: ''
  })

  const updateSectionData = (sectionId: string, value: string | string[]) => {
    setSurveyData(prev => ({
      ...prev,
      [sectionId]: value
    }))
  }

  const [missingFields, setMissingFields] = useState<string[]>([])

  // Scroll to top whenever the step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentStep])

  const validateCurrentStep = (step: number): { isValid: boolean; missing: string[] } => {
    if (step === 0 || step === TOTAL_STEPS - 1) return { isValid: true, missing: [] }
    
    const questionIndex = step - 1
    const question = surveyQuestions[questionIndex]
    
    if (!question || !question.required || !question.sections) return { isValid: true, missing: [] }
    
    const missing: string[] = []
    
    // Validate each section in the question
    question.sections.forEach(section => {
      const value = surveyData[section.id as keyof SurveyData]
      
      if (section.type === 'text') {
        if (!value || value.toString().trim().length === 0) {
          missing.push(section.title)
        }
      } else if (section.type === 'single') {
        if (!value || value.toString().trim().length === 0) {
          missing.push(section.title)
        }
      } else if (section.type === 'multiple') {
        if (!Array.isArray(value) || value.length === 0) {
          missing.push(section.title)
        }
      }
    })
    
    return { isValid: missing.length === 0, missing }
  }

  const isStepValid = (step: number): boolean => {
    const validation = validateCurrentStep(step)
    return validation.isValid
  }

  const handleNext = () => {
    const validation = validateCurrentStep(currentStep)
    setMissingFields(validation.missing)
    
    if (currentStep < TOTAL_STEPS - 1 && validation.isValid) {
      setCurrentStep(prev => prev + 1)
      setMissingFields([]) // Clear missing fields when moving to next step
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
      setMissingFields([]) // Clear missing fields when going back
    }
  }

  const handleSubmit = async () => {
    const validation = validateCurrentStep(currentStep - 1)
    setMissingFields(validation.missing)
    
    if (!validation.isValid) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/survey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(surveyData),
      })

      if (response.ok) {
        setCurrentStep(TOTAL_STEPS - 1)
        setMissingFields([])
      } else {
        const error = await response.json()
        alert(error.error || 'Erro ao enviar pesquisa')
      }
    } catch (error) {
      console.error('Error submitting survey:', error)
      alert('Erro ao enviar pesquisa')
    } finally {
      setIsLoading(false)
    }
  }

  const renderWelcomePage = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="text-center max-w-2xl mx-auto"
    >
      <motion.div
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <Wine size={80} className="mx-auto text-purple-600 mb-6" />
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Pesquisa Rápida sobre Vinhos & Espumantes
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed">
          Queremos conhecer um pouco mais sobre você para montar uma seleção de vinhos 
          e espumantes que combine com seu gosto e estilo de vida. 
        </p>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-purple-50 rounded-lg p-6 mb-8"
      >
        <h3 className="text-lg font-semibold text-purple-800 mb-2">
          O que você encontrará:
        </h3>
        <ul className="text-purple-700 space-y-2">
          <li>• 5 seções sobre perfil e preferências</li>
          <li>• Leva menos de 2 minutos para responder</li>
          <li>• Você concorrerá a brindes exclusivos</li>
          <li>• Ganhe até 10% de desconto em sua primeira compra</li>
          <li>• Todos os dados são protegidos pela lei LGPD (Lei Geral de Proteção de Dados)</li>
        </ul>
      </motion.div>
    </motion.div>
  )

  const renderThankYouPage = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="text-center max-w-2xl mx-auto"
    >
      <motion.div
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <CheckCircle size={80} className="mx-auto text-green-600 mb-6" />
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Obrigado!
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed mb-6">
          Sua pesquisa foi enviada com sucesso. Em breve você receberá 
          recomendações personalizadas de vinhos e espumantes!
        </p>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-green-50 rounded-lg p-6 mb-8"
      >
        <h3 className="text-lg font-semibold text-green-800 mb-2">
          Próximos passos:
        </h3>
        <p className="text-green-700 mb-4">
          Compartilhe esta pesquisa com outros amantes de vinho!
        </p>
        <button
          onClick={() => {
            const url = window.location.href.replace(/\/[^/]*$/, '')
            navigator.clipboard.writeText(url)
            alert('Link copiado para a área de transferência!')
          }}
          className="inline-flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
        >
          <ExternalLink size={20} />
          <span>Compartilhar pesquisa</span>
        </button>
      </motion.div>
    </motion.div>
  )

  const renderQuestion = (questionIndex: number) => {
    const question = surveyQuestions[questionIndex]
    if (!question) return null

    if (question.type === 'multiple_section' && question.sections) {
      return (
        <>
          <ValidationMessage missingFields={missingFields} />
          <MultiSectionQuestion
            title={question.title}
            subtitle={question.subtitle}
            sections={question.sections as QuestionSection[]}
            values={surveyData}
            onChange={updateSectionData}
          />
        </>
      )
    }

    return null
  }

  const isLastStep = currentStep === surveyQuestions.length
  const canGoNext = isStepValid(currentStep)
  const canGoPrevious = currentStep > 0 && currentStep < TOTAL_STEPS - 1

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {currentStep > 0 && currentStep < TOTAL_STEPS - 1 && (
          <ProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS - 2} />
        )}

        <AnimatePresence mode="wait">
          {currentStep === 0 && (
            <motion.div key="welcome">
              {renderWelcomePage()}
            </motion.div>
          )}

          {currentStep > 0 && currentStep <= surveyQuestions.length && (
            <QuestionContainer
              key={`question-${currentStep}`}
              questionNumber={currentStep}
              totalQuestions={surveyQuestions.length}
            >
              {renderQuestion(currentStep - 1)}
            </QuestionContainer>
          )}

          {currentStep === TOTAL_STEPS - 1 && (
            <motion.div key="thankyou">
              {renderThankYouPage()}
            </motion.div>
          )}
        </AnimatePresence>

        {currentStep < TOTAL_STEPS - 1 && (
          <NavigationButtons
            onNext={handleNext}
            onPrevious={handlePrevious}
            onSubmit={handleSubmit}
            canGoNext={canGoNext}
            canGoPrevious={canGoPrevious}
            isLastStep={isLastStep}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  )
}