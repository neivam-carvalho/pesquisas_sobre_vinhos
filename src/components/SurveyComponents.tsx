'use client'

import { motion } from 'framer-motion'
import { ArrowRight, ArrowLeft, Check } from 'lucide-react'
import { useState } from 'react'

// Função utilitária para validar email
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return emailRegex.test(email.trim())
}

interface ProgressBarProps {
  currentStep: number
  totalSteps: number
}

export const ProgressBar = ({ currentStep, totalSteps }: ProgressBarProps) => {
  const progress = (currentStep / totalSteps) * 100

  return (
    <div className="w-full bg-gray-200 h-1 rounded-full mb-8">
      <motion.div
        className="bg-purple-600 h-1 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
    </div>
  )
}

interface NavigationButtonsProps {
  onNext: () => void
  onPrevious: () => void
  onSubmit: () => void
  canGoNext: boolean
  canGoPrevious: boolean
  isLastStep: boolean
  isLoading?: boolean
}

export const NavigationButtons = ({
  onNext,
  onPrevious,
  onSubmit,
  canGoNext,
  canGoPrevious,
  isLastStep,
  isLoading = false
}: NavigationButtonsProps) => {
  return (
    <div className="flex justify-between items-center mt-8">
      <button
        onClick={onPrevious}
        disabled={!canGoPrevious}
        className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all ${
          canGoPrevious
            ? 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            : 'text-gray-400 cursor-not-allowed'
        }`}
      >
        <ArrowLeft size={20} />
        <span>Anterior</span>
      </button>

      {isLastStep ? (
        <motion.button
          onClick={onSubmit}
          disabled={!canGoNext || isLoading}
          whileHover={{ scale: canGoNext ? 1.05 : 1 }}
          whileTap={{ scale: canGoNext ? 0.95 : 1 }}
          className={`flex items-center space-x-2 px-8 py-3 rounded-lg font-medium transition-all ${
            canGoNext && !isLoading
              ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg'
              : 'bg-gray-400 text-white cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <Check size={20} />
          )}
          <span>{isLoading ? 'Enviando...' : 'Finalizar'}</span>
        </motion.button>
      ) : (
        <motion.button
          onClick={onNext}
          disabled={!canGoNext}
          whileHover={{ scale: canGoNext ? 1.05 : 1 }}
          whileTap={{ scale: canGoNext ? 0.95 : 1 }}
          className={`flex items-center space-x-2 px-8 py-3 rounded-lg font-medium transition-all ${
            canGoNext
              ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg'
              : 'bg-gray-400 text-white cursor-not-allowed'
          }`}
        >
          <span>Próximo</span>
          <ArrowRight size={20} />
        </motion.button>
      )}
    </div>
  )
}

interface QuestionContainerProps {
  children: React.ReactNode
  questionNumber: number
  totalQuestions: number
}

export const QuestionContainer = ({ 
  children, 
  questionNumber, 
  totalQuestions 
}: QuestionContainerProps) => {
  return (
    <motion.div
      key={questionNumber}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="max-w-2xl mx-auto"
    >
      <div className="text-sm text-purple-600 mb-4 font-medium">
        {questionNumber} → {totalQuestions}
      </div>
      {children}
    </motion.div>
  )
}

interface TextQuestionProps {
  title: string
  subtitle?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export const TextQuestion = ({ 
  title, 
  subtitle, 
  value, 
  onChange,
  placeholder = "Digite sua resposta aqui..."
}: TextQuestionProps) => {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-4">{title}</h2>
      {subtitle && (
        <p className="text-gray-600 text-lg mb-8">{subtitle}</p>
      )}
      
      <div className={`relative transition-all duration-300 ${isFocused ? 'transform scale-105' : ''}`}>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          rows={6}
          className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-lg resize-none transition-all duration-300"
        />
      </div>
    </div>
  )
}

interface SingleChoiceQuestionProps {
  title: string
  subtitle?: string
  options: string[]
  value: string
  onChange: (value: string) => void
}

export const SingleChoiceQuestion = ({
  title,
  subtitle,
  options,
  value,
  onChange
}: SingleChoiceQuestionProps) => {
  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-4">{title}</h2>
      {subtitle && (
        <p className="text-gray-600 text-lg mb-8">{subtitle}</p>
      )}
      
      <div className="space-y-3">
        {options.map((option, index) => (
          <motion.button
            key={option}
            onClick={() => onChange(option)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`w-full p-4 text-left border-2 rounded-lg transition-all duration-300 ${
              value === option
                ? 'border-purple-500 bg-purple-50 text-purple-800'
                : 'border-gray-300 hover:border-gray-400 text-gray-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-lg">{option}</span>
              <div className={`w-6 h-6 rounded-full border-2 transition-all duration-300 ${
                value === option
                  ? 'border-purple-500 bg-purple-500'
                  : 'border-gray-300'
              }`}>
                {value === option && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-full h-full rounded-full bg-white flex items-center justify-center"
                  >
                    <div className="w-2 h-2 bg-purple-500 rounded-full" />
                  </motion.div>
                )}
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

interface ValidationMessageProps {
  missingFields: string[]
}

export const ValidationMessage = ({ missingFields }: ValidationMessageProps) => {
  if (missingFields.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-red-50 border-l-4 border-red-500 p-4 mb-6"
    >
      <div className="flex">
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">
            Por favor, preencha os campos obrigatórios:
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <ul className="list-disc pl-5 space-y-1">
              {missingFields.map((field, index) => (
                <li key={index}>{field}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

interface MultiSectionQuestionProps {
  title: string
  subtitle?: string
  sections: Array<{
    id: string
    title: string
    type: 'text' | 'single' | 'multiple'
    options?: string[]
    placeholder?: string
  }>
  values: Record<string, string | string[]>
  onChange: (sectionId: string, value: string | string[]) => void
}

export const MultiSectionQuestion = ({
  title,
  subtitle,
  sections,
  values,
  onChange
}: MultiSectionQuestionProps) => {
  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-4">{title}</h2>
      {subtitle && (
        <p className="text-gray-600 text-lg mb-8">{subtitle}</p>
      )}
      
      <div className="space-y-8">
        {sections.map((section, index) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-50 rounded-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {section.title}
            </h3>
            
            {section.type === 'text' && (
              <>
                <input
                  type={section.id === 'email' ? 'email' : 'text'}
                  inputMode={section.id === 'cep' ? 'numeric' : section.id === 'phone' ? 'tel' : 'text'}
                  autoComplete={section.id === 'email' ? 'email' : section.id === 'phone' ? 'tel' : section.id === 'name' ? 'name' : 'off'}
                  value={values[section.id] as string || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Se for o campo CEP, aplicar validação especial
                    if (section.id === 'cep') {
                      // Permite apenas números e limita a 8 dígitos
                      const numericValue = value.replace(/\D/g, '').slice(0, 8);
                      onChange(section.id, numericValue);
                    } else if (section.id === 'phone') {
                      // Para telefone, permite apenas números e limita a 11 dígitos
                      const numericValue = value.replace(/\D/g, '').slice(0, 11);
                      onChange(section.id, numericValue);
                    } else {
                      onChange(section.id, value);
                    }
                  }}
                  placeholder={section.placeholder}
                  className={`w-full px-5 py-4 md:px-4 md:py-3 border-3 rounded-lg focus:outline-none text-xl md:text-lg font-semibold transition-all shadow-sm placeholder:text-gray-500 placeholder:font-medium ${
                    // Estilo de erro para CEP
                    (section.id === 'cep' && values[section.id] && (values[section.id] as string).length !== 8) ||
                    // Estilo de erro para email
                    (section.id === 'email' && values[section.id] && !isValidEmail(values[section.id] as string))
                      ? 'border-red-500 focus:border-red-600 bg-red-50 text-red-900'
                      : 'border-gray-400 focus:border-purple-600 bg-white text-gray-900 focus:bg-purple-50 focus:shadow-lg'
                  }`}
                  maxLength={section.id === 'cep' ? 8 : section.id === 'phone' ? 11 : undefined}
                />
                {section.id === 'cep' && values[section.id] && (values[section.id] as string).length > 0 && (values[section.id] as string).length !== 8 && (
                  <p className="text-red-600 text-sm mt-1 flex items-center">
                    <span className="mr-1">⚠️</span>
                    CEP deve ter exatamente 8 dígitos numéricos
                  </p>
                )}
                {section.id === 'email' && values[section.id] && (values[section.id] as string).length > 0 && !isValidEmail(values[section.id] as string) && (
                  <p className="text-red-600 text-sm mt-1 flex items-center">
                    <span className="mr-1">⚠️</span>
                    Digite um e-mail válido (exemplo: nome@dominio.com)
                  </p>
                )}
              </>
            )}
            
            {section.type === 'single' && section.options && (
              <div className="space-y-2">
                {section.options.map((option) => (
                  <motion.button
                    key={option}
                    onClick={() => onChange(section.id, option)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={`w-full p-3 text-left border-2 rounded-lg transition-all duration-300 ${
                      values[section.id] === option
                        ? 'border-purple-500 bg-purple-50 text-purple-800'
                        : 'border-gray-300 hover:border-gray-400 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{option}</span>
                      <div className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                        values[section.id] === option
                          ? 'border-purple-500 bg-purple-500'
                          : 'border-gray-300'
                      }`}>
                        {values[section.id] === option && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-full h-full rounded-full bg-white flex items-center justify-center"
                          >
                            <div className="w-1 h-1 bg-purple-500 rounded-full" />
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
            
            {section.type === 'multiple' && section.options && (
              <div className="space-y-2">
                {section.options.map((option) => {
                  const currentValues = values[section.id] as string[] || []
                  const isSelected = currentValues.includes(option)
                  
                  return (
                    <motion.button
                      key={option}
                      onClick={() => {
                        const newValues = isSelected
                          ? currentValues.filter(v => v !== option)
                          : [...currentValues, option]
                        onChange(section.id, newValues)
                      }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={`w-full p-3 text-left border-2 rounded-lg transition-all duration-300 ${
                        isSelected
                          ? 'border-purple-500 bg-purple-50 text-purple-800'
                          : 'border-gray-300 hover:border-gray-400 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{option}</span>
                        <div className={`w-4 h-4 rounded border-2 transition-all duration-300 ${
                          isSelected
                            ? 'border-purple-500 bg-purple-500'
                            : 'border-gray-300'
                        }`}>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-full h-full flex items-center justify-center"
                            >
                              <Check size={12} className="text-white" />
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}