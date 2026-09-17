# DEEPTRACE-X: Adaptive Multi-Signal AI Image Forensics Platform

[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Linux-lightgrey.svg)]()
[![Hardware](https://img.shields.io/badge/inference-Host%20CPU%20(Intel%20i5)-blue.svg)]()
[![Backend](https://img.shields.io/badge/backend-FastAPI%20%2B%20SQLite-009688.svg)]()
[![Frontend](https://img.shields.io/badge/frontend-React%2018%20%2B%20TS%20%2B%20Vite-61dafb.svg)]()
[![Tests](https://img.shields.io/badge/tests-59%20passed%20(100%25)-brightgreen.svg)]()
[![Milestones](https://img.shields.io/badge/milestones-1%20through%2012%20COMPLETE-emerald.svg)]()

> **Research Hypothesis**: Combining orthogonal spatial, frequency, semantic, and boundary representations within a quality-conditioned probabilistic framework provides a significantly more robust, interpretable, and generalization-resilient image-forensics system than monolithic end-to-end classifiers.

DEEPTRACE-X is an academic research platform built for a 2nd-year CS/ML college expo. It is specifically engineered to run efficiently on a local consumer laptop (Intel Core i5, 16 GB RAM, integrated graphics) without requiring a dedicated CUDA GPU, utilizing sequential lazy-loaded model inference and memory reclamation.

---

## ⚡ Quickstart: One-Click Expo Presentation Launcher

To run both the backend and frontend simultaneously and launch the browser immediately:

### Option A: Double-Click Batch File (Windows)
Double-click `run_workstation.bat` in File Explorer.

### Option B: PowerShell
```powershell
.\run_workstation.ps1
```

- **Forensic Workstation UI**: `http://localhost:5173`
- **FastAPI Interactive Docs**: `http://127.0.0.1:8000/docs`

---

## 🔬 Multi-Signal Forensic Modalities

DEEPTRACE-X decomposes image forensics across four complementary physical domains:

| Modality | Core Detectors / Metrics | Physical Manipulation Traces Detected |
|---|---|---|
| **Spatial** | Effort (ConvNeXt), LSDA, 4x4 Patch Variance ($\sigma_{\text{patch}}^2$) | Pixel-level generation artifacts, texture inconsistencies across local patches |
| **Frequency** | Mathematical 2D-FFT Centered Magnitude Spectrum, F3Net | Periodic checkerboard upsampling artifacts, high-to-low radial energy ratios ($\gamma$), spectral entropy |
| **Boundary** | SBI (Self-Blended Images), OpenCV 25% Margin Facial Crop | Color mismatches, blurred boundary transition seams around hairline and jawline |
| **Semantic** | DINOv2 ViT-Small/14 384-D Embeddings, Manifold Cosine Distance ($d_{\text{ood}}$) | Out-of-distribution detection for novel generative models (SDXL, Midjourney, FLUX) $\to$ `SUSPECTED_OOD` |

---

## 🏆 College Expo Judge 60-Second Demo Playbook

When presenting to professors or judges at the expo:

1. **Click the `Expo Live Demo` tab (`Sparkles` icon)** in the sidebar.
2. **Click Case C (Fourier Spectral Lattice)**:
   - Point to the **2D-FFT magnitude spectrum**: Show the symmetrical energy spikes caused by generator upsampling.
   - Point to the **Fusion Share breakdown**: Show how the Frequency Modality dynamically took the dominant share (~48%).
3. **Click Case D (Unseen Diffusion OOD)**:
   - Show how traditional spatial classifiers struggle, but the **DINOv2 Foundation Manifold** registers a $> 65\%$ anomaly distance.
   - Point to the **4th State Verdict**: `SUSPECTED_OOD`. Explain why binary Real/Fake classification is dangerous on unseen generators.
4. **Scroll to the `Robustness & Stress Testing Lab` deck**:
   - Point to the real-time perturbation curves (JPEG 90/70/50, noise, blur).
   - Show the **Forensic Stability Index ($S$)** certifying whether forensic evidence survives social media compression.
5. **Click `Export Court Dossier`**:
   - Download the court-admissible forensic audit certificate in Markdown (`.md`) or JSON (`.json`) with cryptographic SHA-256 custody hashes.

---

## 📁 System Architecture & Directory Layout

```
DEEPFAKE-X/
├── backend/
│   ├── api/                   # FastAPI endpoints (analysis, health, models, expo)
│   ├── config.py              # Central runtime configuration & storage paths
│   ├── database/              # SQLite ORM models (analyses, predictions, evidence)
│   ├── models/                # 6 modular adapters (Xception, Effort, LSDA, F3Net, SBI, DINOv2)
│   ├── schemas/               # Pydantic validation schemas
│   ├── services/              # Forensic services (FFT, Quality, Evidence, OOD, Fusion, Robustness, Expo, Report)
│   ├── utils/                 # SHA-256 custody, profiler, logging
│   └── main.py                # Application entrypoint
├── docs/                      # Academic Research Suite (Milestone 11)
│   ├── METHODOLOGY.md         # Comprehensive mathematical formulations
│   ├── MODEL_CARDS.md         # Mitchell et al. (2019) model cards for all 6 detectors
│   ├── DATASETS.md            # Benchmark guide (FF++, Celeb-DF, WildDeepfake, Diffusion)
│   ├── ETHICS_AND_LIMITATIONS.md # Daubert legal standards, false positive mitigation
│   └── EXPO_JUDGE_QA.md       # 12 tough technical questions & answers for expo judges
├── frontend/
│   ├── src/
│   │   ├── api/               # Typed Axios client
│   │   ├── components/        # Workstation UI components (dropzone, consensus, OOD, fusion, robustness, expo, docs)
│   │   └── App.tsx            # Main forensic workstation dashboard
│   ├── package.json
│   └── vite.config.ts
├── data/
│   ├── deeptrace.db           # Cryptographic audit database (SQLite)
│   ├── expo/                  # Auto-seeded benchmark demonstration images
│   └── uploads/               # Immutable forensic custody storage
├── tests/                     # Comprehensive pytest test suite (16 modules)
├── run_workstation.bat        # Double-click Windows launcher
├── run_workstation.ps1        # PowerShell automated launcher
├── PROJECT_PLAN.md            # 12-milestone research master plan
└── README.md
```

---

## 📊 Completed Milestone Roadmap (100% Complete)

| Milestone | Scope | Key Deliverable | Status |
|---|---|---|---|
| **Milestone 1** | Foundation & Base Workstation | FastAPI, SQLite custody schema, safe image ingestion, React 18 UI | **Completed** |
| **Milestone 2** | Image Pipeline & Preprocessing | OpenCV CPU face detection, 25% margin crop, whole-frame fallback, 4x4 patch grid | **Completed** |
| **Milestone 3** | Pretrained Detectors | Modular adapters: Xception, Effort, LSDA, F3Net, SBI, DINOv2 with memory unmounting | **Completed** |
| **Milestone 4** | Frequency & Quality Signals | Mathematical 2D-FFT power spectrum, radial band ratios, Laplacian sharpness | **Completed** |
| **Milestone 5** | Evidence Calibration | Ensemble Disagreement Index ($D = 2\sigma$), quality-conditioned uncertainty calibration | **Completed** |
| **Milestone 6** | OOD & Uncertainty Engine | DINOv2 frozen 384-D embeddings, manifold cosine distance, 4th verdict: `SUSPECTED_OOD` | **Completed** |
| **Milestone 7** | Multi-Signal Fusion Engine | Interpretable linear fusion layer, exact modal percentage shares ($C_{\text{spatial}}, C_{\text{freq}}, C_{\text{bound}}, C_{\text{sem}}$) | **Completed** |
| **Milestone 8** | Robustness & Stress Lab | 5-stage perturbation suite (JPEG 90/70/50, noise, blur, downsampling), Stability Index ($S$) | **Completed** |
| **Milestone 9** | Forensic Audit Reporting | Court-grade Markdown audit dossiers and JSON cryptographic certificates | **Completed** |
| **Milestone 10** | Expo Presentation Mode | 1-minute judge demonstration suite with 4 preloaded challenge benchmark cases | **Completed** |
| **Milestone 11** | Research Documentation | Academic methodology, model cards, dataset guides, Daubert legal ethics, judge defense Q&A | **Completed** |
| **Milestone 12** | Final Polish & Tuning | Memory retention profiling ($< 450$ MB RSS), extreme boundary stress testing, one-click launcher | **Completed** |

---

## 🧪 Automated Testing & Verification

Run the entire automated test suite:

```powershell
.\.venv\Scripts\python -m pytest tests -v
```

All **59 tests pass** in under 7 seconds, verifying:
- Safe image ingestion and SHA-256 reproducibility
- 2D-FFT frequency domain mathematics and concentric radial energy ratios
- Ensemble disagreement calculation and quality attenuation
- DINOv2 foundation embedding extraction and out-of-distribution manifold triggers
- 4-modality fusion and exact contribution share computations
- Robustness perturbation transforms and stability index formulation
- Forensic report generation and download routes
- Expo demonstration cases and benchmark seeding
- Academic documentation integrity across all 5 markdown treatises
- Low-memory footprint retention ($< 450$ MB RSS) across repeated forward evaluations
- Extreme aspect ratio boundary stress tests ($1600 \times 200$, $200 \times 1600$, $32 \times 32$)
