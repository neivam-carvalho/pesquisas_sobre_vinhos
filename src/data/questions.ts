export const surveyQuestions = [
  {
    id: 'demographicInfo',
    type: 'multiple_section' as const,
    title: 'Perfil Demográfico',
    subtitle: 'Queremos conhecer um pouco mais sobre você para personalizar nossa recomendação',
    sections: [
      {
        id: 'ageRange',
        title: 'Faixa etária',
        type: 'single',
        options: [
          '18 – 25 anos',
          '26 – 35 anos',
          '36 – 45 anos',
          '46 – 60 anos',
          'Acima de 60 anos'
        ]
      },
      {
        id: 'gender',
        title: 'Sexo',
        type: 'single',
        options: [
          'Feminino',
          'Masculino',
          'Prefiro não informar'
        ]
      },
      {
        id: 'maritalStatus',
        title: 'Estado civil',
        type: 'single',
        options: [
          'Solteiro(a)',
          'Casado(a)/em união estável',
          'Divorciado(a)',
          'Viúvo(a)'
        ]
      },
      {
        id: 'householdSize',
        title: 'Quantas pessoas moram na sua casa?',
        type: 'single',
        options: ['1', '2', '3', '4', '5 ou mais']
      }
    ],
    required: true
  },
  {
    id: 'consumptionHabits',
    type: 'multiple_section' as const,
    title: 'Hábitos de Consumo',
    subtitle: 'Conte-nos sobre seus hábitos de consumo de vinhos e espumantes',
    sections: [
      {
        id: 'frequency',
        title: 'Frequência de consumo de vinhos/espumantes',
        type: 'single',
        options: [
          'Uma vez por semana',
          'Duas vezes por semana',
          'Quinzenal',
          'Mensal',
          'Raramente'
        ]
      },
      {
        id: 'wineStyle',
        title: 'Estilo de vinho preferido',
        type: 'multiple',
        options: ['Seco', 'Meio seco', 'Suave']
      },
      {
        id: 'wineType',
        title: 'Tipo mais consumido',
        type: 'single',
        options: ['Branco', 'Rosé', 'Tinto', 'Espumante']
      },
      {
        id: 'classification',
        title: 'Classificação preferida',
        type: 'single',
        options: ['Vinhos de mesa', 'Vinhos finos', 'Ambos']
      },
      {
        id: 'priceRange',
        title: 'Faixa de preço que costuma investir por garrafa',
        type: 'single',
        options: [
          'Até R$ 40',
          'R$ 41 – R$ 50',
          'R$ 51 – R$ 80',
          'R$ 81 – R$ 100',
          'R$ 101 – R$ 200',
          'Acima de R$ 200'
        ]
      },
      {
        id: 'alcoholFreeWine',
        title: 'Consome vinho sem álcool?',
        type: 'single',
        options: ['Sim', 'Não']
      }
    ],
    required: true
  },
  {
    id: 'preferences',
    type: 'multiple_section' as const,
    title: 'Preferências',
    subtitle: 'Suas preferências nos ajudam a fazer melhores recomendações',
    sections: [
      {
        id: 'grapeVarieties',
        title: 'Variedades que mais consome',
        type: 'text',
        placeholder: 'Ex: Cabernet Sauvignon, Chardonnay, Malbec...'
      },
      {
        id: 'tryNewVarieties',
        title: 'Gostaria de conhecer novas variedades?',
        type: 'single',
        options: ['Sim', 'Não']
      },
      {
        id: 'preferredOrigins',
        title: 'Origens preferidas',
        type: 'multiple',
        options: [
          'Argentina',
          'Brasil',
          'Chile',
          'Espanha',
          'França',
          'Portugal',
          'Uruguai'
        ]
      },
      {
        id: 'purchaseChannels',
        title: 'Onde costuma comprar vinhos?',
        type: 'multiple',
        options: [
          'Supermercados',
          'Lojas especializadas (adegas, empórios)',
          'Delivery (iFood, Rappi, etc.)',
          'E-commerce/clube de assinatura',
          'Lojas de conveniência',
          'WhatsApp/revendedores',
          'Conhecido que vende com preço especial',
          'Eventos/feiras',
          'Degustações/jantares harmonizados'
        ]
      },
      {
        id: 'attractiveFactors',
        title: 'O que é mais atrativo ao escolher um vinho?',
        type: 'multiple',
        options: [
          'Menor preço',
          'Entrega grátis',
          'Bom atendimento',
          'Rótulos exclusivos',
          'Marcas conhecidas',
          'Degustar antes de comprar'
        ]
      }
    ],
    required: true
  },
  {
    id: 'novelties',
    type: 'multiple_section' as const,
    title: 'Novidades',
    subtitle: 'Explore novas tendências no mundo dos vinhos',
    sections: [
      {
        id: 'wineEvents',
        title: 'Costuma ir a eventos de vinhos?',
        type: 'single',
        options: ['Sim', 'Não']
      },
      {
        id: 'cannedWines',
        title: 'Conhece vinhos em lata?',
        type: 'single',
        options: [
          'Conheço e gosto',
          'Não conheço, mas quero conhecer',
          'Já conheço, mas não consumo'
        ]
      },
      {
        id: 'naturalWines',
        title: 'Conhece vinhos naturais ou biodinâmicos?',
        type: 'single',
        options: [
          'Conheço e gosto',
          'Não conheço, mas quero conhecer',
          'Já conheço, mas não consumo'
        ]
      }
    ],
    required: true
  },
  {
    id: 'contact',
    type: 'multiple_section' as const,
    title: 'Contato',
    subtitle: 'Para enviarmos recomendações personalizadas e novidades',
    sections: [
      {
        id: 'name',
        title: 'Nome',
        type: 'text',
        placeholder: 'Seu nome completo'
      },
      {
        id: 'email',
        title: 'E-mail',
        type: 'text',
        placeholder: 'seu@email.com'
      },
      {
        id: 'phone',
        title: 'Telefone/WhatsApp',
        type: 'text',
        placeholder: '(00) 00000-0000'
      },
      {
        id: 'communicationPreference',
        title: 'Gostaria de receber promoções e novidades?',
        type: 'single',
        options: [
          'Sim, pode me chamar no WhatsApp',
          'Sim, prefiro por e-mail',
          'Não, obrigado(a)'
        ]
      }
    ],
    required: true
  }
]