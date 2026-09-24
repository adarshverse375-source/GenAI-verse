import { Chapter } from './types';

export const CBSE_CHAPTERS: Chapter[] = [
  {
    id: 'math-real-numbers',
    name: 'Real Numbers',
    subject: 'Mathematics',
    keySummary: [
      ' Hey this is AdarshThe Fundamental Theorem of Arithmetic states that every composite number can be uniquely expressed as a product of prime numbers, up to the order of factors.',
      'For any two positive integers a and b, HCF(a, b) × LCM(a, b) = a × b.',
      'An irrational number cannot be written as a ratio of integers. Examples include √2, √3, √5, and π.',
      'If p is a prime number and p divides a² (where a is a positive integer), then p divides a.'
    ],
    formulasOrFacts: [
      'HCF(a, b) × LCM(a, b) = a × b',
      'Fundamental Theorem of Arithmetic: x = p₁^a₁ × p₂^a₂ × ... × p_n^a_n',
      'Proof of irrationality uses the Method of Contradiction (assuming a/b is co-prime).'
    ],
    flashcards: [
      { id: 'm-rn-1', front: 'What is the relation between HCF, LCM and two numbers a & b?', back: 'HCF(a, b) × LCM(a, b) = a × b', extraInfo: 'Only holds true for two numbers, not three!' },
      { id: 'm-rn-2', front: 'State the Fundamental Theorem of Arithmetic.', back: 'Every composite number can be expressed as a unique product of primes, apart from the order in which prime factors occur.', extraInfo: 'Used extensively to find prime factors, HCF, and LCM.' },
      { id: 'm-rn-3', front: 'If p is a prime and p divides a², does it divide a?', back: 'Yes, if p divides a², then p also divides a (where a is a positive integer).', extraInfo: 'This theorem is the foundation of proving the irrationality of numbers like √2.' }
    ],
    highYieldQuestions: [
      {
        questionText: 'If two positive integers a and b are written as a = x³y² and b = xy³ (where x, y are prime numbers), then HCF(a, b) is:',
        options: ['xy', 'xy²', 'x³y³', 'x²y²'],
        correctIndex: 1,
        explanation: 'HCF is the product of the lowest power of each common prime factor. For x, the lowest power is x¹; for y, the lowest power is y². Thus, HCF(a, b) = xy².'
      },
      {
        questionText: 'If the LCM of two numbers is 360 and their HCF is 9, and one of the numbers is 45, what is the other number?',
        options: ['72', '80', '90', '40'],
        correctIndex: 0,
        explanation: 'Using HCF(a, b) × LCM(a, b) = a × b, we get 9 × 360 = 45 × b. Therefore, b = (9 × 360) / 45 = 3240 / 45 = 72.'
      },
      {
        questionText: 'What type of number is (3 + √5)(3 - √5)?',
        options: ['Irrational', 'Rational', 'Prime', 'Imaginary'],
        correctIndex: 1,
        explanation: 'Applying the algebraic identity (a-b)(a+b) = a² - b², we get: (3 + √5)(3 - √5) = 3² - (√5)² = 9 - 5 = 4. Since 4 is an integer, it is a rational number.'
      }
    ]
  },
  {
    id: 'math-quad-eq',
    name: 'Quadratic Equations',
    subject: 'Mathematics',
    keySummary: [
      'A quadratic equation in variable x is of the form ax² + bx + c = 0, where a, b, c are real numbers and a ≠ 0.',
      'A real number α is a root of the quadratic equation if aα² + bα + c = 0.',
      'Discriminant D = b² - 4ac determines the nature of the roots.',
      'Roots can be found using factorization, completing the square (historical), or the Quadratic Formula.'
    ],
    formulasOrFacts: [
      'Quadratic Formula: x = [-b ± √(b² - 4ac)] / (2a)',
      'Discriminant: D = b² - 4ac',
      'Nature of Roots:\n- D > 0: Two distinct real roots\n- D = 0: Two equal real roots\n- D < 0: No real roots (complex roots)'
    ],
    flashcards: [
      { id: 'm-qe-1', front: 'What is the Quadratic Formula to find roots?', back: 'x = [-b ± √(b² - 4ac)] / (2a)', extraInfo: 'Applicable when a ≠ 0, c = 0 and D ≥ 0 for real roots.' },
      { id: 'm-qe-2', front: 'What does the Discriminant D = 0 imply about the roots?', back: 'The quadratic equation has two equal, real roots (each equal to -b/2a).', extraInfo: 'In this case, the quadratic polynomial is a perfect square.' },
      { id: 'm-qe-3', front: 'What is the condition for a quadratic equation to have distinct real roots?', back: 'The discriminant must be strictly positive (D > 0), where D = b² - 4ac.', extraInfo: 'If D > 0, the graph of the quadratic equation crosses the x-axis at two distinct points.' }
    ],
    highYieldQuestions: [
      {
        questionText: 'The discriminant of the quadratic equation 2x² - 4x + 3 = 0 is:',
        options: ['-8', '8', '-16', '16'],
        correctIndex: 0,
        explanation: 'Here a=2, b=-4, c=3. Discriminant D = b² - 4ac = (-4)² - 4(2)(3) = 16 - 24 = -8.'
      },
      {
        questionText: 'If the quadratic equation kx² - 6x + k = 0 has equal real roots, then the value(s) of k is/are:',
        options: ['±3', '±6', '3 only', '-3 only'],
        correctIndex: 0,
        explanation: 'For equal roots, D = b² - 4ac = 0. Here, (-6)² - 4(k)(k) = 0 => 36 - 4k² = 0 => 4k² = 36 => k² = 9 => k = ±3.'
      },
      {
        questionText: 'Which of the following is NOT a quadratic equation?',
        options: ['(x-2)(x+1) = (x-1)(x+3)', 'x² + 3x + 1 = (x-2)²', 'x(2x+3) = x² + 1', '(x+2)³ = x³ - 4'],
        correctIndex: 1,
        explanation: 'In option 2: x² + 3x + 1 = x² - 4x + 4. The x² terms cancel out on both sides, yielding 7x - 3 = 0, which is a linear equation, not quadratic.'
      }
    ]
  },
  {
    id: 'science-chem-reactions',
    name: 'Chemical Reactions & Equations',
    subject: 'Science',
    keySummary: [
      'A chemical equation is a shorthand representation of a chemical change using formulas of reactants and products.',
      'A balanced chemical equation has an equal number of atoms of each element on both sides, adhering to the Law of Conservation of Mass.',
      'Types of Reactions: Combination (A+B→C), Decomposition (C→A+B), Displacement (A+BC→AC+B), Double Displacement (AB+CD→AD+CB), and Redox (Reduction-Oxidation).'
    ],
    formulasOrFacts: [
      'Decomposition requires energy in form of heat (thermal), light (photolytic), or electricity (electrolytic).',
      'Oxidation is gain of oxygen or loss of hydrogen. Reduction is loss of oxygen or gain of hydrogen.',
      'Precipitation reactions produce an insoluble salt (precipitate).'
    ],
    flashcards: [
      { id: 's-cr-1', front: 'What is the main principle behind balancing chemical equations?', back: 'The Law of Conservation of Mass: Mass can neither be created nor destroyed in a chemical reaction.', extraInfo: 'Total mass of reactants must equal total mass of products.' },
      { id: 's-cr-2', front: 'Explain photolytic decomposition with an everyday CBSE example.', back: 'Decomposition of Silver Chloride (2AgCl → 2Ag + Cl₂) in the presence of sunlight, turning white powder grey.', extraInfo: 'This reaction was historically used in black & white photography.' },
      { id: 's-cr-3', front: 'What happens in a double displacement reaction?', back: 'An exchange of ions between the reactants takes place to form two new compounds.', extraInfo: 'Often results in the formation of a precipitate, e.g., BaSO₄ from Na₂SO₄ and BaCl₂.' }
    ],
    highYieldQuestions: [
      {
        questionText: 'When lead nitrate powder is heated in a boiling tube, brown fumes are emitted. These brown fumes are of:',
        options: ['Nitrous oxide (N₂O)', 'Nitrogen dioxide (NO₂)', 'Nitrogen pentoxide (N₂O₅)', 'Lead oxide (PbO)'],
        correctIndex: 1,
        explanation: 'Heating lead nitrate decomposes it into lead oxide, oxygen, and nitrogen dioxide (NO₂). NO₂ is a pungent, reddish-brown gas that causes the brown fumes.'
      },
      {
        questionText: 'Fe₂O₃ + 2Al → Al₂O₃ + 2Fe. This reaction is an example of a:',
        options: ['Combination reaction', 'Double displacement reaction', 'Decomposition reaction', 'Displacement reaction'],
        correctIndex: 3,
        explanation: 'In this reaction, Aluminum (Al) is more reactive than Iron (Fe). Al displaces Fe from iron oxide to form aluminum oxide and iron. Hence, it is a displacement reaction.'
      },
      {
        questionText: 'Which of the following gases can be used for storage of fresh samples of an oil for a long time to prevent rancidity?',
        options: ['Carbon dioxide or Oxygen', 'Nitrogen or Helium', 'Helium or Oxygen', 'Carbon dioxide or Helium'],
        correctIndex: 1,
        explanation: 'Rancidity is caused by oxidation of oil/fat. To prevent this, inert or unreactive gases like Nitrogen or Helium are used to create an antioxidant environment.'
      }
    ]
  },
  {
    id: 'science-life-processes',
    name: 'Life Processes',
    subject: 'Science',
    keySummary: [
      'Basic essential functions performed by living organisms to maintain life on earth are called life processes.',
      'Autotrophic nutrition: Organisms synthesize food using inorganic raw materials (CO₂, water) via photosynthesis in chlorophyll-bearing cells.',
      'Respiration: The process of breaking down food (glucose) to release energy, which is stored as ATP.',
      'Human Circulatory system consists of Heart, Blood, and Blood Vessels. Human heart is four-chambered to prevent oxygenated and deoxygenated blood mixing.'
    ],
    formulasOrFacts: [
      'Photosynthesis Equation:\n6CO₂ + 12H₂O + Sunlight/Chlorophyll → C₆H₁₂O₆ + 6O₂ + 6H₂O',
      'Aerobic Respiration: Releases 38 ATP. Occurs in mitochondria.\nAnaerobic Respiration: Releases 2 ATP. Occurs in cytoplasm (yeast/muscle cells).'
    ],
    flashcards: [
      { id: 's-lp-1', front: 'Where does anaerobic respiration in human muscle cells occur during strenuous exercise?', back: 'In the cytoplasm, yielding Lactic Acid and 2 ATP.', extraInfo: 'Accumulation of lactic acid in muscles causes painful muscle cramps.' },
      { id: 's-lp-2', front: 'What is the role of Bile Juice produced by the liver?', back: 'Emulsification of fats (breaking down large fat globules into smaller ones) and making the food medium alkaline for pancreatic enzymes.', extraInfo: 'Stored temporarily in the Gallbladder.' },
      { id: 's-lp-3', front: 'Why do ventricles have thicker muscular walls than atria?', back: 'Because ventricles have to pump blood into various organs at high pressure, whereas atria only receive blood.', extraInfo: 'The left ventricle has the thickest wall of all four chambers.' }
    ],
    highYieldQuestions: [
      {
        questionText: 'Which of the following is the correct path of urine in the human body?',
        options: [
          'Kidneys -> Urethra -> Urinary bladder -> Ureter',
          'Urinary bladder -> Kidneys -> Ureter -> Urethra',
          'Kidneys -> Ureter -> Urinary bladder -> Urethra',
          'Kidneys -> Urinary bladder -> Ureter -> Urethra'
        ],
        correctIndex: 2,
        explanation: 'Urine is filtered in the Kidneys, travels down the two tubular Ureters, is collected in the muscular Urinary Bladder, and is ultimately expelled through the Urethra.'
      },
      {
        questionText: 'During respiration, the exchange of gases takes place in:',
        options: ['Alveoli of lungs', 'Pharynx and Larynx', 'Trachea and Bronchi', 'Alveoli and Throat'],
        correctIndex: 0,
        explanation: 'Alveoli are tiny balloon-like structures in the lungs that provide a massive surface area for gaseous exchange. Their thin walls are richly supplied with blood capillaries.'
      }
    ]
  },
  {
    id: 'sst-nationalism-india',
    name: 'Nationalism in India',
    subject: 'Social Science',
    keySummary: [
      'Modern nationalism in Europe came to be associated with the formation of nation-states, whereas in India, it was linked with the anti-colonial movement.',
      'Satyagraha: Mahatma Gandhi returned from South Africa in 1915 and introduced Satyagraha, emphasizing the power of truth and peaceful protest.',
      'Key Events: Rowlatt Act (1919), Jallianwala Bagh Massacre (13 April 1919), Non-Cooperation Movement (1920-1922), and Civil Disobedience Movement starting with the Dandi Salt March (1930).'
    ],
    formulasOrFacts: [
      'Champaran Satyagraha (1917) - Bihar (against oppressive indigo plantations)',
      'Kheda Satyagraha (1918) - Gujarat (demanding revenue relaxation due to crop failure)',
      'Ahmedabad Mill Strike (1918) - Gujarat (cotton mill workers wage dispute)'
    ],
    flashcards: [
      { id: 'h-ni-1', front: 'What was the Rowlatt Act of 1919?', back: 'An act that gave the British government enormous power to repress political activities, and allowed detention of political prisoners without trial for up to two years.', extraInfo: 'Gandhiji organized a nationwide hartal against this unjust act on April 6, 1919.' },
      { id: 'h-ni-2', front: 'Why did Mahatma Gandhi withdraw the Non-Cooperation Movement in February 1922?', back: 'Due to the violent Chauri Chaura incident in Gorakhpur, UP, where a peaceful crowd set fire to a police station, killing 22 policemen.', extraInfo: 'Gandhiji believed the movement was turning violent and satyagrahis needed proper training.' },
      { id: 'h-ni-3', front: 'Why did Gandhiji choose Salt as the central symbol of protest in the Civil Disobedience Movement?', back: 'Salt was an essential food item consumed by both the rich and the poor, and the state monopoly/tax on it was seen as highly oppressive.', extraInfo: 'The historic Salt March covered 240 miles from Sabarmati Ashram to Dandi.' }
    ],
    highYieldQuestions: [
      {
        questionText: 'By whom was the famous book "Hind Swaraj" written?',
        options: ['Subhas Chandra Bose', 'Jawaharlal Nehru', 'Mahatma Gandhi', 'Bal Gangadhar Tilak'],
        correctIndex: 2,
        explanation: '"Hind Swaraj" was written by Mahatma Gandhi in 1909. In this book, he declared that British rule was established in India with the cooperation of Indians, and if they refused to cooperate, British rule would collapse within a year.'
      },
      {
        questionText: 'Which pact resolved the conflict of representation for the Depressed Classes between Gandhiji and Dr. B.R. Ambedkar in 1932?',
        options: ['Gandhi-Irwin Pact', 'Poona Pact', 'Lucknow Pact', 'Simla Pact'],
        correctIndex: 1,
        explanation: 'The Poona Pact of September 1932 gave reserved seats to the Depressed Classes (later known as Scheduled Castes) in provincial and central legislative councils, though they were to be voted in by a general electorate.'
      }
    ]
  },
  {
    id: 'eng-nelson-mandela',
    name: 'Nelson Mandela: Long Walk to Freedom',
    subject: 'English Literature',
    keySummary: [
      'This chapter is an extract from Nelson Mandela’s autobiography, describing the historic inauguration ceremony of South Africa’s first democratic, non-racial government.',
      'Mandela pays tribute to countless African patriots who sacrificed their lives for freedom against the brutal system of Apartheid.',
      'He speaks of "twin obligations": one to family and parents, and the other to one’s people, community, and country.',
      'He defines bravery not as the absence of fear, but the triumph over it.'
    ],
    formulasOrFacts: [
      'Inauguration Date: 10th May 1994.',
      'Venue: Union Buildings Amphitheatre in Pretoria.',
      'Apartheid: A political system that separates people according to their race.'
    ],
    flashcards: [
      { id: 'e-nm-1', front: 'What is the date of South Africa’s historic non-racial democratic inauguration described in the chapter?', back: '10th May 1994 (autumn day in South Africa).', extraInfo: 'Attended by dignitaries from over 140 countries.' },
      { id: 'e-nm-2', front: 'How does Nelson Mandela define "courage"?', back: 'Courage is not the absence of fear, but the triumph over it. The brave man is not he who does not feel afraid, but he who conquers that fear.', extraInfo: 'This is one of the most frequently asked quotes in CBSE boards.' },
      { id: 'e-nm-3', front: 'What are the "Twin Obligations" Mandela mentions?', back: '1. Obligations to family, parents, wife, and children.\n2. Obligations to his people, community, and country.', extraInfo: 'Mandela notes that under Apartheid, a black man was punished if he tried to fulfill his dual duties.' }
    ],
    highYieldQuestions: [
      {
        questionText: 'What is the "spectacular array of South African jets" a symbol of during the inauguration?',
        options: [
          'Military might and supremacy of the state',
          'Military’s loyalty to democracy and the new, free government',
          'Threat of future military intervention',
          'A simple, decorative parade with no political meaning'
        ],
        correctIndex: 1,
        explanation: 'The display of fighter jets was not only a show of military precision but a demonstration of the military’s absolute loyalty to democracy and the newly formed non-racial government.'
      },
      {
        questionText: 'According to Mandela, what is South Africa’s greatest wealth?',
        options: ['Its minerals and diamonds', 'Its gold reserves', 'Its people, who are finer and truer than pure diamonds', 'Its vast, untouched forests'],
        correctIndex: 2,
        explanation: 'Mandela states that South Africa is rich in gems and gold, but its greatest and true wealth is its people, who are finer, truer, and more precious than the purest diamonds.'
      }
    ]
  }
];
