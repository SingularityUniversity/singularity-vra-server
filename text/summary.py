from text.common import extract_words_from_content
from nltk.probability import FreqDist
from itertools import chain
from text.categories import get_category_ngrams, get_category_keywords


def get_summary_sentences(content, num_sentences=10):
    word_results = extract_words_from_content(content, with_sentences=True)

    if word_results == []:
        return []
    else:
        (raw_sentences, parsed_sentences) = word_results

    all_words = list(chain.from_iterable(parsed_sentences))

    freqdist = FreqDist(all_words)

    topic_sentences_words = []
    topic_sentences = []
    for (word, count) in freqdist.most_common():
        if len(topic_sentences) >= num_sentences:
            break
        for (position, sentence) in enumerate(parsed_sentences):
            if word in sentence and sentence not in topic_sentences_words:
                topic_sentences_words.append(sentence)
                topic_sentences.append(raw_sentences[position].strip())
                break

    return topic_sentences


def get_quote_sentences(content, num_sentences=10):
    '''
    Return list of sentences with embedded quotes.  If the quotes span sentences,
    accumulate them and treat them as a single sentence.
    '''
    quote_sentences = []
    raw_sentences = extract_words_from_content(content, with_sentences_only=True)
    quote_state = False
    for sentence in raw_sentences:
        quote_count = sentence.count('"')
        if quote_state is True:  # we're in a quote, so accumulate and then emit
            accumulated_sentence = ' '.join([accumulated_sentence, sentence])
            if quote_count % 2 != 0:
                # a sentence that ends the quote -- emit
                # (otherwise, just keep accumulating)
                quote_sentences.append(accumulated_sentence)
                quote_state = False
        else:  # we're not in a quote, so only emit if a complete quote,
               # transition to in quote if not a complete quote, or skip
            if quote_count > 0 and quote_count % 2 == 0:
                # have a sentence with one or more complete quotes -- so emit
                quote_sentences.append(sentence)
            elif quote_count % 2 != 0:
                # have a sentence that starts but doesn't finish a quote -- so go to
                # in quote state and begin accumulating
                accumulated_sentence = sentence
                quote_state = True
    return quote_sentences


def get_category_tags(content, num_tags=3):
    '''
    Return list of tags for document in order of score.

    This uses a simple algorithm to determine the categories.  Categories
    are defined by a number of keywords (see text.categories).  The text of a
    document is broken into 1- and 2-grams and then a frequency distribution
    is calculated.  A score for each potential tag is calculated by summing
    the frequency count for each keyword that is matched in the document.  Only
    tags with a score greater than 5 are considered.
    '''
    word_results = extract_words_from_content(content, with_bigrams=True)
    ngram_frequency = FreqDist(word_results)
    if word_results == []:
        return []

    tags = {}
    category_ngrams = get_category_ngrams()
    for key in get_category_keywords():
        score = 0
        for keyword in category_ngrams[key]:
            score += ngram_frequency[keyword]
        if score > 5:
            tags[key] = score
    return sorted(tags, key=lambda x: -tags[x])[:num_tags]
