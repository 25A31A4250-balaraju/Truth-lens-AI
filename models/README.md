# DEEPTRACE-X Model Checkpoints & Pretrained Weights Guide

To adhere to scientific integrity, licensing compliance, and offline-first execution, **DEEPTRACE-X never automatically downloads arbitrary weights from untrusted third-party URLs without user consent**.

Pretrained model weights must be placed in this directory:
```
models/checkpoints/
├── xception_ffpp.pth          # Baseline FaceForensics++ benchmark
├── effort_pretrained.pth      # Effort primary spatial generalization detector
├── lsda_pretrained.pth        # LSDA cross-manipulation detector
├── f3net_pretrained.pth       # F3Net frequency-domain detector
├── sbi_pretrained.pth         # SBI self-blended image artifact detector
└── dinov2_vits14.pth          # DINOv2 frozen foundation representation
```

---

## Registered Model Specifications

### 1. Xception (Baseline Benchmark)
- **Target Filename**: `xception_ffpp.pth`
- **Architecture**: Modified XceptionNet with linear binary classification head.
- **Input Tensor**: `(1, 3, 299, 299)`
- **Normalization**: Mean: `[0.5, 0.5, 0.5]`, Std: `[0.5, 0.5, 0.5]`
- **Training Source**: FaceForensics++ (c23 compression protocol).
- **Purpose**: Conventional benchmark baseline to empirically demonstrate whether multi-signal fusion improves over standard classifiers.

### 2. Effort (Primary Spatial Detector)
- **Target Filename**: `effort_pretrained.pth`
- **Architecture**: ConvNeXt backbone with customized linear head.
- **Input Tensor**: `(1, 3, 224, 224)`
- **Normalization**: ImageNet standard (`mean=[0.485, 0.456, 0.406]`, `std=[0.229, 0.224, 0.225]`)
- **Purpose**: Generalization across contemporary diffusion models and generative adversarial networks.

### 3. LSDA (Cross-Manipulation Generalization)
- **Target Filename**: `lsda_pretrained.pth`
- **Architecture**: EfficientNet backbone tuned for cross-generator invariant features.
- **Input Tensor**: `(1, 3, 224, 224)`
- **Purpose**: Evaluates cross-manipulation generalization on unfamiliar generator distributions.

### 4. F3Net (Frequency-Domain Detector)
- **Target Filename**: `f3net_pretrained.pth`
- **Architecture**: Frequency-aware dual-stream convolutional network.
- **Input Tensor**: `(1, 3, 299, 299)`
- **Purpose**: Dissects frequency discrepancies and high-frequency spectral boundaries independent of RGB space.

### 5. SBI (Self-Blended Images)
- **Target Filename**: `sbi_pretrained.pth`
- **Architecture**: EfficientNet backbone trained with self-blending synthetic perturbations.
- **Input Tensor**: `(1, 3, 224, 224)`
- **Purpose**: Detects blending boundaries and synthetic composite artifacts around the facial contour.

### 6. DINOv2 (Frozen Foundation Representation)
- **Target Filename**: `dinov2_vits14.pth`
- **Architecture**: Vision Transformer ViT-Small/14.
- **Input Tensor**: `(1, 3, 224, 224)`
- **Embedding Dimension**: 384
- **Purpose**: Frozen foundation representation used for distribution shift, Out-of-Distribution (OOD), and vector similarity search.

---

## Graceful Standby Handling
If any checkpoint file is absent from `models/checkpoints/`, the DEEPTRACE-X platform detects its absence automatically and transitions that module to:
```
Status: STANDBY_NO_CHECKPOINT
```
The application will continue operating reliably without throwing unhandled exceptions.
