// Keeps the small illustrative example responsive to its two user inputs.
(() => {
  const hoursInput = document.getElementById('example-hours');
  const hoursValue = document.getElementById('example-hours-value');
  const priorityInput = document.getElementById('example-priority');
  const result = document.querySelector('.v3-example-result');
  if (!hoursInput || !priorityInput || !result) return;

  const heading = result.querySelector('h3');
  const description = [...result.querySelectorAll('p')].at(-1);
  if (!heading || !description) return;
  description.setAttribute('aria-live', 'polite');

  const render = () => {
    const hours = Number(hoursInput.value);
    if (hoursValue) {
      hoursValue.value = `${hours} hours`;
      hoursValue.textContent = `${hours} hours`;
    }
    const priority = priorityInput.value;
    const monthlyHours = Math.round(hours * 4.3 * 10) / 10;
    const amount = Number.isInteger(monthlyHours) ? String(monthlyHours) : monthlyHours.toFixed(1);
    const copy = {
      'Time back': {
        heading: `About ${amount} hours each month.`,
        detail: `${hours} hours a week × 4.3 weeks. Which part could you simplify?`
      },
      'Lower running cost': {
        heading: `What does ${hours} hours a week cost?`,
        detail: 'Use an hourly cost to compare the current effort with a potential change.'
      },
      'A faster result': {
        heading: `Where do those ${hours} hours go?`,
        detail: 'Map the steps that affect time to result, then identify one bottleneck worth exploring.'
      }
    }[priority] || {
      heading: `${amount} hours a month to examine.`,
      detail: `At ${hours} hours each week, roughly ${amount} hours over four and a third weeks are in scope. This is an assumption to explore, not a forecast.`
    };
    heading.textContent = copy.heading;
    description.textContent = copy.detail;
  };

  hoursInput.addEventListener('input', render);
  priorityInput.addEventListener('change', render);
  render();
})();
