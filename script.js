const fill = document.querySelector('.progress-fill');
const label = document.querySelector('.progress-label');
const completeBtn = document.querySelector('.progress-btn--complete');
const resetBtn = document.querySelector('.progress-btn--reset');
const taskCountInput = document.querySelector('#task-count');
const taskListInput = document.querySelector('#task-list');
const metaCounter = document.querySelector('.task-meta-counter');
const metaStep = document.querySelector('.task-meta-step');

let completedTasks = 0;

function getTotalTasks() {
  const fromList = taskListInput.value
    .split('\n')
    .map(function (line) {
      return line.trim();
    })
    .filter(function (line) {
      return line.length > 0;
    });

  if (fromList.length > 0) {
    return fromList.length;
  }

  const count = parseInt(taskCountInput.value, 10);
  if (isNaN(count) || count < 1) {
    return 0;
  }

  return Math.min(count, 99);
}

function formatStep(step) {
  if (Number.isInteger(step)) {
    return step + '%';
  }
  return step.toFixed(1) + '%';
}

function render() {
  const total = getTotalTasks();
  const step = total > 0 ? 100 / total : 0;
  const percent = total > 0 ? (completedTasks / total) * 100 : 0;

  if (completedTasks > total) {
    completedTasks = total;
  }

  fill.style.width = percent + '%';
  label.textContent = '%' + Math.round(percent);
  metaCounter.textContent = completedTasks + ' / ' + total + ' completed';

  if (total === 0) {
    metaStep.textContent = 'Enter a valid task count';
  } else {
    metaStep.textContent = 'Each task +' + formatStep(step);
  }

  completeBtn.disabled = total === 0 || completedTasks >= total;
}

function completeTask() {
  const total = getTotalTasks();
  if (total === 0 || completedTasks >= total) {
    return;
  }

  completedTasks += 1;
  render();
}

function resetProgress() {
  completedTasks = 0;
  render();
}

completeBtn.addEventListener('click', completeTask);
resetBtn.addEventListener('click', resetProgress);
taskCountInput.addEventListener('input', render);
taskListInput.addEventListener('input', render);

render();
