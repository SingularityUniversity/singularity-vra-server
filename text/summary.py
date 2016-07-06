from text.common import extract_words_from_content
from nltk.probability import FreqDist

def get_summary_sentences(content, num_sentences=10):
    words = extract_words_from_content(content)
    word_results = extract_words_from_content(content, with_sentences=True)

    if word_results == []:
        return []
    else:
        (raw_sentences, parsed_sentences) = word_results

    freqdist = FreqDist(words)

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
