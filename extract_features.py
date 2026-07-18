import os
import glob
import pandas as pd
import numpy as np
from scipy.stats import entropy
from scipy.fft import fft

DATA_DIR = "data"
TARGET_DIR = os.path.join(DATA_DIR, "UCI HAR Dataset")
MASTER_DB = os.path.join(DATA_DIR, "kine_features_motionsense_mag.csv")

def calculate_window_features(df, sampling_rate=50):
    for col in ['ax', 'ay', 'az', 'gx', 'gy', 'gz']:
        df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0.0)

    acc_mag = pd.Series(np.sqrt(df['ax']**2 + df['ay']**2 + df['az']**2))
    gyro_mag = pd.Series(np.sqrt(df['gx']**2 + df['gy']**2 + df['gz']**2))
    
    window_size = 128
    feature_rows = []
    
    for i in range(0, len(df), window_size):
        w_acc = acc_mag.iloc[i:i+window_size]
        w_gyro = gyro_mag.iloc[i:i+window_size]
        
        if len(w_acc) < window_size // 2:
            continue
            
        mean_acc = float(w_acc.mean())
        std_acc = float(w_acc.std()) if w_acc.std() > 0 else 0.01
        jerk_acc = float(np.mean(np.abs(np.diff(w_acc)))) if len(w_acc) > 1 else 0.0
        
        mean_gyro = float(w_gyro.mean())
        std_gyro = float(w_gyro.std()) if w_gyro.std() > 0 else 0.01
        jerk_gyro = float(np.mean(np.abs(np.diff(w_gyro)))) if len(w_gyro) > 1 else 0.0
        
        hist_acc, _ = np.histogram(w_acc, bins=10, density=True)
        hist_gyro, _ = np.histogram(w_gyro, bins=10, density=True)
        entropy_acc = float(entropy(hist_acc + 1e-5))
        entropy_gyro = float(entropy(hist_gyro + 1e-5))
        
        fft_acc = np.abs(fft(np.array(w_acc) - mean_acc))
        freqs = np.fft.fftfreq(len(w_acc), d=1/sampling_rate)
        pos = freqs > 0
        fft_peaks = fft_acc[pos]
        pos_freqs = freqs[pos]
        dominant_freq_acc = float(pos_freqs[np.argmax(fft_peaks)]) if len(fft_peaks) > 0 else 0.0

        feature_rows.append({
            'Mean_Acc_Mag': mean_acc, 'Std_Acc_Mag': std_acc, 'Mean_Abs_Jerk_Acc_Mag': jerk_acc,
            'Entropy_Acc_Mag': entropy_acc, 'Dominant_Freq_Acc_Mag': dominant_freq_acc,
            'Mean_Gyro_Mag': mean_gyro, 'Std_Gyro_Mag': std_gyro, 'Mean_Abs_Jerk_Gyro_Mag': jerk_gyro,
            'Entropy_Gyro_Mag': entropy_gyro, 
            'Activity_Label': 4, 
            'Actual_TUG_Score': 11.0 
        })
        
    return pd.DataFrame(feature_rows)

def run_universal_extraction():
    if not os.path.exists(TARGET_DIR):
        print(f"Error: Could not find {TARGET_DIR}")
        return

    x_files = glob.glob(os.path.join(TARGET_DIR, "**/*_x_*.txt"), recursive=True)
    
    if not x_files:
        print("No split X-axis files found")
        return

    total_windows_added = 0

    for x_path in x_files:
        y_path = x_path.replace('_x_', '_y_')
        z_path = x_path.replace('_x_', '_z_')
        
        if not (os.path.exists(y_path) and os.path.exists(z_path)):
            continue 
            
        try:
            df_x = pd.read_csv(x_path, sep=r'\s+', header=None).values.flatten()
            df_y = pd.read_csv(y_path, sep=r'\s+', header=None).values.flatten()
            df_z = pd.read_csv(z_path, sep=r'\s+', header=None).values.flatten()
        except Exception as e:
            print(f"Failed to read files: {e}")
            continue
            
        df_standard = pd.DataFrame({
            'ax': df_x,
            'ay': df_y,
            'az': df_z,
            'gx': 0.0,
            'gy': 0.0,
            'gz': 0.0
        })

        df_features = calculate_window_features(df_standard)
        
        if not df_features.empty:
            df_features.to_csv(MASTER_DB, mode='a', header=not os.path.exists(MASTER_DB), index=False)
            total_windows_added += len(df_features)
            print(f"Processed: {os.path.basename(x_path)}")

    print(f"Extraction Complete. Added {total_windows_added} windows.")

if __name__ == "__main__":
    run_universal_extraction()
    
    wisdm_files = glob.glob(os.path.join(DATA_DIR, "WISDM/*.txt"))
    for file_path in wisdm_files:
        df = pd.read_csv(file_path, header=None)
        df.columns = ['user', 'activity', 'timestamp', 'ax', 'ay', 'az']
        df_standard = df[['ax', 'ay', 'az']]
        df_standard['gx'], df_standard['gy'], df_standard['gz'] = 0.0, 0.0, 0.0
        
        df_features = calculate_window_features(df_standard)
        if not df_features.empty:
            df_features.to_csv(MASTER_DB, mode='a', header=not os.path.exists(MASTER_DB), index=False)
            print(f"Processed WISDM: {os.path.basename(file_path)}")