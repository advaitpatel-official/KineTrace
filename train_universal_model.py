import os
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
import joblib

DATA_DIR = "data"
MASTER_DB = os.path.join(DATA_DIR, "kine_features_motionsense_mag.csv")
MODEL_DIR = "models"

def run_scientific_training():
    print("Initiating scientific ML training iteration loop...")
    
    os.makedirs(MODEL_DIR, exist_ok=True)
    
    if not os.path.exists(MASTER_DB):
        print(f"Registry not found at {MASTER_DB}. Constructing initial synthetic baseline...")
        np.random.seed(42)
        mock_data = np.random.normal(loc=2.0, scale=0.5, size=(800, 9))
        df = pd.DataFrame(mock_data, columns=[
            'Mean_Acc_Mag', 'Std_Acc_Mag', 'Mean_Abs_Jerk_Acc_Mag', 'Entropy_Acc_Mag', 'Dominant_Freq_Acc_Mag',
            'Mean_Gyro_Mag', 'Std_Gyro_Mag', 'Mean_Abs_Jerk_Gyro_Mag', 'Entropy_Gyro_Mag'
        ])
        df['Activity_Label'] = np.random.randint(0, 4, size=800)
        df['Actual_TUG_Score'] = np.random.uniform(9.0, 14.0, size=800)
    else:
        df = pd.read_csv(MASTER_DB)
        print(f" Registry successfully verified. Loaded {len(df)} entries.")

    feature_cols = [
        'Mean_Acc_Mag', 'Std_Acc_Mag', 'Mean_Abs_Jerk_Acc_Mag', 'Entropy_Acc_Mag', 'Dominant_Freq_Acc_Mag',
        'Mean_Gyro_Mag', 'Std_Gyro_Mag', 'Mean_Abs_Jerk_Gyro_Mag', 'Entropy_Gyro_Mag'
    ]
    
    X = df[feature_cols]
    y_activity = df['Activity_Label']
    y_tug = df['Actual_TUG_Score']

    rf_activity = RandomForestClassifier(n_estimators=50, random_state=42)
    rf_activity.fit(X, y_activity)

    rf_tug = RandomForestRegressor(n_estimators=50, random_state=42)
    rf_tug.fit(X, y_tug)

    walking_mask = y_activity == 0
    if walking_mask.sum() > 5:
        healthy_walking_data = X[walking_mask]
    else:
        healthy_walking_data = X
        
    baseline_mean = healthy_walking_data.mean(axis=0).to_numpy()
    cov_matrix = np.cov(healthy_walking_data.to_numpy(), rowvar=False)
    
    cov_matrix += np.eye(cov_matrix.shape[0]) * 1e-6
    baseline_cov_inv = np.linalg.inv(cov_matrix)

    activity_model_path = os.path.join(MODEL_DIR, "rf_activity_classifier.pkl")
    tug_model_path = os.path.join(MODEL_DIR, "rf_tug_regressor.pkl")
    mean_path = os.path.join(MODEL_DIR, "baseline_mean.npy")
    cov_path = os.path.join(MODEL_DIR, "baseline_cov_inv.npy")

    joblib.dump(rf_activity, activity_model_path)
    joblib.dump(rf_tug, tug_model_path)
    np.save(mean_path, baseline_mean)
    np.save(cov_path, baseline_cov_inv)

    print(f"Models serialized successfully directly to folder: {os.path.abspath(MODEL_DIR)}")
    print(" All ML Core systems compiled and serialized successfully.")

if __name__ == "__main__":
    run_scientific_training()