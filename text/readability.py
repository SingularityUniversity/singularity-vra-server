from text.common import extract_words_from_content
from readability import getmeasures
from django.db.models import Avg
from django.db.models.expressions import RawSQL
from core.models import Content, Publisher
from django.forms.models import model_to_dict

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

def build_publisher_readability_stats():
    readability =  {
        'readability_grades': (
            'ARI',
            'Kincaid',
            'RIX',
            'SMOGIndex',
            'LIX',
            'FleschReadingEase',
            'GunningFogIndex',
            'Coleman-Liau',
        ),
        'sentence_beginnings': (
            'subordination',
            'pronoun',
            'interrogative',
            'conjunction',
            'article',
            'preposition',
        ),
        'word_usage': (
            'tobeverb',
            'auxverb',
            'pronoun',
            'nominalization',
            'conjunction',
            'preposition',
        ),
        'sentence_info': (
            'long_words',
            'words',
            'wordtypes',
            'characters_per_word',
            'syll_per_word',
            'syllables',
            'complex_words',
            'sentences_per_paragraph',
            'characters',
            'words_per_sentence',
            'type_token_ratio',
            'sentences',
            'paragraphs',
        )
    }

    readability_annotations = {}
    for level_one in readability.keys():
        for level_two in readability[level_one]:
            field_name = "readability__"+level_one+"__"+level_two
            selector = Avg(RawSQL("(pre_processed->'readability'->'"+level_one+
                                  "'->>'"+level_two+"')::decimal", []))
            readability_annotations[field_name] = selector
    return Content.objects.values('publisher_id').annotate(**readability_annotations)

def update_publisher_readability_stats():
    stats = build_publisher_readability_stats()
    for item in stats:
        publisher_id = item['publisher_id']
        if publisher_id is not None:
            publisher = Publisher.objects.get(pk=publisher_id)
            if publisher is not None:
                readability_statistics = {}
                for key in item.keys():
                    if key.startswith('readability'):
                        parts = key.split('__')
                        readability_statistics.setdefault(parts[1], {})[parts[2]] = \
                            float(item[key])
                publisher.statistics['readability'] = readability_statistics
                publisher.save()
