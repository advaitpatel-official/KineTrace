import os
import glob
import requests
import pandas as pd

csv_files = glob.glob("data/MotionSense/**/*.csv", recursive=True)
if not csv_files:
    print("Could not find any MotionSense CSV files!")
    exit()

target_file = csv_files[0]
print(f"🚀 Sending real telemetry file: {target_file}")

df = pd.read_csv(target_file)

if 'userAcceleration.x' in df.columns and 'rotationRate.x' in df.columns:
    df_remapped = pd.DataFrame({
        'ax': df['userAcceleration.x'],
        'ay': df['userAcceleration.y'],
        'az': df['userAcceleration.z'],
        'gx': df['rotationRate.x'],
        'gy': df['rotationRate.y'],
        'gz': df['rotationRate.z'],
    })
elif 'ax' in df.columns and 'ay' in df.columns:
    df_remapped = df[['ax', 'ay', 'az', 'gx', 'gy', 'gz']].copy() if all(c in df.columns for c in ['gx', 'gy', 'gz']) else df[['ax', 'ay', 'az']].copy()
else:
    print(f"Unknown column format: {list(df.columns)}")
    exit()

print(f"Remapped {len(df_remapped)} rows from {list(df.columns)} -> {list(df_remapped.columns)}")

url = "https://kinetrace.onrender.com/api/ingest"
csv_buffer = df_remapped.to_csv(index=False)
files = {"file": (os.path.basename(target_file).replace('.csv', '_remapped.csv'), csv_buffer, "text/csv")}
response = requests.post(url, files=files)

if response.status_code == 200:
    print("Success! Server Response:")
    import json
    print(json.dumps(response.json(), indent=4))
else:
    print(f"Failed with status code {response.status_code}")
    print(response.text)