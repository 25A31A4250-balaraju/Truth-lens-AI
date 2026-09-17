"""Tests for Milestone 11 Research Documentation and Academic Integrity."""

from pathlib import Path

DOCS_DIR = Path(__file__).resolve().parent.parent / "docs"


def test_research_documentation_files_exist():
    """Verify all 5 core academic documentation files exist and are populated."""
    expected_files = [
        "METHODOLOGY.md",
        "MODEL_CARDS.md",
        "DATASETS.md",
        "ETHICS_AND_LIMITATIONS.md",
        "EXPO_JUDGE_QA.md"
    ]
    assert DOCS_DIR.exists()
    assert DOCS_DIR.is_dir()

    for filename in expected_files:
        filepath = DOCS_DIR / filename
        assert filepath.exists(), f"Missing required documentation: {filename}"
        assert filepath.stat().st_size > 1500, f"Documentation file {filename} is too short ({filepath.stat().st_size} bytes)"


def test_methodology_mathematical_concepts():
    """Verify METHODOLOGY.md contains formal mathematical equations and concepts."""
    content = (DOCS_DIR / "METHODOLOGY.md").read_text(encoding="utf-8")
    assert "Discrete Fourier Transform" in content or "2D-FFT" in content
    assert "Disagreement Index" in content
    assert "SUSPECTED_OOD" in content
    assert "Laplacian" in content
    assert "Forensic Stability Index" in content


def test_model_cards_all_six_models():
    """Verify MODEL_CARDS.md defines specs for all 6 detection adapters."""
    content = (DOCS_DIR / "MODEL_CARDS.md").read_text(encoding="utf-8")
    models = ["Xception", "Effort", "LSDA", "F3Net", "SBI", "DINOv2"]
    for m in models:
        assert m in content, f"Model card missing for {m}"


def test_datasets_benchmarks():
    """Verify DATASETS.md includes historical and modern generative benchmarks."""
    content = (DOCS_DIR / "DATASETS.md").read_text(encoding="utf-8")
    assert "FaceForensics++" in content
    assert "Celeb-DF" in content
    assert "WildDeepfake" in content
    assert "Midjourney" in content or "SDXL" in content


def test_ethics_legal_admissibility():
    """Verify ETHICS_AND_LIMITATIONS.md discusses legal standards and false positive impacts."""
    content = (DOCS_DIR / "ETHICS_AND_LIMITATIONS.md").read_text(encoding="utf-8")
    assert "Daubert" in content
    assert "Probabilistic" in content
    assert "False Positive" in content or "false positive" in content
    assert "Adversarial" in content or "adversarial" in content


def test_expo_judge_qa_defense():
    """Verify EXPO_JUDGE_QA.md prepares for critical judge challenges."""
    content = (DOCS_DIR / "EXPO_JUDGE_QA.md").read_text(encoding="utf-8")
    assert "Vision Transformer" in content or "ViT" in content
    assert "CPU" in content
    assert "adversar" in content.lower()
    assert "uncertainty" in content.lower()
