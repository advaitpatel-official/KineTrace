import pandas as pd
import joblib
import os
import glob
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
from sklearn.preprocessing import LabelEncoder

df_uci = pd.read_csv("data/kine_features_train_mag.csv")
df_motion = pd.read_csv("data/kine_features_motionsense_mag.csv")
df_combined = pd.concat([df_uci, df_motion], ignore_index=True)

df_combined['Prev_Mean_Acc_Mag'] = df_combined['Mean_Acc_Mag'].shift(1)
df_combined['Prev_Mean_Gyro_Mag'] = df_combined['Mean_Gyro_Mag'].shift(1)

df_combined['Acc_Mag_Peak_To_Peak'] = df_combined['Std_Acc_Mag'] * 4 
df_combined['Acc_Velocity_Estimate'] = df_combined['Mean_Acc_Mag'] * 2.56

df_combined.fillna(0, inplace=True)

X = df_combined.drop("Activity_Label", axis=1)
y = df_combined["Activity_Label"]

le = LabelEncoder()
y_encoded = le.fit_transform(y)

X_train, X_test, y_train, y_test = train_test_split(X, y_encoded, test_size=0.2, random_state=42)

model = XGBClassifier(
    n_estimators=400,
    max_depth=7,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8,
    random_state=42,
    n_jobs=-1
)
model.fit(X_train, y_train)

predictions = model.predict(X_test)
accuracy = accuracy_score(y_test, predictions)
activity_mapping = ["Walking", "Upstairs", "Downstairs", "Sitting", "Standing", "Lying/Jogging"]

print("\n==========================================")
print(f"Universal XGBoost Accuracy: {accuracy * 100:.2f}%")
print("==========================================\n")

report_text = classification_report(y_test, predictions, target_names=activity_mapping)
print(report_text)

output_dir = "output"
os.makedirs(output_dir, exist_ok=True)

existing_train_logs = glob.glob(os.path.join(output_dir, "run_*_training_metrics.txt"))
run_number = len(existing_train_logs) + 1
run_prefix = f"run_{run_number:03d}"

log_save_path = os.path.join(output_dir, f"{run_prefix}_training_metrics.txt")
with open(log_save_path, "w") as f:
    f.write(f"Universal XGBoost Model Train Run {run_prefix}\n")
    f.write(f"Global Cross-Dataset Accuracy: {accuracy * 100:.2f}%\n")
    f.write("==========================================\n\n")
    f.write(report_text)

print(f"Evaluation summary profile archived to: {log_save_path}")

os.makedirs("models", exist_ok=True)
joblib.dump(model, "models/kinetrace_universal_model.pkl")
joblib.dump(le, "models/label_encoder.pkl")
print("Production model weight binaries updated successfully.")