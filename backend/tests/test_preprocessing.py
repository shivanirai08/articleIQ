"""Unit tests for text preprocessing (Objective O1)."""

from app.services.preprocessing import clean_text


def test_strip_html_and_entities() -> None:
    raw = "<p>Breaking&nbsp;news:</p><p>Markets rose today.</p>" + " " * 5 + "Analysts reacted."
    result = clean_text(raw)
    assert "<p>" not in result.cleaned_text
    assert "Breaking news:" in result.cleaned_text
    assert "html_stripped" in result.transformations_applied
    assert result.word_count >= 5


def test_collapse_whitespace() -> None:
    raw = "Word1   Word2\t\tWord3\n\n\n\nWord4"
    result = clean_text(raw)
    assert "  " not in result.cleaned_text
    assert "\n\n\n" not in result.cleaned_text
    assert "whitespace_normalized" in result.transformations_applied


def test_unicode_normalization() -> None:
    # NFKC: compatibility characters normalized
    raw = "ＡＢＣ" + " " + "café"
    result = clean_text(raw)
    assert result.cleaned_character_count > 0
    assert isinstance(result.transformations_applied, list)
