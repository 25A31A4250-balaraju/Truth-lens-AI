# DEEPTRACE-X: Academic Research Methodology & Mathematical Foundations
## Adaptive Multi-Signal AI Image Forensics Architecture

**Authors & Research Team**: CS/ML Forensic Systems Laboratory  
**Document Version**: 1.0.0 (Expo Benchmark Edition)  
**System Classification**: Defensive Media Authentication & Forensic Triage Engine  

---

## 1. Executive Summary & Research Hypothesis

The rapid evolution of generative deep learning models—spanning autoencoders, generative adversarial networks (GANs), and latent diffusion architectures—has degraded the evidential reliability of unverified digital imagery. Conventional automated deepfake detection systems exhibit critical vulnerabilities:
1. **Generalization Degradation**: Deep neural networks trained on specific manipulation artifacts (e.g., FaceForensics++ Blended Faces) suffer catastrophic drop in accuracy when exposed to novel generative paradigms (e.g., diffusion models, cross-domain upsamplers).
2. **Post-Processing Fragility**: Standard CNN classifiers fail under routine social media transmission pipelines involving lossy JPEG compression, spatial downsampling, and sensor noise.
3. **Uncalibrated Binary Certainty**: Black-box classifiers produce overconfident scalar predictions without quantifying model disagreement or epistemic uncertainty.

### The Research Hypothesis
> **"Combining orthogonal spatial, frequency, boundary, and semantic representations within a quality-conditioned probabilistic framework yields a more robust, interpretable, and generalization-resilient image forensics system than monolithic end-to-end classifiers."**

---

## 2. Theoretical Framework & Signal Modalities

DEEPTRACE-X decomposes image forensics across four complementary feature domains:

```
                                 [ Input Image x ]
                                         │
                 ┌───────────────────────┼───────────────────────┐
                 ▼                       ▼                       ▼
        [ Spatial Modality ]    [ Frequency Modality ]   [ Semantic Modality ]
        - Effort (ConvNeXt)     - 2D-FFT Power Spectrum  - DINOv2 ViT Embeddings
        - LSDA (EfficientNet)   - Radial Band Ratios     - Manifold Cosine Dist
        - 4x4 Patch Grids       - F3Net Dual-Stream      - OOD Anomaly Guard
                 │                       │                       │
                 └───────────────────────┼───────────────────────┘
                                         ▼
                               [ Boundary Modality ]
                               - SBI Blend Discontinuity
                               - OpenCV 25% Facial Crop
                                         │
                                         ▼
                        [ Quality Attenuation Layer ]
                        - Laplacian Variance Sharpness
                        - Sensor Noise Residual Level
                        - Dynamic Range Over/Under Clipping
                                         │
                                         ▼
                        [ Multi-Signal Fusion Engine ]
                        - Dynamic Quality-Conditioned Weights
                        - Ensemble Disagreement Index (D = 2σ)
                        - 4-State Calibrated Verdict
```

### 2.1 Spatial Domain Forensics
Spatial deepfake detectors analyze localized pixel discrepancies, blending boundaries, and textural incongruities.
- **Effort (ConvNeXt-based)**: Evaluates universal synthetic generation traces. Exploits the observation that generative models leave residual spatial fingerprints across local receptive fields.
- **LSDA (EfficientNet-based)**: Specifically targets cross-manipulation generalization by penalizing reliance on dataset-specific generator shortcuts.
- **4x4 Spatial Patch Decomposition**: The image or detected face region is tessellated into a $4 \times 4$ spatial grid (16 uniform patches). Spatial variance $\sigma_{\text{patch}}^2$ is evaluated across tiles to localize regional manipulation:
  $$\sigma_{\text{patch}}^2 = \frac{1}{N} \sum_{i=1}^{16} (s_i - \bar{s})^2$$
  where $s_i$ denotes the predicted anomaly score within tile $i$.

### 2.2 Frequency Domain Forensics (2D-FFT)
Generative architectures involving upsampling operations (transposed convolutions, sub-pixel convolutions, or bilinear interpolations) impart periodic lattice patterns in the 2D frequency spectrum.

#### 2D Discrete Fourier Transform (2D-DFT)
For a grayscale luminance matrix $f(x, y)$ of dimensions $M \times N$:
$$F(u, v) = \sum_{x=0}^{M-1} \sum_{y=0}^{N-1} f(x, y) \exp\left[-j 2\pi \left(\frac{ux}{M} + \frac{vy}{N}\right)\right]$$
The zero-frequency component $(u=0, v=0)$ is shifted to the spectrum center via quadrant swapping (`fftshift`).

#### Centered Log-Magnitude Power Spectrum
$$P(u, v) = 20 \log_{10}\left(|F(u, v)| + \epsilon\right), \quad \epsilon = 10^{-6}$$

#### Radial Energy Band Decomposition
The Fourier domain is partitioned into concentric rings based on normalized radial distance $r = \frac{\sqrt{(u - u_0)^2 + (v - v_0)^2}}{r_{\max}}$:
- **Low-Frequency Band ($E_{\text{low}}$)**: $r \in [0.0, 0.15)$ — macro structures, global illumination.
- **Mid-Frequency Band ($E_{\text{mid}}$)**: $r \in [0.15, 0.50)$ — facial boundaries, contours, coarse textures.
- **High-Frequency Band ($E_{\text{high}}$)**: $r \in [0.50, 1.00]$ — sensor noise, fine detail, generative upsampling artifacts.

The discrete radial energy in band $B$ is:
$$E_B = \sum_{(u, v) \in B} |F(u, v)|^2$$
Normalized band energy shares satisfy $\sum_{B \in \{\text{low}, \text{mid}, \text{high}\}} \tilde{E}_B = 1.0$.

#### High-to-Low Energy Ratio ($\gamma$)
$$\gamma = \frac{E_{\text{high}}}{E_{\text{low}} + \epsilon}$$
- Natural uncompressed photographs exhibit strict power-law spectral decay: $P(f) \propto 1/f^{\alpha}$ where $\alpha \approx 2.0$.
- Deepfake synthesis typically manifests as elevated $\gamma$ due to checkerboard lattice artifacts, or depressed $\gamma$ due to excessive smoothing.

#### Spectral Entropy ($H_{\text{spectral}}$)
Quantifies energy dispersion across Fourier coefficients:
$$p(u, v) = \frac{|F(u, v)|}{\sum_{u', v'} |F(u', v')|}, \quad H_{\text{spectral}} = -\sum_{u, v} p(u, v) \log_2(p(u, v))$$

### 2.3 Boundary & Blending Forensics (SBI)
Self-Blended Images (SBI) simulate manipulation boundary artifacts without relying on target-specific generator architectures.
- **Hypothesis**: Blending a source face onto a target face creates subtle color mismatch, blurred transition seams, and edge gradient discontinuities around facial contours.
- **Margin Crop**: Facial regions detected via OpenCV Haar Cascades are cropped with a strict **25% boundary margin**:
  $$x_{\min}' = \max(0, x - 0.25 \cdot w), \quad y_{\min}' = \max(0, y - 0.25 \cdot h)$$
  $$w' = 1.5 \cdot w, \quad h' = 1.5 \cdot h$$
  This ensures boundary transition seams (hairline, chin contour, ear margins) are fully preserved for the SBI detector.

### 2.4 Semantic Modality & Out-of-Distribution (OOD) Manifold
Novel diffusion architectures (Midjourney v6, FLUX, SDXL) generate pristine high-frequency textures that bypass conventional spatial detectors. However, their high-level semantic representations diverge from the distribution of authentic natural photography.

#### DINOv2 Foundation Feature Extraction
Input crops are projected through a frozen Vision Transformer (ViT-Small/14, 384-dimensional embedding):
$$\mathbf{e} = f_{\text{DINOv2}}(x) \in \mathbb{R}^{384}, \quad \|\mathbf{e}\|_2 = 1.0$$

#### Manifold Cosine Distance
The extracted embedding is compared against a pre-computed centroid manifold $\mathbf{m}_{\text{auth}} \in \mathbb{R}^{384}$ derived from authentic photographic benchmarks:
$$\cos(\mathbf{e}, \mathbf{m}_{\text{auth}}) = \frac{\mathbf{e} \cdot \mathbf{m}_{\text{auth}}}{\|\mathbf{e}\|_2 \|\mathbf{m}_{\text{auth}}\|_2}$$
The manifold anomaly distance $d_{\text{ood}}$ is:
$$d_{\text{ood}} = \frac{1 - \cos(\mathbf{e}, \mathbf{m}_{\text{auth}})}{2} \in [0, 1]$$

#### 4th State Trigger: `SUSPECTED_OOD`
When $d_{\text{ood}} > \tau_{\text{ood}}$ (where $\tau_{\text{ood}} = 0.65$), the system identifies that the input belongs to an unfamiliar generative distribution, overriding naive binary classification to output `SUSPECTED_OOD`.

---

## 3. Image Quality Attenuation Engine

Low-quality or heavily degraded images degrade detector reliability. Instead of propagating corrupt signals into the classifier, DEEPTRACE-X computes objective degradation metrics to dynamically attenuate detector weights:

### 3.1 Sharpness via Variance of the Laplacian ($\sigma_{\Delta}^2$)
$$\sigma_{\Delta}^2 = \operatorname{Var}\left(\nabla^2 I\right) = \frac{1}{MN}\sum_{x, y} (\Delta I(x, y) - \bar{\Delta I})^2$$
where $\nabla^2 = \frac{\partial^2}{\partial x^2} + \frac{\partial^2}{\partial y^2}$.
- Blur threshold: $\sigma_{\Delta}^2 < 100 \implies$ High blur attenuation.

### 3.2 High-Frequency Noise Estimation ($\sigma_n$)
Estimated via median-filtered residual difference:
$$\sigma_n = \frac{1.4826}{\sqrt{2}} \operatorname{median}\left(\left|I(x, y) - \operatorname{medfilt}(I(x, y))\right|\right)$$

### 3.3 Dynamic Range & Clipping ($C_{\text{clip}}$)
Calculates proportion of saturated pixels:
$$C_{\text{clip}} = \frac{\#\{p \in I \mid p \le 2 \lor p \ge 253\}}{M \cdot N}$$

### 3.4 Quality Factor ($Q_{\text{factor}}$)
$$Q_{\text{factor}} = \alpha \cdot \tilde{\sigma}_{\Delta} + \beta \cdot (1 - \tilde{\sigma}_n) + \gamma \cdot (1 - C_{\text{clip}})$$
When $Q_{\text{factor}} < 0.40$, high-frequency detector weights are attenuated by up to 60%, and overall uncertainty is increased.

---

## 4. Evidence Calibration & Disagreement Metric

### 4.1 Cross-Detector Disagreement Index ($D$)
Given predictions $s_1, s_2, \dots, s_K$ from $K$ active detectors:
$$\bar{s} = \frac{1}{K} \sum_{i=1}^K s_i$$
$$\sigma = \sqrt{\frac{1}{K} \sum_{i=1}^K (s_i - \bar{s})^2}$$
The Disagreement Index is defined as:
$$D = \min\left(1.0, 2.0 \cdot \sigma\right)$$
- $D < 0.15 \implies$ **High Consensus** (Detectors strongly agree).
- $0.15 \le D < 0.35 \implies$ **Moderate Consensus**.
- $D \ge 0.35 \implies$ **High Disagreement** (Conflicting signals; uncertainty is elevated).

### 4.2 Quality-Conditioned Epistemic Uncertainty ($U$)
Let $c = |2\bar{s} - 1.0| \in [0, 1]$ represent baseline decisiveness. The calibrated uncertainty is:
$$U = \min\left(1.0, \max\left(0.05, 1.0 - c \cdot (1.0 - D) \cdot Q_{\text{factor}}\right)\right)$$

### 4.3 4-State Verdict Formulation
$$\text{Verdict}(s_{\text{fusion}}, U, d_{\text{ood}}) = \begin{cases}
\text{SUSPECTED\_OOD} & \text{if } d_{\text{ood}} > 0.65 \\
\text{UNCERTAIN} & \text{if } U > 0.60 \lor (0.42 < s_{\text{fusion}} < 0.58) \\
\text{LIKELY\_MANIPULATED} & \text{if } s_{\text{fusion}} \ge 0.58 \text{ and } U \le 0.60 \\
\text{LIKELY\_AUTHENTIC} & \text{if } s_{\text{fusion}} \le 0.42 \text{ and } U \le 0.60
\end{cases}$$

---

## 5. Interpretable Multi-Signal Fusion

Rather than employing an uninterpretable deep neural meta-classifier, DEEPTRACE-X uses a **regularized, quality-conditioned linear fusion layer**:

$$z = \beta_0 + \sum_{m \in \{\text{spatial}, \text{frequency}, \text{boundary}, \text{semantic}\}} w_m \cdot x_m \cdot q_m$$
$$s_{\text{fusion}} = \frac{1}{1 + e^{-z}}$$

### Modality Contribution Shares ($C_m$)
To provide transparent forensic audibility, the percentage contribution of each modality is computed as:
$$C_m = \frac{|w_m \cdot x_m \cdot q_m|}{\sum_{k} |w_k \cdot x_k \cdot q_k|} \times 100\%$$
This satisfies $\sum_m C_m = 100.0\%$, enabling investigators to inspect exactly which physical signal drove the forensic verdict.

---

## 6. Perturbation Robustness & Stability Index ($S$)

Real-world evidence undergoes forensic stress testing across 5 standard perturbations:
1. **JPEG Compression**: Quality factors $Q \in \{90, 70, 50\}$.
2. **Gaussian Additive Noise**: $\sigma \in \{5.0, 15.0\}$.
3. **Gaussian Spatial Blur**: Kernel sizes $k \in \{3, 5\}$.
4. **Bilinear Resizing**: Downscale by $50\%$ then upscale to original dimensions.
5. **Combined Transmission Pipeline**: Resizing + JPEG 70.

### Forensic Stability Index ($S$)
For $T$ perturbation trials:
$$S = \max\left(0.0, 1.0 - \min\left(1.0, \frac{1}{T} \sum_{t=1}^T \left(|\Delta s_t| + 0.5 \cdot |\Delta U_t|\right)\right)\right)$$
- $S \ge 0.80$: **Robust** (Fingerprints survive channel degradation).
- $0.60 \le S < 0.80$: **Moderately Stable**.
- $S < 0.60$: **Fragile** (Predictions degrade substantially under compression).

---

## 7. Computational Efficiency & Host Architecture

DEEPTRACE-X is engineered to execute locally on consumer-grade hardware:
- **Processor**: Intel Core i5-1334 (10 cores, 12 threads), CPU-only inference.
- **Host Memory**: 16 GB DDR4/DDR5 RAM.
- **Operating Policy**:
  - Sequential model mounting (only one heavyweight model resident in memory at a time).
  - Explicit garbage collection (`gc.collect()`) after each adapter evaluation.
  - Zero unverified monolithic downloads; absent checkpoints enter graceful `STANDBY_NO_CHECKPOINT` without crashing the workstation pipeline.
