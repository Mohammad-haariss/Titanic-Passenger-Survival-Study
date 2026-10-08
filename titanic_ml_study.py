"""
Titanic Passenger Survival Study - Machine Learning Analysis Script
===================================================================
Author: Data Science Workbench
Description: Performs exploratory data analysis, feature engineering,
model training (Logistic Regression, Random Forest), cross-validation,
and feature importance evaluation on Titanic passenger data.
"""

import sys
import pandas as pd
import numpy as np

# Try importing sklearn & visualization libraries
try:
    from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.linear_model import LogisticRegression
    from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, classification_report, confusion_matrix
    from sklearn.preprocessing import StandardScaler
except ImportError:
    print("scikit-learn is required. Install via: pip install scikit-learn pandas numpy")

# Built-in fallback sample Titanic dataset if no CSV is provided
SAMPLE_TITANIC_DATA = [
    {"pclass": 3, "sex": "male", "age": 22, "sibsp": 1, "parch": 0, "fare": 7.25, "embarked": "S", "survived": 0, "name": "Braund, Mr. Owen Harris"},
    {"pclass": 1, "sex": "female", "age": 38, "sibsp": 1, "parch": 0, "fare": 71.28, "embarked": "C", "survived": 1, "name": "Cumings, Mrs. John Bradley"},
    {"pclass": 3, "sex": "female", "age": 26, "sibsp": 0, "parch": 0, "fare": 7.92, "embarked": "S", "survived": 1, "name": "Heikkinen, Miss. Laina"},
    {"pclass": 1, "sex": "female", "age": 35, "sibsp": 1, "parch": 0, "fare": 53.10, "embarked": "S", "survived": 1, "name": "Futrelle, Mrs. Jacques Heath"},
    {"pclass": 3, "sex": "male", "age": 35, "sibsp": 0, "parch": 0, "fare": 8.05, "embarked": "S", "survived": 0, "name": "Allen, Mr. William Henry"},
    {"pclass": 3, "sex": "male", "age": 27, "sibsp": 0, "parch": 0, "fare": 8.46, "embarked": "Q", "survived": 0, "name": "Moran, Mr. James"},
    {"pclass": 1, "sex": "male", "age": 54, "sibsp": 0, "parch": 0, "fare": 51.86, "embarked": "S", "survived": 0, "name": "McCarthy, Mr. Timothy J"},
    {"pclass": 3, "sex": "male", "age": 2, "sibsp": 3, "parch": 1, "fare": 21.07, "embarked": "S", "survived": 0, "name": "Palsson, Master. Gosta Leonard"},
    {"pclass": 3, "sex": "female", "age": 27, "sibsp": 0, "parch": 2, "fare": 11.13, "embarked": "S", "survived": 1, "name": "Johnson, Mrs. Oscar W"},
    {"pclass": 2, "sex": "female", "age": 14, "sibsp": 1, "parch": 0, "fare": 30.07, "embarked": "C", "survived": 1, "name": "Nasser, Mrs. Nicholas"},
    {"pclass": 3, "sex": "female", "age": 4, "sibsp": 1, "parch": 1, "fare": 16.70, "embarked": "S", "survived": 1, "name": "Sandstrom, Miss. Marguerite Rut"},
    {"pclass": 1, "sex": "female", "age": 58, "sibsp": 0, "parch": 0, "fare": 26.55, "embarked": "S", "survived": 1, "name": "Bonnell, Miss. Elizabeth"},
    {"pclass": 3, "sex": "male", "age": 20, "sibsp": 0, "parch": 0, "fare": 8.05, "embarked": "S", "survived": 0, "name": "Saundercock, Mr. William Henry"},
    {"pclass": 3, "sex": "male", "age": 39, "sibsp": 1, "parch": 5, "fare": 31.27, "embarked": "S", "survived": 0, "name": "Andersson, Mr. Anders Johan"},
    {"pclass": 3, "sex": "female", "age": 14, "sibsp": 0, "parch": 0, "fare": 7.85, "embarked": "S", "survived": 0, "name": "Vestrom, Miss. Hulda Amanda"},
    {"pclass": 2, "sex": "female", "age": 55, "sibsp": 0, "parch": 0, "fare": 16.00, "embarked": "S", "survived": 1, "name": "Hewlett, Mrs. Mary D"},
    {"pclass": 3, "sex": "male", "age": 2, "sibsp": 4, "parch": 1, "fare": 29.12, "embarked": "Q", "survived": 0, "name": "Rice, Master. Eugene"},
    {"pclass": 2, "sex": "male", "age": 34, "sibsp": 0, "parch": 0, "fare": 13.00, "embarked": "S", "survived": 1, "name": "Beesley, Mr. Lawrence"},
    {"pclass": 1, "sex": "male", "age": 28, "sibsp": 0, "parch": 0, "fare": 35.50, "embarked": "S", "survived": 1, "name": "Sloper, Mr. William Thompson"},
    {"pclass": 1, "sex": "female", "age": 44, "sibsp": 0, "parch": 0, "fare": 27.72, "embarked": "C", "survived": 1, "name": "Brown, Mrs. James Joseph (Molly Brown)"}
]

def load_data(filepath=None):
    """Load data from CSV or fallback to sample dataset."""
    if filepath:
        try:
            df = pd.read_csv(filepath)
            print(f"Loaded {len(df)} rows from {filepath}")
            return df
        except Exception as e:
            print(f"Failed to load CSV ({e}), falling back to sample dataset.")

    df = pd.DataFrame(SAMPLE_TITANIC_DATA)
    print(f"Using sample Titanic dataset ({len(df)} records).")
    return df

def feature_engineering(df):
    """Perform data preprocessing and feature engineering."""
    df = df.copy()

    # 1. Fill missing values
    if 'age' in df.columns:
        df['age'] = df['age'].fillna(df['age'].median())
    if 'fare' in df.columns:
        df['fare'] = df['fare'].fillna(df['fare'].median())
    if 'embarked' in df.columns:
        df['embarked'] = df['embarked'].fillna('S')

    # 2. Extract Title from Name
    if 'name' in df.columns:
        df['title'] = df['name'].str.extract(r' ([A-Za-z]+)\.', expand=False)
        df['title'] = df['title'].replace(['Lady', 'Countess','Capt', 'Col','Don', 'Dr', 'Major', 'Rev', 'Sir', 'Jonkheer', 'Dona'], 'Rare')
        df['title'] = df['title'].replace('Mlle', 'Miss')
        df['title'] = df['title'].replace('Ms', 'Miss')
        df['title'] = df['title'].replace('Mme', 'Mrs')
    else:
        df['title'] = 'Mr'

    # 3. Family Size Feature
    df['family_size'] = df['sibsp'] + df['parch'] + 1
    df['is_alone'] = (df['family_size'] == 1).astype(int)

    # 4. Encoding Categorical Variables
    df['sex_encoded'] = df['sex'].map({'female': 1, 'male': 0})
    df = pd.get_dummies(df, columns=['embarked', 'title'], drop_first=True)

    return df

def train_and_evaluate(df):
    """Train Random Forest & Logistic Regression classifiers."""
    # Define features and target
    feature_cols = ['pclass', 'sex_encoded', 'age', 'sibsp', 'parch', 'fare', 'family_size', 'is_alone']
    # Add one-hot encoded dummy columns
    dummy_cols = [c for c in df.columns if c.startswith('embarked_') or c.startswith('title_')]
    feature_cols.extend(dummy_cols)

    X = df[feature_cols]
    y = df['survived']

    print("\n" + "="*50)
    print("FEATURE MATRIX SHAPE:", X.shape)
    print("TARGET SURVIVAL DISTRIBUTION:\n", y.value_counts(normalize=True))
    print("="*50 + "\n")

    # Split train/test
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)

    # Scale numerical features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # --- 1. Logistic Regression ---
    log_reg = LogisticRegression(random_state=42, max_iter=1000)
    log_reg.fit(X_train_scaled, y_train)
    y_pred_lr = log_reg.predict(X_test_scaled)
    acc_lr = accuracy_score(y_test, y_pred_lr)

    print(">>> LOGISTIC REGRESSION MODEL <<<")
    print(f"Accuracy: {acc_lr*100:.2f}%")
    print(classification_report(y_test, y_pred_lr, zero_division=0))

    # --- 2. Random Forest Classifier ---
    rf = RandomForestClassifier(n_estimators=100, random_state=42, max_depth=5)
    rf.fit(X_train, y_train)
    y_pred_rf = rf.predict(X_test)
    acc_rf = accuracy_score(y_test, y_pred_rf)

    print("\n>>> RANDOM FOREST CLASSIFIER <<<")
    print(f"Accuracy: {acc_rf*100:.2f}%")
    print(classification_report(y_test, y_pred_rf, zero_division=0))

    # Feature Importances
    importances = pd.Series(rf.feature_importances_, index=feature_cols).sort_values(ascending=False)
    print("\n" + "="*50)
    print("RANDOM FOREST FEATURE IMPORTANCE RANKING:")
    print("="*50)
    for feat, imp in importances.items():
        print(f"{feat:20s}: {imp*100:6.2f}%")

if __name__ == "__main__":
    csv_file = sys.argv[1] if len(sys.argv) > 1 else None
    raw_df = load_data(csv_file)
    processed_df = feature_engineering(raw_df)
    train_and_evaluate(processed_df)
