import sys
import numpy as np
import pandas as pd
import scipy
import matplotlib
import sklearn

print("--- KineTrace Environment Verification ---")
print(f"Python Version: {sys.version.split()[0]}")
print(f"NumPy Version:  {np.__version__}")
print(f"Pandas Version: {pd.__version__}")
print(f"SciPy Version:  {scipy.__version__}")
print("------------------------------------------")
print("SUCCESS: All core libraries loaded perfectly!")