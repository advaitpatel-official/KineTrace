import pandas as pd
import os
import glob

RAW_DATA_DIR = "./raw_data"
PROCESSED_DATA_DIR = "./processed_data"
LEDGER_PATH = "./KineTrace_Subject_Ledger.csv"

if not os.path.exists(LEDGER_PATH):
    raise FileNotFoundError(f"Missing subject ledger: {LEDGER_PATH}")

ledger_df = pd.read_csv(LEDGER_PATH)

for subject_folder in glob.glob(f"{RAW_DATA_DIR}/sub_*"):
    subject_id = os.path.basename(subject_folder)
    
    subject_meta = ledger_df[ledger_df['subject_id'] == subject_id]
    
    if subject_meta.empty:
        print(f"Warning: No ledger record found for {subject_id}. Skipping.")
        continue

    subject_out_dir = os.path.join(PROCESSED_DATA_DIR, subject_id)
    os.makedirs(subject_out_dir, exist_ok=True)

    for file_path in glob.glob(f"{subject_folder}/*.csv"):
        filename = os.path.basename(file_path)
        
        activity_code = filename.split('_')[-1].replace('.csv', '')
        
        df_raw = pd.read_csv(file_path)
        df_clean = pd.DataFrame()
        
        df_clean['timestamp_ms'] = ((df_raw['time'] - df_raw['time'].iloc[0]) / 1e6).astype(int)
        
        df_clean['ax'] = df_raw['aX']
        df_clean['ay'] = df_raw['aY']
        df_clean['az'] = df_raw['aZ']
        df_clean['gx'] = df_raw['gX']
        df_clean['gy'] = df_raw['gY']
        df_clean['gz'] = df_raw['gZ']
        
        df_clean['subject_id'] = subject_id
        df_clean['activity'] = activity_code
        df_clean['age'] = subject_meta['age'].values[0]
        df_clean['gender'] = subject_meta['gender'].values[0]
        df_clean['height_cm'] = subject_meta['height_cm'].values[0]
        df_clean['weight_kg'] = subject_meta['weight_kg'].values[0]
        df_clean['preexisting_conditions'] = subject_meta['preexisting_conditions'].values[0]
        df_clean['condition_category'] = subject_meta['condition_category'].values[0]
        
        out_file_path = os.path.join(subject_out_dir, filename)
        df_clean.to_csv(out_file_path, index=False)
        print(f"Saved separate standardized file: {out_file_path}")