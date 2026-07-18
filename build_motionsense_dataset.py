import os
import numpy as np
import pandas as pd
from scipy.fft import fft, fftfreq

base_dir = "data/MotionSense/A_DeviceMotion_data"
label_mapping = {"wlk": 1, "ups": 2, "dws": 3, "sit": 4, "std": 5, "jog": 6}
fs = 50.0
dt = 1.0 / fs
window_size = 128  
extracted_rows = []

for folder_name in os.listdir(base_dir):
    folder_path = os.path.join(base_dir, folder_name)
    if not os.path.isdir(folder_path): continue
    prefix = folder_name.split('_')[0]
    if prefix not in label_mapping: continue
    activity_label = label_mapping[prefix]
    
    for file_name in os.listdir(folder_path):
        if not file_name.endswith('.csv'): continue
        file_path = os.path.join(folder_path, file_name)
        try:
            df_raw = pd.read_csv(file_path)
        except: continue
        
        required_cols = [
            'userAcceleration.x', 'userAcceleration.y', 'userAcceleration.z',
            'rotationRate.x', 'rotationRate.y', 'rotationRate.z'
        ]
        if not all(col in df_raw.columns for col in required_cols): continue
        
        num_windows = len(df_raw) // window_size
        for w in range(num_windows):
            start_idx = w * window_size
            end_idx = start_idx + window_size
            window_chunk = df_raw.iloc[start_idx:end_idx]
            
            acc_mag = np.sqrt(window_chunk['userAcceleration.x'].values**2 + 
                              window_chunk['userAcceleration.y'].values**2 + 
                              window_chunk['userAcceleration.z'].values**2)
            
            gyro_mag = np.sqrt(window_chunk['rotationRate.x'].values**2 + 
                               window_chunk['rotationRate.y'].values**2 + 
                               window_chunk['rotationRate.z'].values**2)
            
            signals_map = {"Acc_Mag": acc_mag, "Gyro_Mag": gyro_mag}
            row_features = {"Activity_Label": activity_label}
            
            for sensor_name, window in signals_map.items():
                row_features[f"Mean_{sensor_name}"] = np.mean(window)
                row_features[f"Std_{sensor_name}"] = np.std(window)
                
                jerk = np.diff(window) / dt
                row_features[f"Mean_Abs_Jerk_{sensor_name}"] = np.mean(np.abs(jerk))
                
                fft_values = np.abs(fft(window))
                freqs = fftfreq(window_size, dt)
                pos_mask = freqs > 0
                row_features[f"Dominant_Freq_{sensor_name}"] = freqs[pos_mask][np.argmax(fft_values[pos_mask])]
                
            extracted_rows.append(row_features)

df_motionsense = pd.DataFrame(extracted_rows)
df_motionsense.to_csv("data/kine_features_motionsense_mag.csv", index=False)