import pandas as pd
import os

def harmonize_dataset(input_filepath, dataset_type):
    try:
        df = pd.read_csv(input_filepath, sep=None, engine='python')
    except Exception as e:
        print(f"Failed to load {input_filepath}: {e}")
        return None

    df.columns = [str(col).strip().lower() for col in df.columns]

    if dataset_type == "motionsense":
        return df

    elif dataset_type == "uci_har":
        print(f"Translating UCI HAR file: {input_filepath}")
        
        col_map = {}
        for col in df.columns:
            if 'acc' in col and 'x' in col: col_map[col] = 'ax'
            elif 'acc' in col and 'y' in col: col_map[col] = 'ay'
            elif 'acc' in col and 'z' in col: col_map[col] = 'az'
            elif 'gyr' in col and 'x' in col: col_map[col] = 'gx'
            elif 'gyr' in col and 'y' in col: col_map[col] = 'gy'
            elif 'gyr' in col and 'z' in col: col_map[col] = 'gz'
        
        df = df.rename(columns=col_map)
        
        if 'ax' in df.columns and 'ay' in df.columns and 'az' in df.columns:
            cols_to_keep = ['ax', 'ay', 'az']
            if 'gx' in df.columns: 
                cols_to_keep.extend(['gx', 'gy', 'gz'])
            return df[cols_to_keep]
        else:
            print(f"Warning: Could not find standard X/Y/Z coordinate columns in {input_filepath}. Check the raw file headers.")
            return df
        
    elif dataset_type == "wisdm":
        df.columns = ['user', 'activity', 'timestamp', 'ax', 'ay', 'az']
        return df[['ax', 'ay', 'az']]

    elif dataset_type == "wisdm":
        print(f"Translating WISDM file: {input_filepath}")
        if len(df.columns) >= 6:
            new_cols = list(df.columns)
            new_cols[0:6] = ['user', 'activity', 'timestamp', 'ax', 'ay', 'az']
            df.columns = new_cols
            return df[['ax', 'ay', 'az']]
        return df

    else:
        print(f"Warning: Unrecognized dataset type '{dataset_type}'. Returning raw.")
        return df