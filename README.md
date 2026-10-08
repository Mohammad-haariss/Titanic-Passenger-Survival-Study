# 🚢 Titanic Passenger Survival Study

An interactive Data Science Dashboard, Machine Learning Predictor Workbench, and Statistical Analysis System for the historical RMS Titanic passenger manifest (1912 disaster).

![Titanic Survival Study](https://img.shields.io/badge/Titanic-Data%20Science%20Study-0b132b?style=for-the-badge&logo=anchor)

---

## 🌟 Key Features

1. **📊 Executive Overview & Demographic Metrics**
   - High-level KPIs: Overall survival rate, gender survival discrepancy, passenger class stratification.
   - Historical background and critical key takeaways from survival manifests.

2. **📈 Interactive Visualizations (Chart.js)**
   - **Gender Survival Breakdown:** Demonstrating the impact of the *"Women & Children First"* evacuation protocol.
   - **Socioeconomic Ticket Class:** Comparing 1st Class (Upper Deck) vs 3rd Class (Lower Deck) survival outcomes.
   - **Age Brackets Distribution:** Histogram of survived vs perished passengers across age brackets.
   - **Family Unit Dynamics:** Doughnut chart analyzing solo travelers vs small (2-4) and large (5+) family survival rates.
   - **Embarkation Port:** Survival patterns across Southampton, Cherbourg, and Queenstown.

3. **🤖 Machine Learning Survival Predictor & Explainable AI**
   - In-browser Logistic Regression & Decision Tree inference engine.
   - Enter custom passenger attributes (Gender, Ticket Class, Age, Family Size, Fare, Embarkation Port, Cabin) to calculate real-time **Survival Probability (%)**.
   - **Feature Attribution Breakdown (SHAP-like Explainable AI):** Details exact positive/negative risk contributions of each passenger feature.
   - Integrated **Model Evaluation Scorecard:** Displays live Accuracy, Precision, Recall, F1-Score, and Confusion Matrix.

4. **🔍 Searchable Passenger Database Explorer**
   - Instant search by passenger name.
   - Multi-criteria filtering by Gender, Ticket Class, and Survival Status.
   - Paginated data table with status badges.

5. **🚢 Spatial Deck Plan & Evacuation Analysis**
   - Visual breakdown of Decks A through G with estimated survival rates and cabin proximity descriptions.

6. **⚡ "What-If" Evacuation Counterfactual Simulator**
   - Interactive sliders to test historical counterfactual scenarios:
     - What if Titanic had carried 32 or 48 lifeboats instead of 20?
     - How many lives could have been saved with adjusted boarding protocol enforcement?

7. **🐍 Python Data Science ML Analysis Script (`titanic_ml_study.py`)**
   - Standalone Python script using `pandas`, `scikit-learn`, and `numpy`.
   - Feature engineering (Title extraction, Family size, Solo status).
   - Logistic Regression and Random Forest model training with feature importance rankings.

---

## 🚀 How to Run

### Option 1: Launch Web Application Dashboard directly in Browser
Simply open `index.html` in any web browser!

Or using Node.js / `npx`:
```bash
npm start
```
Then open `http://localhost:3000` in your browser.

---

### Option 2: Run Python Data Science ML Analysis
Ensure Python 3.8+ is installed with `pandas` and `scikit-learn`:

```bash
pip install pandas numpy scikit-learn
python titanic_ml_study.py
```

To run with a custom CSV dataset:
```bash
python titanic_ml_study.py path/to/your_titanic_dataset.csv
```

---

## 📁 File Structure

```
Titanic Passenger Survival Study/
│
├── index.html            # Main Web App Interface & Tab Navigation
├── styles.css            # Custom Dark Luxury CSS Design System & Glassmorphism
├── data.js               # Historical Titanic Passenger Manifest Dataset & Metrics
├── model.js              # In-browser Machine Learning Classifier & Explainable AI
├── charts.js             # Dynamic Chart.js Visualization Engine
├── app.js                # Main Application Controller & State Manager
├── titanic_ml_study.py   # Python ML Training & Evaluation Script
├── package.json          # Project Metadata & Development Server Script
└── README.md             # Project Documentation
```

---

## 📊 Summary of Data Science Insights

| Feature | Historical Insight & Impact |
|---|---|
| **Gender (Sex)** | Women had a **~74% survival rate**, compared to **~19% for men**, making gender the single strongest predictor. |
| **Ticket Class (Pclass)** | **1st Class (63%)** > **2nd Class (47%)** > **3rd Class (24%)**, driven by upper deck proximity and boat access. |
| **Age** | Infants (<5 yrs) and children (<15 yrs) were prioritized, showing elevated survival odds over adults and elderly. |
| **Family Size** | Moderate family sizes (2 to 4 members) achieved optimal survival outcomes compared to solo travelers or large families. |
