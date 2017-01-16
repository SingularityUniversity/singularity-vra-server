'''
USAGE:
# Get or create the ndict, lda_model and lda_sims
# create, by reading all the content objects in the db
# alternatively, and in production, these are serialized and read from disk on startup
nbow, ndict, lda_model, lda_sims = text.common.make_lda()
bow = ndict.doc2bow(text.common.tokenize_text_block(plain_text_block_compare))
vec_lda = lda_model[bow]

# Get a vector scoring every document in the content objects corpus against comparison doc
lda_sims[vec_lda]
'''
import re
from bs4 import BeautifulSoup

import nltk
from nltk.stem import PorterStemmer
from gensim import corpora, models, similarities
from text.stopwords import stopwords
from contexttimer import timer
from threading import Lock

from core.models import Content, LDAConfiguration
from tempfile import mkdtemp
import pickle
from os import path

nltk.data.path.append('data/nltk')

LDA_DATA_DIR = 'loaded_data/lda'

_NDICT, _LDA_MODEL, _LDA_SIMILARITIES, _ID_MAP = None, None, None, None
_lda_lock = Lock()


def get_lda_data():
    global _NDICT, _LDA_MODEL, _LDA_SIMILARITIES, _ID_MAP
    with _lda_lock:
        if _NDICT is None:
            _NDICT, _LDA_MODEL, _LDA_SIMILARITIES, _ID_MAP = retrieve()
    return _NDICT, _LDA_MODEL, _LDA_SIMILARITIES, _ID_MAP


def tokenize_text_block(block):
    '''
    Takes a whitepsace-separate list of words and returns a list of
    stemmed, normalized words
    '''
    text = nltk.word_tokenize(block)
    tokenized_text = []
    # turn compound words into individual words
    for word in text:
        # print('{} {}'.format(word, re.split('W+', word)))
        tokenized_text.extend(re.split('\W+', word))
    # print(len(tokenized_text))
    # lowercase and get rid of stopwords
    tokenized_text = [word.lower() for word in tokenized_text if
                      word != '' and
                      word.lower() not in stopwords and
                      re.match('^\d{1,2}$', word) is None]

    # stem or lemmatize
    # lemmatizer = WordNetLemmatizer()
    # tokenized_text = [lemmatizer.lemmatize(word) for word in tokenized_text]
    stemmer = PorterStemmer()
    tokenized_text = [stemmer.stem(word) for word in tokenized_text]
    assert tokenized_text != [None], "Tokenized text is {}".format(tokenized_text)
    return tokenized_text


# XXX: Refactor me, kinda ugly to have different result types depending on parameters
def extract_words_from_content(content, with_sentences=False, with_sentences_only=False):
    raw_html = content.extract['content']

    if (raw_html is not None):
        soup = BeautifulSoup(raw_html, 'html5lib')
        for unwanted_element in soup.findAll(['script', 'style', 'img', 'embed']):
            unwanted_element.decompose()
        text = soup.get_text()

        if with_sentences_only:
            sentences = nltk.sent_tokenize(text)
            result = sentences
        elif with_sentences:
            sentences = nltk.sent_tokenize(text)
            result = (sentences, [tokenize_text_block(sentence) for sentence in sentences])
        else:
            result = tokenize_text_block(text)
        assert result is not None, "Got None from {}".format(result)
        return result
    else:
        return []  # XXX: Some docs have no content


@timer()
def make_nbow_and_dict(content_iterator):
    '''
    Given an ordered list of content, create a bow list (index == index from iterator)
    and a corpora.Dictionary, and also return a mapping from nbow index to content.id (id_map)
    '''

    # The elements in doc_words and id_map have to correspond one-one in the same order
    doc_words = [extract_words_from_content(content) for content in content_iterator
                 if content.extract['content'] not in (None, '')]
    # XXX: not efficient to go through content_iterator again?
    id_map = [content.id for content in content_iterator
              if content.extract['content'] not in (None, '')]
    ndict = corpora.Dictionary([word_list for word_list in doc_words])
    nbow = [ndict.doc2bow(doc) for doc in doc_words]

    return (nbow, ndict, id_map)


@timer()
def make_lda_model(nbow, ndict):
    '''
    Build an LDA model from the normalized BoW and the associated corpora.Dictionary
    '''

    # XXX: For now, we'll read in the LDA config vars here, but we may want those config
    # vars elsewhere, so we may need to read it in somewhere outside this function instead
    config = LDAConfiguration.get_solo()
    lda_model = models.ldamodel.LdaModel(nbow, id2word=ndict,
                                         num_topics=config.num_topics,
                                         passes=config.lda_passes)
    return lda_model


@timer()
def make_lda_similarities(nbow, lda_model):
    '''
    Build a Similarity Matrix
    '''
    return similarities.MatrixSimilarity(lda_model[nbow])


def make_all_lda():
    '''
    Just for testing - probably don't want to keep everything in memory?
    '''
    print('loading docs')
    all_docs = Content.objects.all()
    print('docs loaded')
    nbow, ndict, id_map = make_nbow_and_dict(all_docs)
    lda_model = make_lda_model(nbow, ndict)
    lda_similarities = make_lda_similarities(nbow, lda_model)

    return (nbow, ndict, lda_model, lda_similarities, id_map)


def make_and_store():
    '''
    This probably doesn't scale, as we read everything into memory and then
    write it out.

    XXX: Make this scale
    '''
    nbow, ndict, lda_model, lda_similarities, id_map = make_all_lda()
    print((nbow, ndict, lda_model, lda_similarities, id_map))

    temp_dir = mkdtemp()
    with open(path.join(temp_dir, "id_map.gensim"), "wb") as id_map_file:
        pickle.dump(id_map, id_map_file)

    ndict.save(path.join(temp_dir, "dictionary.gensim"), pickle_protocol=4)

    lda_model.save(path.join(temp_dir, "lda_model.gensim"))
    lda_similarities.save(path.join(temp_dir, "lda_similarities.gensim"))

    return temp_dir, nbow, ndict, lda_model, lda_similarities, id_map


def retrieve():
    '''
    Returns ndict, lda_model, lda_similarities and the id_map given a directory
    '''
    with open(path.join(LDA_DATA_DIR, "id_map.gensim"), "rb") as id_map_file:
        id_map = pickle.load(id_map_file)

    ndict = corpora.Dictionary.load(path.join(
        LDA_DATA_DIR, "dictionary.gensim"))
    lda_model = models.ldamodel.LdaModel.load(
        path.join(LDA_DATA_DIR, "lda_model.gensim"))
    lda_similarities = similarities.MatrixSimilarity.load(
        path.join(LDA_DATA_DIR, "lda_similarities.gensim"))
    return ndict, lda_model, lda_similarities, id_map
