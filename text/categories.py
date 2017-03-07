import re
from functools import lru_cache
from nltk.util import bigrams
from nltk.stem import PorterStemmer
from text.stopwords import stopwords


# grand global challenges
energy = ['energy', 'fossil', 'fuel', 'solar', 'geothermal', 'hydroelectric',
          'dam', 'atomic', 'nuclear', 'fusion', 'gravitational', 'magnetic',
          'transmission', 'battery', 'combustion', 'gas', 'oil', 'wind',
          'coal', 'voltage', 'petroleum', 'tidal', 'turbine', 'photovoltiac',
          'thermoelectric', 'piezoelectric', 'electricity', 'greenhouse',
          'pollution']
environment = ['environment', 'ecosystem', 'bioshpere', 'biome', 'sustainable',
               'farm', 'organic', 'stewardship', 'ecology', 'water', 'earth',
               'pollution', 'waste', 'sewage', 'water', 'food', 'green',
               'atmosphere', 'ocean', 'greenhouse', 'climate', 'oil', 'pollutant',
               'leak', 'soil', 'contaminate', 'biota', 'erosion', 'runoff']
#food = []
#shelter = []
space = ['space', 'rocket', 'star', 'planet', 'asteroid', 'mars', 'moon', 'sun',
         'mercury', 'venus', 'jupiter', 'saturn', 'neptune', 'uranus', 'pluto',
         'planetoid', 'ganymede', 'europa', 'ftl', 'comet', 'astonomy', 'spacex',
         'nasa', 'esa', 'iss', 'cape canaveral', 'apollo', 'orbit', 'capsule',
         'solar', 'galaxy', 'universe', 'black hole', 'pulsar', 'milky way',
         'andromeda', 'astrophysics', 'telescope', 'brown dwarf', 'hubble',
         'fermi paradox', 'cosmology', 'cosmos', 'satellite', 'seti',
         'space station']
water = ['water', 'rain', 'fog', 'ocean', 'river', 'stream', 'dam', 'watershed',
         'lake', 'sea', 'vapor', 'ice', 'evaporate', 'freshwater',
         'groundwater', 'glacier', 'iceberg', 'thirst', 'hydrate', 'sanitation',
         'cloud', 'hydrography', 'oceanography', 'hydrogeology', 'glaciology',
         'limnology', 'ecohydrology', 'canal', 'pond', 'puddle', 'hot spring',
         'geyser', 'well', 'potable', 'filtration', 'distillation', 'sewage',
         'blackwater', 'wastewater', 'irrigation', 'dehydration',
         'aqueduct', 'rainwater', 'cistern', 'distillation', 'runoff']
#disaster_resilience = []
governance = ['governance', 'government', 'politics', 'president',
              'prime minister', 'senate', 'congress', 'law', 'leader',
              'society', 'rights', 'individual', 'justice', 'prejudice',
              'racism', 'hate', 'discrimination', 'cabinet', 'united nations',
              'state', 'legislation', 'constitution', 'monarchy', 'dictator',
              'parliment', 'federal', 'globalization', 'global', 'communisim',
              'democracy', 'monarchy', 'corruption', 'liberatarian']
health = ['health', 'illness', 'diagnose', 'treat', 'healthcare', 'disease',
          'biomarker', 'heart', 'brain', 'cancer', 'parkinson', 'neuroscience',
          'cortex', 'prosthetic', 'sick', 'diabetes', 'blood', 'age', 'fertility',
          'ivf', 'embryo', 'drug', 'surgery', 'medical', 'doctor', 'nurse', 'stem',
          'bioethic']
learning = ['learning', 'learn', 'teach', 'school', 'university', 'college',
            'study', 'literacy', 'student', 'knowledge', 'habituation',
            'sensitization', 'conditioning', 'enculturation', 'multimedia',
            'textbook', 'book', 'article', 'journal', 'e-learning', 'educate',
            'kindergarten', 'pre-school', 'seminary', 'train', 'homeschool',
            'classroom', 'class']
#prosperity = []
#security = []

# exponential technologies
ai = ['ai', 'artificial intelligence', 'machine learning', 'deep learning',
      'neural net', 'neural network', 'support vector', 'decision tree',
      'random forest', 'chatbot', 'agent', 'ocr', 'character recognition',
      'self-driving', 'nlp', 'natural language processing', 'evolutionary algorithms',
      'genetic algorithms', 'swarm intelligence', 'emergent behavior',
      'learning', 'supervised learning', 'unsupervised learning', 'planning'
      'reinforcement learning', 'decision theory', 'classification',
      'regression', 'machine translation', 'computer vision', 'recognition',
      'artificial intuition', 'artificial consciousness', 'bayesian',
      'perception', 'markov', 'game theory', 'logistic', 'discriminant',
      'kernel', 'bias', 'variance', 'training', 'naive bayes', 'cross-validation',
      'boosting', 'gradient', 'k-means', 'nearest neighbor', 'ensemble learning',
      'predict', 'forecast', 'open.ai', 'nvidia', 'cuda', 'watson']
vr = ['vr', 'virtual reality', 'ar', 'augmented reality', '']
#data_science = []
#digital_biology = []
biotech = ['biotech', 'biotechnology', 'bioprint', 'synthetic', 'conductive',
           'stem', 'genomics', 'biological engineering', 'bioengineering',
           'sequencing', 'gene', 'genome', 'genetic', 'chromosome', 'chromosomal',
           'biohack', 'biology', 'biological', 'human body', 'bionic']
medicine = ['health', 'illness', 'diagnose', 'treat', 'healthcare', 'disease',
            'biomarker', 'heart', 'brain', 'cancer', 'parkinson', 'neuroscience',
            'cortex', 'prosthetic', 'sick', 'diabetes', 'blood', 'age', 'fertility',
            'ivf', 'embryo', 'drug', 'surgery', 'medical', 'doctor', 'nurse',
            'bioethic', 'stem', 'gene', 'genome', 'genetic', 'chromosome',
            'biology', 'biological', 'human body']
nanotech = ['nanotech', 'nanotechnology', 'animat', 'assembler', 'atomic',
            'biomimetic', 'condensate', 'brownian', 'fullerene', 'bucky ball',
            'nanotube', 'molecular', 'nanoscale', 'convergent assembly',
            'self-assembly', 'nanomedicine', 'nanoelectronics', 'nanomaterials',
            'nanomechanics', 'nanophotonics', 'nanoionics', 'biomaterial',
            'substrate', 'protein folding', 'nanomotor', 'quantum dot',
            'nanolithography', 'deposition', 'ald', 'nanoelectromechanical',
            'nems', 'ion beam', 'nanorobotics', 'programmable matter',
            'nanoparticle']
digital_fabrication = ['digital fabrication', '3d printing', 'additive manufacturing',
                       'binder jetting', 'deposition', 'material extrusion',
                       'material jetting', 'bed fusion', 'lamination',
                       'photopolymerization', 'fabrication', 'laser melting',
                       'filament fabrication', 'SLM', 'FDM', 'SLM', 'SLS',
                       'sintering', 'laminated object', 'LOM']
#networks = []
computing_systems = ['computer', 'compute', 'network', 'internet', 'web',
                     'moore\'s law', 'bandwidth', 'wifi', 'autonomous',
                     'quantum', 'supercomputer', 'cluster', 'privacy',
                     'security', 'software', 'virtual reality', 'vr',
                     'gaming', 'open source', 'google', 'apple', 'mobile',
                     'cell phone', 'tablet', 'laptop', '']
robotics = ['robotics', 'robot', 'drone', 'self driving', 'self-driving car', 'automation',
            'driverless', 'autonomous', 'avt']

categories = {
    'energy': energy,
    'environment': environment,
    #'food': food,
    #'shelter': shelter,
    'space': space,
    'water': water,
    #'disaster resiliance': disaster_resiliance,
    'governance': governance,
    'health': health,
    'learning': learning,
    #'prosperity': prosperity,
    #'security': security,
    'AI': ai,
    'VR': vr,
    #'data science': data_science,
    #'digital biology': digital_biology,
    'biotech': biotech,
    'medicine': medicine,
    'nanotech': nanotech,
    'digital fabrication': digital_fabrication,
    #'networks': networks,
    'computing systems': computing_systems,
    'robotics': robotics
}

def tokenize_word_list(words):
    stemmer = PorterStemmer()
    tokenized_words = []
    # XXX: very similar to code in text.common.tokenize_text_block
    #      Refactor?
    for word in words:
        # includes n-grams, so make sure to handle
        word_list = re.split('\W+', word)
        tmp_words = [w.lower() for w in word_list if
                           w != '' and
                           w.lower() not in stopwords and
                           re.match('^\d{1,2}$', w) is None]
        tmp_words = [stemmer.stem(w) for w in tmp_words]
        if len(tmp_words) == 1:
            tokenized_words.append(tmp_words[0])
        else:
            tokenized_words.append(tuple(tmp_words))
    return tokenized_words


@lru_cache(maxsize=1)
def get_category_ngrams():
    category_ngrams = {}
    for key in categories:
        category_ngrams[key] = tokenize_word_list(categories[key])
    return category_ngrams


@lru_cache(maxsize=1)
def get_category_keywords():
    return list(categories.keys())
