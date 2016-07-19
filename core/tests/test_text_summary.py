import json
import unittest
from core.factories import SequenceContentFactory
from core.api.v1.serializers import ContentSerializer
from text.summary import get_quote_sentences


class TestSummaryQuoteSentence(unittest.TestCase):
    def setUp(self):
        self.content = SequenceContentFactory()

    def set_content(self, content):
        self.content.extract['content'] = content

    def test_no_sentences(self):
        self.set_content('')
        quote_sentences = get_quote_sentences(self.content)
        #print(json.dumps(ContentSerializer(self.content).data, indent=2))
        self.assertEqual(quote_sentences, [])

    def test_no_quote(self):
        self.set_content('So she was considering in her own mind (as well as she could, for the hot day made her feel very sleepy and stupid), whether the pleasure of making a daisy-chain would be worth the trouble of getting up and picking the daisies, when suddenly a White Rabbit with pink eyes ran close by her.')
        quote_sentences = get_quote_sentences(self.content)
        self.assertEqual(quote_sentences, [])

    def test_no_quote_multiple(self):
        self.set_content('Down, down, down. There was nothing else to do, so Alice soon began talking again.')
        quote_sentences = get_quote_sentences(self.content)
        self.assertEqual(quote_sentences, [])

    def test_one_quote(self):
        self.set_content('"What a curious feeling!" said Alice.')
        quote_sentences = get_quote_sentences(self.content)
        self.assertEqual(len(quote_sentences), 1)
        self.assertEqual(quote_sentences[0], '"What a curious feeling!"')

    def test_multiple_quotes_one_sentence(self):
        self.set_content('''"No, I'll look first," she said, "and see whether it's marked 'poison' or not"; for she had read several nice little histories about children who had got burnt.''')
        quote_sentences = get_quote_sentences(self.content)
        self.assertEqual(len(quote_sentences), 1)
        self.assertEqual(quote_sentences[0], '''"No, I'll look first," she said, "and see whether it's marked 'poison' or not"; for she had read several nice little histories about children who had got burnt.''')

    def test_multiple_quotes_multiple_sentences_1(self):
        self.set_content('''"I will substitute," he said, "a letter of our alphabet for that of the Runic: we will then see what that will produce. Now, begin and make no mistakes."''')
        quote_sentences = get_quote_sentences(self.content)
        self.assertEqual(len(quote_sentences), 1)
        self.assertEqual(quote_sentences[0], '''"I will substitute," he said, "a letter of our alphabet for that of the Runic: we will then see what that will produce. Now, begin and make no mistakes."''')

    def test_multiple_quotes_multiple_sentences_2(self):
        self.set_content('''He said, "this is a test. Prepare yourselves. Go!"''')
        quote_sentences = get_quote_sentences(self.content)
        self.assertEqual(len(quote_sentences), 1)
        self.assertEqual(quote_sentences[0], '''He said, "this is a test. Prepare yourselves. Go!"''')
