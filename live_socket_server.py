import socket
import json
import joblib
import pandas as pd
import numpy as np

print("Loading KineTrace brain layers...")
model = joblib.load("models/kinetrace_universal_model.pkl")
le = joblib.load("models/label_encoder.pkl")

activity_names = {
    0: "Walking", 1: "Upstairs", 2: "Downstairs", 
    3: "Sitting", 4: "Standing", 5: "Lying/Jogging"
}

def calculate_single_ksi(jerk, std):
    alpha = 1.5
    beta = 2.0
    score = 100.0 - (alpha * jerk + beta * std)
    return float(np.clip(score, 0.0, 100.0))

HOST = "127.0.0.1"
PORT = 65432

server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server_socket.bind((HOST, PORT))
server_socket.listen()

print(f"\n KineTrace Live Engine online and listening at {HOST}:{PORT}...")
print("Awaiting remote client hardware telemetry connection...\n")

try:
    while True:
        conn, addr = server_socket.accept()
        print(f"⚡ Connected securely to client hardware stream: {addr}")
        
        with conn:
            prev_mean_acc = 0.0
            prev_mean_gyro = 0.0
            
            while True:
                data = conn.recv(1024)
                if not data:
                    break
                
                try:
                    packet = json.loads(data.decode('utf-8'))
                    df_frame = pd.DataFrame([packet])
                    
                    df_frame['Prev_Mean_Acc_Mag'] = prev_mean_acc
                    df_frame['Prev_Mean_Gyro_Mag'] = prev_mean_gyro
                    df_frame['Acc_Mag_Peak_To_Peak'] = df_frame['Std_Acc_Mag'] * 4 
                    df_frame['Acc_Velocity_Estimate'] = df_frame['Mean_Acc_Mag'] * 2.56
                    
                    if 'IQR_Acc_Mag' not in df_frame.columns:
                        df_frame['IQR_Acc_Mag'] = df_frame['Std_Acc_Mag'] * 1.349
                        df_frame['IQR_Gyro_Mag'] = df_frame['Std_Gyro_Mag'] * 1.349
                        df_frame['Entropy_Acc_Mag'] = 2.1
                        df_frame['Entropy_Gyro_Mag'] = 2.1
                    
                    expected_features = [
                        'Mean_Acc_Mag', 'Std_Acc_Mag', 'IQR_Acc_Mag', 'Entropy_Acc_Mag',
                        'Mean_Abs_Jerk_Acc_Mag', 'Dominant_Freq_Acc_Mag', 'Mean_Gyro_Mag',
                        'Std_Gyro_Mag', 'IQR_Gyro_Mag', 'Entropy_Gyro_Mag',
                        'Mean_Abs_Jerk_Gyro_Mag', 'Dominant_Freq_Gyro_Mag',
                        'Prev_Mean_Acc_Mag', 'Prev_Mean_Gyro_Mag',
                        'Acc_Mag_Peak_To_Peak', 'Acc_Velocity_Estimate'
                    ]
                    
                    X_frame = df_frame[expected_features]
                    
                    pred_id = model.predict(X_frame)[0]
                    activity = activity_names.get(pred_id, "Unknown")

                    ksi_score = calculate_single_ksi(
                        float(df_frame['Mean_Abs_Jerk_Acc_Mag'].values[0]),
                        float(df_frame['Std_Acc_Mag'].values[0])
                    )
                    
                    print(f"[LIVE INFERENCE] Activity: {activity:<13} | KSI: {ksi_score:.2f}%")
                    
                    prev_mean_acc = float(df_frame['Mean_Acc_Mag'].values[0])
                    prev_mean_gyro = float(df_frame['Mean_Gyro_Mag'].values[0])
                    
                    response = {"status": "processed", "activity": activity, "ksi": ksi_score}
                    conn.sendall(json.dumps(response).encode('utf-8'))
                    
                except Exception as e:
                    error_resp = {"status": "error", "message": str(e)}
                    conn.sendall(json.dumps(error_resp).encode('utf-8'))
                    
except KeyboardInterrupt:
    print("\nShutting down live network socket server cleanly.")
finally:
    server_socket.close()