import socket
import json
import time
import pandas as pd

HOST = "https://kinetrace.onrender.com/"
PORT = 65432

print("Reading dataset to stream simulated live packets...")
df_stream = pd.read_csv("data/kine_features_motionsense_mag.csv")

if 'White_Noise_Variance_Acc_Mag' in df_stream.columns:
    df_stream = df_stream.rename(columns={
        'White_Noise_Variance_Acc_Mag': 'Std_Acc_Mag',
        'White_Noise_Variance_Gyro_Mag': 'Std_Gyro_Mag'
    })

print(f"Connecting to KineTrace Engine at {HOST}:{PORT}...")
with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
    s.connect((HOST, PORT))
    print("⚡ Secure telemetry channel established! Sending sensor data packets...\n")

    for idx, row in df_stream.iterrows():

        packet = {
            "Mean_Acc_Mag": float(row["Mean_Acc_Mag"]),
            "Std_Acc_Mag": float(row["Std_Acc_Mag"]),
            "Mean_Abs_Jerk_Acc_Mag": float(row["Mean_Abs_Jerk_Acc_Mag"]),
            "Dominant_Freq_Acc_Mag": float(row["Dominant_Freq_Acc_Mag"]),
            "Mean_Gyro_Mag": float(row["Mean_Gyro_Mag"]),
            "Std_Gyro_Mag": float(row["Std_Gyro_Mag"]),
            "Mean_Abs_Jerk_Gyro_Mag": float(row["Mean_Abs_Jerk_Gyro_Mag"]),
            "Dominant_Freq_Gyro_Mag": float(row["Dominant_Freq_Gyro_Mag"])
        }
        
        s.sendall(json.dumps(packet).encode('utf-8'))
        
        data = s.recv(1024)
        response = json.loads(data.decode('utf-8'))
        
        print(f"[PACKET {idx:03d} SENT] Server Response -> Activity: {response['activity']:<12} | Stability: {response['ksi']:.2f}%")

        time.sleep(0.5)