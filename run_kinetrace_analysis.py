import os
import glob
import joblib
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

model = joblib.load("models/kinetrace_universal_model.pkl")
le = joblib.load("models/label_encoder.pkl")

activity_names = {
    0: "Walking",
    1: "Upstairs",
    2: "Downstairs",
    3: "Sitting",
    4: "Standing",
    5: "Lying/Jogging"
}

def calculate_ksi(df):
    alpha = 50.0
    beta = 20.0
    score = 100 - (alpha * df['Mean_Abs_Jerk_Acc_Mag'] + beta * df['Std_Acc_Mag'])
    return np.clip(score, 0, 100)

print("Reading dataset for batch inference...")
df_input = pd.read_csv("data/kine_features_motionsense_mag.csv")

# --- Robust feature derivation: if a column is missing, compute it ---
# Derived temporal features
df_input['Prev_Mean_Acc_Mag'] = df_input['Mean_Acc_Mag'].shift(1)
df_input['Prev_Mean_Gyro_Mag'] = df_input['Mean_Gyro_Mag'].shift(1)
df_input['Acc_Mag_Peak_To_Peak'] = df_input['Std_Acc_Mag'] * 4 
df_input['Acc_Velocity_Estimate'] = df_input['Mean_Acc_Mag'] * 2.56

# Derived statistical features (IQR, Entropy)
if 'IQR_Acc_Mag' not in df_input.columns:
    df_input['IQR_Acc_Mag'] = df_input['Std_Acc_Mag'] * 1.349
if 'IQR_Gyro_Mag' not in df_input.columns:
    df_input['IQR_Gyro_Mag'] = df_input['Std_Gyro_Mag'] * 1.349
if 'Entropy_Acc_Mag' not in df_input.columns:
    df_input['Entropy_Acc_Mag'] = 2.1
if 'Entropy_Gyro_Mag' not in df_input.columns:
    df_input['Entropy_Gyro_Mag'] = 2.1

# Dominant_Freq_Gyro_Mag might not exist in older feature CSVs
if 'Dominant_Freq_Gyro_Mag' not in df_input.columns:
    df_input['Dominant_Freq_Gyro_Mag'] = df_input['Dominant_Freq_Acc_Mag'] * 0.5

df_input.fillna(0, inplace=True)

expected_features = [
    'Mean_Acc_Mag', 'Std_Acc_Mag', 'IQR_Acc_Mag', 'Entropy_Acc_Mag',
    'Mean_Abs_Jerk_Acc_Mag', 'Dominant_Freq_Acc_Mag', 'Mean_Gyro_Mag',
    'Std_Gyro_Mag', 'IQR_Gyro_Mag', 'Entropy_Gyro_Mag',
    'Mean_Abs_Jerk_Gyro_Mag', 'Dominant_Freq_Gyro_Mag',
    'Prev_Mean_Acc_Mag', 'Prev_Mean_Gyro_Mag',
    'Acc_Mag_Peak_To_Peak', 'Acc_Velocity_Estimate'
]

X = df_input[expected_features]

print("Running batch classification across all time windows...")
encoded_predictions = model.predict(X)
df_input['Predicted_Class_ID'] = encoded_predictions
df_input['Predicted_Activity'] = [activity_names.get(p, "Unknown") for p in encoded_predictions]

print("Calculating KineTrace Stability Index (KSI)...")
df_input['KSI'] = calculate_ksi(df_input)

output_dir = "output"
plots_dir = os.path.join(output_dir, "plots")
os.makedirs(plots_dir, exist_ok=True)

existing_reports = glob.glob(os.path.join(output_dir, "run_*_clinical_report.csv"))
run_number = len(existing_reports) + 1
run_prefix = f"run_{run_number:03d}"

csv_path = os.path.join(output_dir, f"{run_prefix}_clinical_report.csv")
plot_path = os.path.join(plots_dir, f"{run_prefix}_mobility_stability_plot.png")

df_input.to_csv(csv_path, index=False)
print(f"Batch report saved to: {csv_path}")

print("Generating visual timeline...")
plt.figure(figsize=(12, 6))
plt.plot(df_input.index, df_input['KSI'], color='blue', label='Stability Index (KSI)', alpha=0.6)

colors = {'Walking': 'green', 'Upstairs': 'orange', 'Downstairs': 'red', 'Sitting': 'purple', 'Standing': 'brown', 'Lying/Jogging': 'gray'}
for activity in df_input['Predicted_Activity'].unique():
    mask = df_input['Predicted_Activity'] == activity
    plt.scatter(df_input.index[mask], df_input['KSI'][mask], color=colors.get(activity, 'black'), label=activity, s=15, zorder=5)

plt.title("KineTrace Patient Mobility & Stability Timeline", fontsize=14, fontweight='bold')
plt.xlabel("Time Windows (2.56s sequential blocks)", fontsize=12)
plt.ylabel("Stability Score (%)", fontsize=12)
plt.ylim(-5, 105)
plt.grid(True, linestyle='--', alpha=0.5)

handles, labels = plt.gca().get_legend_handles_labels()
by_label = dict(zip(labels, handles))
plt.legend(by_label.values(), by_label.keys(), loc='lower left')
plt.tight_layout()

plt.savefig(plot_path)
print(f"Visual plot saved to: {plot_path}")
plt.show()