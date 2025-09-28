export interface SurveyData extends Record<string, string | string[]> {
  // Demographics
  ageRange: string
  gender: string
  maritalStatus: string
  householdSize: string
  
  // Consumption Habits
  frequency: string
  wineStyle: string[]
  wineType: string
  classification: string
  priceRange: string
  alcoholFreeWine: string
  
  // Preferences
  grapeVarieties: string
  tryNewVarieties: string
  preferredOrigins: string[]
  purchaseChannels: string[]
  attractiveFactors: string[]
  
  // Novelties
  wineEvents: string
  cannedWines: string
  naturalWines: string
  
  // Contact
  name: string
  email: string
  phone: string
  communicationPreference: string
}

export interface QuestionSection {
  id: string
  title: string
  type: 'text' | 'single' | 'multiple'
  options?: string[]
  placeholder?: string
}

export interface Question {
  id: string
  type: 'text' | 'single' | 'multiple' | 'multiple_section'
  title: string
  subtitle?: string
  options?: string[]
  sections?: QuestionSection[]
  required?: boolean
  placeholder?: string
}