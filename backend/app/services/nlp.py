"""Classical NLP orchestration — tokenization & sentence segmentation (Checkpoint 8).

Purpose:
  Run cleaned article text through spaCy and extract linguistic structure.

Pipeline:
  raw text → preprocessing.clean_text() → spaCy Doc → tokens + sentences

Real-world analogy:
  Preprocessing washed the vegetables; spaCy is the knife that cuts them into
  bite-sized pieces (tokens) and plates them by course (sentences).
"""

from __future__ import annotations

from dataclasses import dataclass

from app.adapters.spacy_nlp import get_spacy_nlp
from app.core.config import get_settings
from app.services.preprocessing import clean_text


@dataclass(frozen=True)
class TokenInfo:
    index: int
    text: str
    lemma: str
    pos: str
    is_alpha: bool
    is_stop: bool


@dataclass(frozen=True)
class SentenceInfo:
    index: int
    text: str
    start_char: int
    end_char: int


@dataclass(frozen=True)
class NlpAnalysisResult:
    spacy_model: str
    cleaned_character_count: int
    token_count: int
    sentence_count: int
    sentences: list[SentenceInfo]
    tokens: list[TokenInfo]
    tokens_truncated: bool


def analyze_text(text: str) -> NlpAnalysisResult:
    """Preprocess text, then tokenize and segment sentences with spaCy.

    Input:
      Raw article string (may contain HTML — cleaned first).

    Output:
      NlpAnalysisResult with token and sentence lists.

    Execution flow:
      1. clean_text(text)
      2. nlp(cleaned_text) → Doc
      3. Iterate doc.sents for sentences
      4. Iterate doc for tokens with linguistic annotations

    Time complexity: O(n) for spaCy pipeline on text length n.
    """
    settings = get_settings()
    cleaned = clean_text(text).cleaned_text
    doc = get_spacy_nlp()(cleaned)

    sentences = [
        SentenceInfo(
            index=index,
            text=sent.text.strip(),
            start_char=sent.start_char,
            end_char=sent.end_char,
        )
        for index, sent in enumerate(doc.sents)
    ]

    all_tokens = [
        TokenInfo(
            index=token.i,
            text=token.text,
            lemma=token.lemma_,
            pos=token.pos_,
            is_alpha=token.is_alpha,
            is_stop=token.is_stop,
        )
        for token in doc
    ]

    preview_limit = settings.spacy_token_preview_limit
    tokens_truncated = len(all_tokens) > preview_limit
    tokens = all_tokens[:preview_limit]

    return NlpAnalysisResult(
        spacy_model=settings.spacy_model,
        cleaned_character_count=len(cleaned),
        token_count=len(all_tokens),
        sentence_count=len(sentences),
        sentences=sentences,
        tokens=tokens,
        tokens_truncated=tokens_truncated,
    )
