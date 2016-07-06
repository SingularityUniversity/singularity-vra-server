from text.common import extract_words_from_content
from readability import getmeasures

def get_readability_scores(content):
    # XXX: We actually apparently only use the sentences, not the tokenized_sentencs
    sentences = extract_words_from_content(content, with_sentences_only=True)

    if sentences  == []:
        return {}
    else:
        # A bit lame, but lets map top-level key names spaces->underscore
        results = {
            key.replace(' ', '_'): value for (key, value) in getmeasures(sentences).items()
        }
        return results 
    

