import os
import urllib.request
import zipfile

url = "https://archive.ics.uci.edu/static/public/240/human+activity+recognition+using+smartphones.zip"
dest_zip = "data/uci_har_raw.zip"
extract_path = "data/UCI_HAR_Dataset"

print("Step 1: Creating data directory if it doesn't exist...")
os.makedirs("data", exist_ok=True)

print("Step 2: Downloading UCI HAR Dataset (this might take a minute)...")
urllib.request.urlretrieve(url, dest_zip)
print("Download complete!")

print("Step 3: Extracting main zip file...")
with zipfile.ZipFile(dest_zip, 'r') as zip_ref:
    zip_ref.extractall("data")

nested_zip = "data/UCI HAR Dataset.zip"
if os.path.exists(nested_zip):
    print("Step 4: Extracting nested dataset zip...")
    with zipfile.ZipFile(nested_zip, 'r') as zip_ref:
        zip_ref.extractall("data")
    print("All extractions complete!")
else:
    print("Nested zip not found, main extraction should be sufficient.")