"""Performance and resource profiling utilities for DEEPTRACE-X.

Provides granular memory inspection, garbage collection enforcement,
and hardware profiling for low-resource CPU-only operation.
"""

import os
import gc
import psutil
from typing import Dict, Any
from pathlib import Path
import torch

from backend.config import settings
from backend.utils.logging_utils import logger


class ForensicProfiler:
    """Profiles runtime host memory, process RSS, and CPU utilization."""

    @staticmethod
    def get_process_memory_info() -> Dict[str, float]:
        """Returns current process memory utilization in megabytes (MB)."""
        process = psutil.Process(os.getpid())
        mem_info = process.memory_info()
        return {
            "rss_mb": round(mem_info.rss / (1024 * 1024), 2),
            "vms_mb": round(mem_info.vms / (1024 * 1024), 2),
            "percent": round(process.memory_percent(), 2),
            "num_threads": process.num_threads()
        }

    @staticmethod
    def trigger_memory_cleanup() -> Dict[str, Any]:
        """Enforces immediate garbage collection and PyTorch cache clearance."""
        before = psutil.Process(os.getpid()).memory_info().rss
        collected = gc.collect()
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
        if os.name == "nt":
            try:
                import ctypes
                ctypes.windll.psapi.EmptyWorkingSet(ctypes.c_void_p(-1))
            except Exception:
                pass
        after = psutil.Process(os.getpid()).memory_info().rss
        freed_mb = round(max(0, before - after) / (1024 * 1024), 2)
        return {
            "objects_collected": collected,
            "freed_mb": freed_mb,
            "current_rss_mb": round(after / (1024 * 1024), 2)
        }

    @classmethod
    def get_system_diagnostic_profile(cls) -> Dict[str, Any]:
        """Generates comprehensive hardware and process profiling telemetry."""
        proc_mem = cls.get_process_memory_info()
        sys_mem = psutil.virtual_memory()
        cpu_freq = psutil.cpu_freq()

        # Check DB file size
        db_path = settings.STORAGE_DIR / "deeptrace.db"
        db_size_kb = 0.0
        if db_path.exists():
            db_size_kb = round(db_path.stat().st_size / 1024, 2)

        return {
            "process": {
                "pid": os.getpid(),
                "rss_mb": proc_mem["rss_mb"],
                "vms_mb": proc_mem["vms_mb"],
                "memory_percent": proc_mem["percent"],
                "threads": proc_mem["num_threads"],
                "status": "HEALTHY_CPU_CONSTRAINED" if proc_mem["rss_mb"] < 450 else "ELEVATED_MEMORY"
            },
            "host_hardware": {
                "cpu_physical_cores": psutil.cpu_count(logical=False),
                "cpu_logical_cores": psutil.cpu_count(logical=True),
                "cpu_freq_mhz": round(cpu_freq.current, 2) if cpu_freq else None,
                "host_ram_total_gb": round(sys_mem.total / (1024 ** 3), 2),
                "host_ram_available_gb": round(sys_mem.available / (1024 ** 3), 2),
                "host_ram_used_percent": sys_mem.percent,
            },
            "storage": {
                "database_size_kb": db_size_kb,
                "data_dir": str(settings.STORAGE_DIR)
            }
        }


profiler = ForensicProfiler()
