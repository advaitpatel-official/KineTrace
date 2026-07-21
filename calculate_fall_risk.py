import os
import glob
import pandas as pd
import numpy as np

output_dir = "output"
os.makedirs(output_dir, exist_ok=True)

report_files = glob.glob(os.path.join(output_dir, "run_*_clinical_report.csv"))

if not report_files:
    print("No clinical batch reports found. Please execute 'run_kinetrace_analysis.py' first.")
    exit()

latest_report = max(report_files, key=os.path.getctime)
print(f"Analyzing patient mobility structures from: {latest_report}")

df = pd.read_csv(latest_report)

if 'KSI' not in df.columns or 'Predicted_Activity' not in df.columns:
    print("Required KineTrace metrics (KSI/Predicted_Activity) missing from report.")
    exit()

active_activities = ['Walking', 'Upstairs', 'Downstairs', 'Lying/Jogging']
df_active = df[df['Predicted_Activity'].isin(active_activities)]

mean_active_ksi = df_active['KSI'].mean() if not df_active.empty else 100.0
min_active_ksi = df_active['KSI'].min() if not df_active.empty else 100.0
jerk_instability = df['Mean_Abs_Jerk_Acc_Mag'].max()

risk_score = 0
reasons = []

if mean_active_ksi < 75.0:
    risk_score += 40
    reasons.append(f"Low overall dynamic stability (Average Active KSI: {mean_active_ksi:.1f}%)")
elif mean_active_ksi < 85.0:
    risk_score += 20
    reasons.append(f"Moderate gait variability detected (Average Active KSI: {mean_active_ksi:.1f}%)")

if min_active_ksi < 50.0:
    risk_score += 35
    reasons.append(f"Severe transient instability spikes observed (Lowest KSI Drop: {min_active_ksi:.1f}%)")
elif min_active_ksi < 65.0:
    risk_score += 15
    reasons.append(f"Moderate balance disruptions observed (Lowest KSI Drop: {min_active_ksi:.1f}%)")

if jerk_instability > 5.0:
    risk_score += 25
    reasons.append(f"Critical tremor or high-jerk accelerations recorded (Max Jerk: {jerk_instability:.2f} m/s³)")

risk_score = np.clip(risk_score, 0, 100)

if risk_score >= 70:
    risk_level = "HIGH RISK"
    clinical_rec = "Immediate clinical mobility assessment and physical therapy assistive intervention recommended."
elif risk_score >= 35:
    risk_level = "MODERATE RISK"
    clinical_rec = "Targeted balance retraining and regular tracking intervals recommended to prevent gait deterioration."
else:
    risk_level = "LOW RISK"
    clinical_rec = "Patient displays healthy biomechanical stability markers. Maintain routine tracking lifestyle parameters."

run_prefix = os.path.basename(latest_report).split('_clinical_report')[0]
summary_path = os.path.join(output_dir, f"{run_prefix}_risk_assessment_summary.txt")

with open(summary_path, "w", encoding="utf-8") as f:
    f.write("==================================================\n")
    f.write("        KINETRACE CLINICAL RISK ASSESSMENT        \n")
    f.write("==================================================\n\n")
    f.write(f"Source Assessment: {os.path.basename(latest_report)}\n")
    f.write(f"Calculated Patient Mobility Classification: {risk_level} ({risk_score}/100 Risk Index)\n")
    f.write(f"Clinical Recommendation:\n   {clinical_rec}\n\n")
    f.write("Biomechanical Indicator Triggers Identified:\n")
    if reasons:
        for reason in reasons:
            f.write(f"  - {reason}\n")
    else:
        f.write("  - No hazardous gait anomalies or stability drops detected across window blocks.\n")
    f.write("\n==================================================\n")

print(f"Risk evaluation complete! Profile summary archived to: {summary_path}")

with open(summary_path, "r", encoding="utf-8") as f:
    print("\n" + f.read())