import os
import glob
import pandas as pd
import numpy as np

output_dir = "output"
os.makedirs(output_dir, exist_ok=True)

existing_reports = glob.glob(os.path.join(output_dir, "run_*_stability_metrics.csv"))
run_number = len(existing_reports) + 1
run_prefix = f"run_{run_number:03d}"

print("Evaluating clinical baseline safety coefficients across dataset features...")
df_uci = pd.read_csv("data/kine_features_train_mag.csv")
df_motion = pd.read_csv("data/kine_features_motionsense_mag.csv")
df_combined = pd.concat([df_uci, df_motion], ignore_index=True)

alpha = 50.0
beta = 20.0
df_combined['KSI'] = 100 - (alpha * df_combined['Mean_Abs_Jerk_Acc_Mag'] + beta * df_combined['Std_Acc_Mag'])
df_combined['KSI'] = np.clip(df_combined['KSI'], 0, 100)

stability_summary = df_combined.groupby('Activity_Label').agg(
    Average_Stability_Index=('KSI', 'mean'),
    Peak_Instability_Jerk=('Mean_Abs_Jerk_Acc_Mag', 'max'),
    Movement_Variance=('Std_Acc_Mag', 'mean')
).reset_index()

csv_save_path = os.path.join(output_dir, f"{run_prefix}_stability_metrics.csv")
stability_summary.to_csv(csv_save_path, index=False)
print(f"Stand-alone metric reporting blocks archived to: {csv_save_path}")