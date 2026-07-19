import os
import glob
import requests

csv_files = glob.glob("data/MotionSense/**/*.csv", recursive=True)
if not csv_files:
    print("❌ Could not find any MotionSense CSV files!")
    exit()

target_file = csv_files[0]
print(f"🚀 Sending real telemetry file: {target_file}")

url = "https://kinetrace-engine.onrender.com/api/ingest"
with open(target_file, "rb") as f:
    files = {"file": (os.path.basename(target_file), f, "text/csv")}
    response = requests.post(url, files=files)

if response.status_code == 200:
    print("✅ Success! Server Response:")
    import json
    print(json.dumps(response.json(), indent=4))
else:
    print(f"❌ Failed with status code {response.status_code}")
    print(response.text)