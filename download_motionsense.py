import os
import urllib.request
import zipfile

url = "https://github.com/mmalekzadeh/motion-sense/raw/master/data/A_DeviceMotion_data.zip"
dest_zip = "data/motionsense_raw.zip"
extract_path = "data/MotionSense"

print("--- KineTrace: MotionSense Data Acquisition ---")
print("Step 1: Preparing directories...")
os.makedirs(extract_path, exist_ok=True)

print("Step 2: Downloading MotionSense Dataset...")
print("(This may take a minute depending on your connection...)")
urllib.request.urlretrieve(url, dest_zip)
print("Download complete!")

print("Step 3: Extracting files...")
with zipfile.ZipFile(dest_zip, 'r') as zip_ref:
    zip_ref.extractall(extract_path)

print(f"\nSUCCESS! MotionSense dataset extracted to: {extract_path}")