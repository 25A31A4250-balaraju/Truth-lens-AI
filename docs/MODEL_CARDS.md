# DEEPTRACE-X: Forensic Model Cards
## Technical Specifications, Inductive Biases, & Failure Modes

**Format Standard**: Mitchell et al. (2019) *Model Cards for Model Reporting*  
**System**: DEEPTRACE-X Multi-Signal Image Forensics Platform  
**Target Environment**: Intel Core i5-1334 (CPU-Only Execution, 16 GB Host RAM)  

---

## Model Index

| Model Identifier | Primary Signal Modality | Architecture Family | Input Tensor | Checkpoint File | Default Status |
|---|---|---|---|---|---|
| **Xception Baseline** | Spatial Benchmark | Depthwise Separable CNN | `(1, 3, 299, 299)` | `xception_ffpp.pth` | Standby / Optional |
| **Effort Primary** | Spatial Generalization | ConvNeXt-Tiny | `(1, 3, 224, 224)` | `effort_spatial.pth` | Standby / Optional |
| **LSDA Generalization** | Cross-Manipulation | EfficientNet-B4 | `(1, 3, 224, 224)` | `lsda_cross.pth` | Standby / Optional |
| **F3Net Frequency** | Frequency Discrepancy | Dual-Stream ResNet-34 | `(1, 3, 224, 224)` | `f3net_freq.pth` | Standby / Optional |
| **SBI Boundary** | Blending Boundary Discontinuity | EfficientNet-B0 | `(1, 3, 224, 224)` | `sbi_boundary.pth` | Standby / Optional |
| **DINOv2 Foundation** | Semantic / OOD Manifold | Vision Transformer (ViT-S/14) | `(1, 3, 224, 224)` | `dinov2_vits14.pth` | Standby / Optional |

---

## 1. Model Card: Xception Baseline

### 1.1 Architecture & Details
- **Developer / Origin**: Rössler et al. (FaceForensics++ benchmark, ICCV 2019).
- **Architecture**: 36-layer Depthwise Separable Convolutional Neural Network (Chollet, 2017).
- **Input Dimensions**: $299 \times 299 \times 3$ RGB.
- **Normalization**: Pixel values scaled to $[-1.0, 1.0]$ via $x_{\text{norm}} = (x / 127.5) - 1.0$.
- **Parameter Count**: ~22.8M parameters.
- **Host Memory Required**: ~180 MB on CPU.

### 1.2 Intended Use
- **Primary Use**: Serves as the historical empirical benchmark for classical face manipulation detection.
- **Role in Platform**: Baseline comparison reference against FaceForensics++ (Deepfakes, Face2Face, FaceSwap, NeuralTextures).

### 1.3 Known Biases & Failure Modes
- **Overfitting to Training Compression**: Severely degrades when evaluated on uncompressed imagery or unseen post-processing codecs.
- **Low Cross-Generator Generalization**: Fails completely on modern latent diffusion generators (SDXL, Midjourney) because it relies on artifact patterns specific to 2019 GAN architectures.

---

## 2. Model Card: Effort (Universal Spatial Generalization)

### 2.1 Architecture & Details
- **Developer / Origin**: Modern Spatial Forensic Benchmark.
- **Architecture**: ConvNeXt-Tiny with modified binary classification head.
- **Input Dimensions**: $224 \times 224 \times 3$ RGB.
- **Normalization**: Standard ImageNet statistics ($\mu = [0.485, 0.456, 0.406]$, $\sigma = [0.229, 0.224, 0.225]$).
- **Parameter Count**: ~28.6M parameters.
- **Host Memory Required**: ~230 MB on CPU.

### 2.2 Intended Use
- **Primary Use**: Primary spatial detector for localized generative residual fingerprints.
- **Role in Platform**: Provides foundational spatial score $s_{\text{spatial}}$ weighted within the linear fusion engine.

### 2.3 Strengths & Limitations
- **Strengths**: Superior cross-generator transferability compared to ResNet/Xception baselines; resilient to mild JPEG compression ($Q \ge 75$).
- **Failure Modes**: Highly sensitive to strong spatial blurring ($\sigma > 2.0$), where high-frequency spatial gradients are obliterated.

---

## 3. Model Card: LSDA (Learning on Shifted Data Distributions)

### 3.1 Architecture & Details
- **Developer / Origin**: Cross-Manipulation Domain Adaptation Research.
- **Architecture**: EfficientNet-B4 with regularized feature extraction.
- **Input Dimensions**: $224 \times 224 \times 3$ RGB.
- **Normalization**: ImageNet $\mu$ and $\sigma$.
- **Parameter Count**: ~19.3M parameters.
- **Host Memory Required**: ~160 MB on CPU.

### 3.2 Intended Use
- **Primary Use**: Detection of manipulation artifacts under domain shifts (different camera sensors, variable studio lighting).
- **Role in Platform**: Counterbalances single-dataset overfitting; stabilizes spatial consensus.

### 3.3 Limitations & Edge Cases
- Susceptible to heavy color jitter and extreme gamma manipulation.
- Moderate inference latency on CPU (~40 ms).

---

## 4. Model Card: F3Net (Frequency-Aware Dual-Stream Network)

### 4.1 Architecture & Details
- **Developer / Origin**: Qian et al. (ECCV 2020).
- **Architecture**: Dual-stream CNN incorporating:
  - **Frequency-Aware Decomposition (FAD)**: Discrete Cosine Transform (DCT) splitting into low, middle, and high frequency sub-bands.
  - **Local Frequency Statistics (LFS)**: Sliding-window local spectral representation.
- **Input Dimensions**: $224 \times 224 \times 3$ RGB.
- **Parameter Count**: ~25.5M parameters.
- **Host Memory Required**: ~210 MB on CPU.

### 4.2 Intended Use
- **Primary Use**: Detecting manipulation traces that are imperceptible in the RGB spatial domain but manifest as frequency discrepancies.
- **Role in Platform**: Forms the core of the **Frequency Modality**, providing $s_{\text{freq}}$.

### 4.3 Strengths & Failure Modes
- **Strengths**: Captures generative upsampling lattice patterns (transposed convolution artifacts) and spectral energy imbalances.
- **Failure Modes**: Heavy JPEG compression ($Q < 60$) performs high-frequency coefficient quantization, attenuating the exact signals F3Net monitors. QualityService attenuates F3Net's weight when JPEG compression is detected.

---

## 5. Model Card: SBI (Self-Blended Images)

### 5.1 Architecture & Details
- **Developer / Origin**: Shiohara & Matsuo (CVPR 2022).
- **Architecture**: EfficientNet-B0 trained entirely on synthetic self-blended images (no deepfakes used during training).
- **Input Dimensions**: $224 \times 224 \times 3$ RGB (cropped from facial region with **25% boundary margin**).
- **Parameter Count**: ~5.3M parameters.
- **Host Memory Required**: ~45 MB on CPU (lightweight).

### 5.2 Intended Use
- **Primary Use**: Detects blending boundaries, color inconsistency seams, and edge gradient discontinuities between foreground face swaps and background source plates.
- **Role in Platform**: Powers the **Boundary Modality** ($s_{\text{bound}}$).

### 5.3 Strengths & Limitations
- **Strengths**: Exceptional zero-shot generalization across unseen deepfake benchmarks (Celeb-DF, WildDeepfake) because it detects the *process* of blending rather than a specific generator's noise.
- **Failure Modes**: Struggles with whole-image full-synthesis images (e.g. text-to-image diffusion portraits) where no blending operation occurred.

---

## 6. Model Card: DINOv2 (Vision Transformer Foundation Model)

### 6.1 Architecture & Details
- **Developer / Origin**: Oquab et al. (Meta AI, 2023).
- **Architecture**: ViT-Small/14 (12 Transformer encoder blocks, 6 heads, patch size 14x14).
- **Input Dimensions**: $224 \times 224 \times 3$ RGB.
- **Embedding Dimension**: 384-dimensional $L_2$-normalized vector ($\mathbf{e} \in \mathbb{R}^{384}$).
- **Parameter Count**: ~22.1M parameters.
- **Host Memory Required**: ~175 MB on CPU.

### 6.2 Intended Use
- **Primary Use**: Frozen unsupervised foundation representations for semantic feature extraction and out-of-distribution (OOD) detection.
- **Role in Platform**: Computes cosine distance $d_{\text{ood}}$ against authentic reference centroids. Triggers the 4th state: `SUSPECTED_OOD`.

### 6.3 Strengths & Limitations
- **Strengths**: Unsupervised self-supervised pre-training on 142M curated images (LVD-142M) provides rich semantic representations invariant to minor pixel noise.
- **Failure Modes**: Foundation embeddings capture high-level semantic structures rather than micro-pixel artifacts. DINOv2 is not used as a standalone deepfake detector, but as a manifold shift guardrail.

---

## 7. Operational Policy: Missing Checkpoint Graceful Standby

In strict accordance with academic integrity and local hardware protection:
- **No Automatic Megabyte Downloads**: Checkpoints are not downloaded silently in the background.
- **State Transparency**: If a checkpoint is absent from `models/checkpoints/`, the adapter returns `status="STANDBY_NO_CHECKPOINT"` with `confidence=0.50`.
- **Pipeline Continuity**: The Evidence Engine and Fusion Engine gracefully recalculate weights and contributions over the available active detectors without throwing unhandled exceptions.
