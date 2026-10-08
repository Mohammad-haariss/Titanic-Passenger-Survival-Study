/**
 * Titanic Dashboard Chart Visualization Engine
 * Renders dynamic Chart.js interactive charts with custom dark luxury aesthetic.
 */

class TitanicCharts {
  constructor() {
    this.chartInstances = {};
    // Palette
    this.colors = {
      survived: 'rgba(76, 201, 240, 0.85)',
      survivedBorder: '#4cc9f0',
      perished: 'rgba(247, 37, 133, 0.85)',
      perishedBorder: '#f72585',
      gold: 'rgba(224, 169, 109, 0.85)',
      goldBorder: '#e0a96d',
      navyLight: 'rgba(28, 37, 65, 0.8)',
      purple: 'rgba(114, 9, 183, 0.85)',
      cyan: 'rgba(72, 149, 239, 0.85)'
    };
  }

  // Helper to safely destroy existing chart instance
  destroyChart(id) {
    if (this.chartInstances[id]) {
      this.chartInstances[id].destroy();
      delete this.chartInstances[id];
    }
  }

  // Common dark theme options
  getCommonOptions(titleText) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: '#e2e8f0',
            font: { family: 'Plus Jakarta Sans', size: 12, weight: 500 }
          }
        },
        title: {
          display: true,
          text: titleText,
          color: '#f8fafc',
          font: { family: 'Cinzel', size: 16, weight: 'bold' },
          padding: { bottom: 15 }
        },
        tooltip: {
          backgroundColor: '#0f172a',
          titleColor: '#e0a96d',
          bodyColor: '#f8fafc',
          borderColor: 'rgba(224, 169, 109, 0.3)',
          borderWidth: 1,
          padding: 12,
          boxPadding: 6
        }
      },
      scales: {
        x: {
          ticks: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans' } },
          grid: { color: 'rgba(255, 255, 255, 0.05)' }
        },
        y: {
          ticks: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans' } },
          grid: { color: 'rgba(255, 255, 255, 0.05)' }
        }
      }
    };
  }

  // 1. Gender Survival Rate Chart
  renderGenderChart(containerId, dataset) {
    this.destroyChart(containerId);
    const canvas = document.getElementById(containerId);
    if (!canvas) return;

    const females = dataset.filter(p => p.sex === 'female');
    const males = dataset.filter(p => p.sex === 'male');

    const fSurvived = females.filter(p => p.survived === 1).length;
    const fPerished = females.length - fSurvived;

    const mSurvived = males.filter(p => p.survived === 1).length;
    const mPerished = males.length - mSurvived;

    this.chartInstances[containerId] = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: ['Female Passengers', 'Male Passengers'],
        datasets: [
          {
            label: 'Survived',
            data: [fSurvived, mSurvived],
            backgroundColor: this.colors.survived,
            borderColor: this.colors.survivedBorder,
            borderWidth: 1,
            borderRadius: 6
          },
          {
            label: 'Perished',
            data: [fPerished, mPerished],
            backgroundColor: this.colors.perished,
            borderColor: this.colors.perishedBorder,
            borderWidth: 1,
            borderRadius: 6
          }
        ]
      },
      options: this.getCommonOptions('Survival Outcomes by Gender ("Women & Children First")')
    });
  }

  // 2. Ticket Class Survival Chart
  renderClassChart(containerId, dataset) {
    this.destroyChart(containerId);
    const canvas = document.getElementById(containerId);
    if (!canvas) return;

    const classes = [1, 2, 3];
    const rates = classes.map(c => {
      const pGroup = dataset.filter(p => p.pclass === c);
      const surv = pGroup.filter(p => p.survived === 1).length;
      return pGroup.length ? parseFloat(((surv / pGroup.length) * 100).toFixed(1)) : 0;
    });

    this.chartInstances[containerId] = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: ['1st Class (Upper Deck)', '2nd Class (Middle Deck)', '3rd Class (Lower Deck)'],
        datasets: [{
          label: 'Survival Rate (%)',
          data: rates,
          backgroundColor: [this.colors.gold, 'rgba(72, 149, 239, 0.85)', 'rgba(114, 9, 183, 0.85)'],
          borderColor: [this.colors.goldBorder, '#4895ef', '#7209b7'],
          borderWidth: 1,
          borderRadius: 6
        }]
      },
      options: {
        ...this.getCommonOptions('Survival Rate by Passenger Class (%)'),
        scales: {
          y: {
            min: 0,
            max: 100,
            ticks: {
              color: '#94a3b8',
              callback: value => value + '%'
            },
            grid: { color: 'rgba(255, 255, 255, 0.05)' }
          },
          x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255, 255, 255, 0.05)' } }
        }
      }
    });
  }

  // 3. Age Brackets Survival Chart
  renderAgeChart(containerId, dataset) {
    this.destroyChart(containerId);
    const canvas = document.getElementById(containerId);
    if (!canvas) return;

    const ageBrackets = [
      { label: '0-10 (Children)', min: 0, max: 10 },
      { label: '11-20 (Teens)', min: 11, max: 20 },
      { label: '21-30 (Young Adults)', min: 21, max: 30 },
      { label: '31-40 (Adults)', min: 31, max: 40 },
      { label: '41-50 (Middle Aged)', min: 41, max: 50 },
      { label: '51-60 (Seniors)', min: 51, max: 60 },
      { label: '61+ (Elderly)', min: 61, max: 120 }
    ];

    const survivedData = [];
    const perishedData = [];

    ageBrackets.forEach(b => {
      const inBracket = dataset.filter(p => p.age >= b.min && p.age <= b.max);
      survivedData.push(inBracket.filter(p => p.survived === 1).length);
      perishedData.push(inBracket.filter(p => p.survived === 0).length);
    });

    this.chartInstances[containerId] = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: ageBrackets.map(b => b.label),
        datasets: [
          {
            label: 'Survived',
            data: survivedData,
            backgroundColor: this.colors.survived,
            borderColor: this.colors.survivedBorder,
            borderWidth: 1,
            borderRadius: 4
          },
          {
            label: 'Perished',
            data: perishedData,
            backgroundColor: this.colors.perished,
            borderColor: this.colors.perishedBorder,
            borderWidth: 1,
            borderRadius: 4
          }
        ]
      },
      options: this.getCommonOptions('Demographic Survival Breakdown by Age Group')
    });
  }

  // 4. Family Size Chart
  renderFamilyChart(containerId, dataset) {
    this.destroyChart(containerId);
    const canvas = document.getElementById(containerId);
    if (!canvas) return;

    const familyCategories = [
      { label: 'Solo (1)', filter: p => p.sibsp + p.parch === 0 },
      { label: 'Small Family (2-4)', filter: p => p.sibsp + p.parch >= 1 && p.sibsp + p.parch <= 3 },
      { label: 'Large Family (5+)', filter: p => p.sibsp + p.parch >= 4 }
    ];

    const rates = familyCategories.map(cat => {
      const pGroup = dataset.filter(cat.filter);
      const surv = pGroup.filter(p => p.survived === 1).length;
      return pGroup.length ? parseFloat(((surv / pGroup.length) * 100).toFixed(1)) : 0;
    });

    this.chartInstances[containerId] = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: familyCategories.map(c => c.label),
        datasets: [{
          data: rates,
          backgroundColor: [this.colors.cyan, this.colors.gold, this.colors.perished],
          borderColor: '#0f172a',
          borderWidth: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#e2e8f0', font: { family: 'Plus Jakarta Sans', size: 12 } }
          },
          title: {
            display: true,
            text: 'Survival Rate by Family Size Category (%)',
            color: '#f8fafc',
            font: { family: 'Cinzel', size: 16 }
          },
          tooltip: {
            callbacks: {
              label: (context) => `${context.label}: ${context.raw}% survival rate`
            }
          }
        }
      }
    });
  }

  // 5. Embarkation Port Survival Chart
  renderEmbarkedChart(containerId, dataset) {
    this.destroyChart(containerId);
    const canvas = document.getElementById(containerId);
    if (!canvas) return;

    const ports = [
      { code: 'S', name: 'Southampton' },
      { code: 'C', name: 'Cherbourg' },
      { code: 'Q', name: 'Queenstown' }
    ];

    const survivedData = ports.map(port => dataset.filter(p => p.embarked === port.code && p.survived === 1).length);
    const perishedData = ports.map(port => dataset.filter(p => p.embarked === port.code && p.survived === 0).length);

    this.chartInstances[containerId] = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: ports.map(p => p.name),
        datasets: [
          {
            label: 'Survived',
            data: survivedData,
            backgroundColor: this.colors.survived,
            borderColor: this.colors.survivedBorder,
            borderWidth: 1,
            borderRadius: 6
          },
          {
            label: 'Perished',
            data: perishedData,
            backgroundColor: this.colors.perished,
            borderColor: this.colors.perishedBorder,
            borderWidth: 1,
            borderRadius: 6
          }
        ]
      },
      options: this.getCommonOptions('Survival Distribution by Port of Embarkation')
    });
  }

  // Render all dashboard charts
  renderAll(dataset = TITANIC_DATASET) {
    this.renderGenderChart('chart-gender', dataset);
    this.renderClassChart('chart-class', dataset);
    this.renderAgeChart('chart-age', dataset);
    this.renderFamilyChart('chart-family', dataset);
    this.renderEmbarkedChart('chart-embarked', dataset);
  }
}

const DASHBOARD_CHARTS = new TitanicCharts();
