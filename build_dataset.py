import numpy as np
import pandas as pd
from scipy.fft import fft, fftfreq
from scipy.stats import entropy, iqr

signals = {
    "Acc_X": np.loadtxt("data/UCI HAR Dataset/train/Inertial Signals/body_acc_x_train.txt"),
    "Acc_Y": np.loadtxt("data/UCI HAR Dataset/train/Inertial Signals/body_acc_y_train.txt"),
    "Acc_Z": np.loadtxt("data/UCI HAR Dataset/train/Inertial Signals/body_acc_z_train.txt"),
    "Gyro_X": np.loadtxt("data/UCI HAR Dataset/train/Inertial Signals/body_gyro_x_train.txt"),
    "Gyro_Y": np.loadtxt("data/UCI HAR Dataset/train/Inertial Signals/body_gyro_y_train.txt"),
    "Gyro_Z": np.loadtxt("data/UCI HAR Dataset/train/Inertial Signals/body_gyro_z_train.txt")
}
labels = np.loadtxt("data/UCI HAR Dataset/train/y_train.txt").astype(int)

fs = 50.0  
dt = 1.0 / fs
num_windows = labels.shape[0]
n = signals["Acc_X"].shape[1] 

acc_mag_matrix = np.sqrt(signals["Acc_X"]**2 + signals["Acc_Y"]**2 + signals["Acc_Z"]**2)
gyro_mag_matrix = np.sqrt(signals["Gyro_X"]**2 + signals["Gyro_Y"]**2 + signals["Gyro_Z"]**2)

magnitude_signals = {
    "Acc_Mag": acc_mag_matrix,
    "Gyro_Mag": gyro_mag_matrix
}

extracted_data = []

for i in range(num_windows):
    row_data = {"Activity_Label": labels[i]}
    
    for sensor_name, data_matrix in magnitude_signals.items():
        window = data_matrix[i]
        
        row_data[f"Mean_{sensor_name}"] = np.mean(window)
        row_data[f"Std_{sensor_name}"] = np.std(window)
        row_data[f"IQR_{sensor_name}"] = iqr(window)
        
        hist, _ = np.histogram(window, bins=10, density=True)
        row_data[f"Entropy_{sensor_name}"] = entropy(hist + 1e-5)
        
        jerk = np.diff(window) / dt
        row_data[f"Mean_Abs_Jerk_{sensor_name}"] = np.mean(np.abs(jerk))
        
        fft_values = np.abs(fft(window))
        freqs = fftfreq(n, dt)
        pos_mask = freqs > 0 
        row_data[f"Dominant_Freq_{sensor_name}"] = freqs[pos_mask][np.argmax(fft_values[pos_mask])]
    
    extracted_data.append(row_data)

df = pd.DataFrame(extracted_data)
df.to_csv("data/kine_features_train_mag.csv", index=False)