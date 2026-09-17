# DEEPTRACE-X: Forensic Datasets & Benchmark Evaluation Guide
## Cross-Generator Evaluation, Artifact Taxonomy, & Compression Protocols

**Target Audience**: Academic Researchers, Forensic Investigators, College Expo Reviewers  
**Document Version**: 1.0.0  

---

## 1. Overview of Forensic Benchmarking

Evaluating image manipulation detectors requires understanding the datasets on which models are trained and tested. A major failure mode in modern deepfake research is **intra-dataset memorization**: a classifier achieving 99.8% AUC on FaceForensics++ often drops to < 65% AUC when evaluated on Celeb-DF or in-the-wild social media imagery.

DEEPTRACE-X evaluates detectors against a multi-tier dataset taxonomy spanning classical GAN face swaps to contemporary latent diffusion architectures.

---

## 2. Standard Benchmark Datasets

### 2.1 FaceForensics++ (FF++)
- **Authors**: Rössler et al. (ICCV 2019, Technical University of Munich).
- **Composition**: 1,000 pristine YouTube video sequences manipulated via four automated methods:
  1. **Deepfakes**: Autoencoder-based face replacement.
  2. **Face2Face**: Real-time facial reenactment modifying expressions.
  3. **FaceSwap**: Classical 3D graphics-based face transfer.
  4. **NeuralTextures**: GAN-driven neural rendering of the facial interior.
- **Compression Variants**:
  - **Raw**: Uncompressed pristine video frames.
  - **c23 (HQ)**: Visually lossless H.264 compression (quantization parameter $QP=23$).
  - **c40 (LQ)**: Heavily compressed H.264 ($QP=40$), simulating low-bitrate streaming.
- **Role in DEEPTRACE-X**: Standard baseline calibration for the Xception and F3Net models.

### 2.2 Celeb-DF (v2)
- **Authors**: Li et al. (CVPR 2020, SUNY Albany).
- **Composition**: 590 real YouTube videos of celebrities, and 5,639 high-quality synthesized deepfake videos generated using an enhanced DeepFake autoencoder.
- **Key Characteristics**:
  - Significantly reduced color inconsistency and boundary seam artifacts compared to FF++.
  - Masks high-frequency synthesis errors with smoother post-processing blends.
- **Role in DEEPTRACE-X**: Benchmark for testing the **SBI (Self-Blended Images)** boundary detector.

### 2.3 WildDeepfake
- **Authors**: Zi et al. (ACM MM 2020).
- **Composition**: 7,314 face sequences extracted entirely from internet video platforms.
- **Forensic Challenge**:
  - Unknown generation algorithms, varied compression standards, wild head poses, and dramatic lighting variations.
  - Serves as an unconstrained evaluation set for our **QualityService** and **LSDA** models.

---

## 3. Contemporary Generative Diffusion Benchmarks

Modern diffusion models present a paradigm shift in visual generation:
- They do not rely on discrete autoencoder latent swaps; they generate complete images iteratively from Gaussian noise via reverse denoising or flow matching.
- As a result, classic blending boundaries and GAN checkerboard artifacts are often absent.

| Generative Model | Mechanism | Artifact Profile | Forensic Detection Modality |
|---|---|---|---|
| **Stable Diffusion 1.5 / 2.1** | Latent Diffusion (U-Net) | High-frequency noise residuals, imperfect pupil geometry | 2D-FFT high band, Effort |
| **Stable Diffusion XL (SDXL)** | High-res Latent Diffusion | Subtle high-frequency phase correlations | F3Net, DINOv2 manifold |
| **Midjourney (v5 / v6)** | Proprietary Latent Diffusion | Hyper-realist skin texture smoothing, unnatural background bokeh | DINOv2 cosine distance, QualityService |
| **FLUX.1 (Schnell / Dev)** | Rectified Flow Matching Transformer | Near-perfect spatial edges; semantic manifold divergence | DINOv2 Manifold OOD Guard |

---

## 4. Cross-Generator Evaluation Protocol

To prevent misleading performance claims, DEEPTRACE-X mandates the following evaluation protocols:

### 4.1 Zero-Shot Cross-Domain Protocol
- **Rule**: Never evaluate a detector solely on the generative method it was trained on.
- Models trained on GAN face-swaps must be evaluated on unseen diffusion models to observe generalization degradation.
- When cross-domain disagreement spikes ($D > 0.35$), the Evidence Engine attenuates confidence and flags the case as `UNCERTAIN` rather than providing an erroneous high-confidence verdict.

### 4.2 Quality-Attenuated Evaluation Protocol
- High-performing detectors often degrade precipitously under routine compression.
- Every benchmark test is subjected to the 5-stage **Robustness Lab perturbation suite** (JPEG 90/70/50, Gaussian noise, blur, downsampling).
- The resulting **Forensic Stability Index ($S$)** is reported alongside AUC and accuracy metrics.

---

## 5. Summary Table: Dataset Characteristics

| Dataset | Synthesis Type | Video / Still | Compression | Primary Artifacts |
|---|---|---|---|---|
| **FF++ (Raw)** | Autoencoder / GAN | Video Frames | None | Boundary seams, color mismatch |
| **FF++ (c23)** | Autoencoder / GAN | Video Frames | Moderate H.264 | Preserved frequency traces |
| **FF++ (c40)** | Autoencoder / GAN | Video Frames | Heavy H.264 | Heavy blocking, quantized spectra |
| **Celeb-DF v2** | Advanced Autoencoder | Video Frames | Moderate | Reduced boundary artifacts |
| **WildDeepfake** | In-the-wild diverse | Video Frames | Unconstrained | Diverse real-world distortions |
| **Diffusion-10k** | Latent Diffusion | Still Images | Lossless PNG | High-frequency phase, manifold shift |
