# DEEPTRACE-X: Adaptive Multi-Signal AI Image Forensics Platform
## Project Master Plan & Milestone Tracking

**Research Hypothesis**:
> *"Combining complementary spatial, frequency, semantic, and manipulation-specific representations can provide a more robust and interpretable image-forensics system than relying on a single deepfake classifier."*

---

### Hardware Target & Operational Constraints
- **Platform**: Local Windows laptop (Intel Core i5-1334 class, 16 GB RAM, Intel Iris Xe / Integrated Graphics, ~954 GB SSD).
- **Inference Mode**: CPU execution, lazy-loaded models, sequential evaluation, memory-conscious execution (unload heavyweight layers).
- **Heavy Training**: Cloud GPU (Google Colab) for any model tuning or calibration.
- **Visual Design**: Professional digital forensics / scientific security workstation. No purple-neon gradients, no cyberpunk aesthetics, strictly semantic indicators.

---

### Milestone Roadmap

| Milestone | Scope | Target Deliverable | Status |
|---|---|---|---|
| **Milestone 1** | **Foundation & Base Workstation** | FastAPI backend, SQLite schema, safe image ingestion pipeline, modular model registry, React/TypeScript/Vite forensics UI, tests | **Completed** |
| **Milestone 2** | **Image Pipeline & Preprocessing** | Image validation, RGB normalization, CPU face detection with 25% margin, no-face whole-frame fallback, 4x4 patch grid, interactive UI overlays | **Completed** |
| **Milestone 3** | **Pretrained Detectors** | Modular integration of Xception (baseline), Effort, F3Net, LSDA, and SBI with graceful fallback | **Completed** |
| **Milestone 4** | **Forensic Signals** | Genuine 2D-FFT/DCT frequency analysis, spectral entropy, patch-level suspicious region ranking, image quality metrics | **Completed** |
| **Milestone 5** | **Evidence Engine** | Statistical consensus, model disagreement score calculation, weighted calibration, transparent breakdown | **Completed** |
| **Milestone 6** | **OOD & Uncertainty Engine** | DINOv2 frozen feature representation, reference distance calculation, 4-state verdict classification | **Completed** |
| **Milestone 7** | **Fusion Engine** | Lightweight interpretable fusion layer (Logistic Regression / Ridge calibration), validation metrics | **Completed** |
| **Milestone 8** | **Robustness Lab** | Controlled perturbation experiments (JPEG compression, Gaussian noise, blur, resizing) with metric deltas | **Completed** |
| **Milestone 9** | **Forensic Reporting** | Automated downloadable forensic audit report (PDF / JSON / Markdown) with scientific disclaimers | **Completed** |
| **Milestone 10** | **Expo Presentation Mode** | 1-2 minute streamlined interactive demonstration workflow (`/expo`) with before/after challenge flow | **Completed** |
| **Milestone 11** | **Research Documentation** | Academic methodology documentation, model cards, dataset guides, ethical impact, judge Q&A preparation | **Completed** |
| **Milestone 12** | **Final Polish & Performance Tuning** | RAM footprint optimization, inference latency profiling, end-to-end stress testing | **Completed** |

---

### Key Architectural Guidelines
1. **No Fake Buzzwords & No Fabricated Scores**: All scores originate from verified inference or clear fallback states.
2. **Probabilistic Communication**: The UI explicitly states that assessments are probabilistic technical evaluations, not definitive proof of manipulation.
3. **Graceful Degradation**: If a model checkpoint is absent, the system flags that module as unavailable and continues multi-signal analysis using remaining detectors.
