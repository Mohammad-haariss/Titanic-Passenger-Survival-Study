/**
 * Titanic Survival Machine Learning Engine (JS Implementation)
 * Provides probability predictions, feature attribution breakdown, and model evaluation metrics.
 */

class TitanicSurvivalPredictor {
  constructor() {
    // Calibrated Weights based on Logistic Regression on Titanic Dataset
    this.intercept = -0.72;
    this.weights = {
      sex: { female: 2.65, male: -0.85 },
      pclass: { 1: 1.35, 2: 0.35, 3: -0.95 },
      ageCategory: {
        infant: 1.45,   // < 5
        child: 0.95,    // 5-14
        youth: 0.20,    // 15-24
        adult: 0.0,     // 25-54
        elderly: -0.75  // 55+
      },
      fareCategory: {
        high: 0.65,     // > 50
        medium: 0.15,   // 15 - 50
        low: -0.45      // < 15
      },
      familySize: {
        solo: -0.25,        // 1 person
        smallFamily: 0.55,  // 2-4 persons
        largeFamily: -1.25  // 5+ persons
      },
      embarked: { C: 0.42, Q: -0.10, S: -0.25 },
      hasCabin: { true: 0.70, false: -0.30 }
    };
  }

  // Sigmoid activation function
  sigmoid(z) {
    return 1 / (1 + Math.exp(-z));
  }

  // Determine age category label
  getAgeCategory(age) {
    const numericAge = parseFloat(age);
    if (isNaN(numericAge)) return 'adult';
    if (numericAge < 5) return 'infant';
    if (numericAge < 15) return 'child';
    if (numericAge < 25) return 'youth';
    if (numericAge < 55) return 'adult';
    return 'elderly';
  }

  // Determine fare category label
  getFareCategory(fare) {
    const numericFare = parseFloat(fare);
    if (isNaN(numericFare)) return 'medium';
    if (numericFare >= 50) return 'high';
    if (numericFare >= 15) return 'medium';
    return 'low';
  }

  // Determine family size category
  getFamilyCategory(sibsp, parch) {
    const total = (parseInt(sibsp) || 0) + (parseInt(parch) || 0) + 1;
    if (total === 1) return 'solo';
    if (total <= 4) return 'smallFamily';
    return 'largeFamily';
  }

  /**
   * Predict survival probability and explain feature impacts
   * @param {Object} passenger { sex, pclass, age, sibsp, parch, fare, embarked, cabin }
   * @returns {Object} { probability, logit, survivedPrediction, featureImpacts }
   */
  predict(passenger) {
    let z = this.intercept;
    const impacts = [];

    // Base bias
    impacts.push({
      feature: "Base Odds (Model Bias)",
      weight: this.intercept,
      impactText: "Baseline survival expectation without features",
      type: "neutral"
    });

    // 1. Gender Impact
    const sexVal = passenger.sex === "female" ? "female" : "male";
    const sexW = this.weights.sex[sexVal];
    z += sexW;
    impacts.push({
      feature: `Gender: ${sexVal === "female" ? "Female" : "Male"}`,
      weight: sexW,
      impactText: sexVal === "female" ? "'Women and children first' evacuation protocol (+2.65)" : "Lower priority during lifeboat loading (-0.85)",
      type: sexW > 0 ? "positive" : "negative"
    });

    // 2. Ticket Class (Pclass)
    const pclassVal = parseInt(passenger.pclass) || 3;
    const pclassW = this.weights.pclass[pclassVal] || 0;
    z += pclassW;
    impacts.push({
      feature: `Passenger Class: ${pclassVal === 1 ? "1st Class (Upper Deck)" : pclassVal === 2 ? "2nd Class (Middle Deck)" : "3rd Class (Lower Deck)"}`,
      weight: pclassW,
      impactText: pclassVal === 1 ? "Direct access to boat deck & priority (+1.35)" : pclassVal === 2 ? "Moderate deck proximity (+0.35)" : "Longer access distance & deck gates (-0.95)",
      type: pclassW > 0 ? "positive" : "negative"
    });

    // 3. Age
    const ageCat = this.getAgeCategory(passenger.age);
    const ageW = this.weights.ageCategory[ageCat];
    z += ageW;
    const ageDesc = {
      infant: "Infant (High lifeboat prioritization +1.45)",
      child: "Child (Prioritized during boarding +0.95)",
      youth: "Young Adult (+0.20)",
      adult: "Standard Adult (0.00)",
      elderly: "Senior Citizen (-0.75)"
    }[ageCat];
    impacts.push({
      feature: `Age Group: ${passenger.age} years (${ageCat})`,
      weight: ageW,
      impactText: ageDesc,
      type: ageW > 0 ? "positive" : ageW < 0 ? "negative" : "neutral"
    });

    // 4. Family Size
    const famCat = this.getFamilyCategory(passenger.sibsp, passenger.parch);
    const famW = this.weights.familySize[famCat];
    z += famW;
    const famDesc = {
      solo: "Traveling Alone (-0.25)",
      smallFamily: "Small Family Unit (2-4 people) - Better mutual aid (+0.55)",
      largeFamily: "Large Family (5+ people) - Harder to keep group together (-1.25)"
    }[famCat];
    impacts.push({
      feature: `Family Size: ${(parseInt(passenger.sibsp)||0) + (parseInt(passenger.parch)||0) + 1} person(s)`,
      weight: famW,
      impactText: famDesc,
      type: famW > 0 ? "positive" : "negative"
    });

    // 5. Fare Paid
    const fareCat = this.getFareCategory(passenger.fare);
    const fareW = this.weights.fareCategory[fareCat];
    z += fareW;
    impacts.push({
      feature: `Ticket Fare: £${parseFloat(passenger.fare || 0).toFixed(2)}`,
      weight: fareW,
      impactText: fareCat === 'high' ? "Luxury stateroom proximity (+0.65)" : fareCat === 'medium' ? "Standard fare tier (+0.15)" : "Economy fare tier (-0.45)",
      type: fareW > 0 ? "positive" : "negative"
    });

    // 6. Embarked Port
    const embVal = (passenger.embarked || 'S').toUpperCase();
    const embW = this.weights.embarked[embVal] || 0;
    z += embW;
    const portNames = { C: "Cherbourg (France)", Q: "Queenstown (Ireland)", S: "Southampton (UK)" };
    impacts.push({
      feature: `Embarkation Port: ${portNames[embVal] || embVal}`,
      weight: embW,
      impactText: embVal === 'C' ? "Higher proportion of 1st class passengers (+0.42)" : "Standard embarkation effect",
      type: embW > 0 ? "positive" : embW < 0 ? "negative" : "neutral"
    });

    // 7. Cabin Assigned
    const hasCabin = passenger.cabin && passenger.cabin !== "Unknown";
    const cabinW = this.weights.hasCabin[hasCabin ? "true" : "false"];
    z += cabinW;
    impacts.push({
      feature: `Cabin Assignment: ${hasCabin ? passenger.cabin : "No Cabin Recorded"}`,
      weight: cabinW,
      impactText: hasCabin ? "Registered cabin near upper decks (+0.70)" : "Unregistered cabin location (-0.30)",
      type: cabinW > 0 ? "positive" : "negative"
    });

    const probability = this.sigmoid(z);

    return {
      probability: (probability * 100).toFixed(1),
      logit: z.toFixed(2),
      survivedPrediction: probability >= 0.5 ? 1 : 0,
      riskLevel: probability >= 0.7 ? "High Chance of Survival" : probability >= 0.4 ? "Moderate Chance of Survival" : "Low Chance of Survival",
      featureImpacts: impacts
    };
  }

  // Model Evaluation metrics against the built-in dataset
  evaluateDataset(dataset) {
    let correct = 0;
    let tp = 0, fp = 0, tn = 0, fn = 0;

    dataset.forEach(passenger => {
      const pred = this.predict(passenger);
      const actual = passenger.survived;
      const predictedClass = pred.survivedPrediction;

      if (predictedClass === actual) correct++;

      if (predictedClass === 1 && actual === 1) tp++;
      if (predictedClass === 1 && actual === 0) fp++;
      if (predictedClass === 0 && actual === 0) tn++;
      if (predictedClass === 0 && actual === 1) fn++;
    });

    const accuracy = (correct / dataset.length) * 100;
    const precision = tp + fp > 0 ? (tp / (tp + fp)) * 100 : 0;
    const recall = tp + fn > 0 ? (tp / (tp + fn)) * 100 : 0;
    const f1Score = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

    return {
      accuracy: accuracy.toFixed(1),
      precision: precision.toFixed(1),
      recall: recall.toFixed(1),
      f1Score: f1Score.toFixed(1),
      confusionMatrix: { tp, fp, tn, fn }
    };
  }
}

// Global instance
const ML_ENGINE = new TitanicSurvivalPredictor();
