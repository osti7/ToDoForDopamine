const STORAGE_KEY = 'todoForDopamine';
const VALID_THEMES = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'black'];

const fill = document.querySelector('.progress-fill');
const label = document.querySelector('.progress-label');
const taskListEl = document.querySelector('.task-list');
const taskAddForm = document.querySelector('.task-add');
const taskAddInput = document.querySelector('.task-add__input');
const metaCounter = document.querySelector('.task-meta-counter');
const metaStep = document.querySelector('.task-meta-step');
const themeTrigger = document.querySelector('.theme-picker__trigger');
const themeMenu = document.querySelector('.theme-picker__menu');
const themeOptions = document.querySelectorAll('.theme-picker__option');

function createCheckIcon() {
  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '3');
  svg.setAttribute('aria-hidden', 'true');
  var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M5 13l4 4L19 7');
  svg.appendChild(path);
  return svg;
}

function createTrashIcon() {
  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('aria-hidden', 'true');
  var paths = ['M3 6h18', 'M8 6V4h8v2', 'M19 6l-1 14H6L5 6', 'M10 11v6', 'M14 11v6'];
  paths.forEach(function (d) {
    var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', d);
    svg.appendChild(p);
  });
  return svg;
}

let state = {
  tasks: [],
  colorTheme: 'purple',
};

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

    if (Array.isArray(saved.tasks)) {
      state.tasks = saved.tasks
        .filter(function (task) {
          return task && typeof task.text === 'string';
        })
        .map(function (task) {
          return {
            id: task.id || createId(),
            text: task.text.trim(),
            done: Boolean(task.done),
          };
        })
        .filter(function (task) {
          return task.text.length > 0;
        });
    }

    if (typeof saved.colorTheme === 'string') {
      state.colorTheme = saved.colorTheme;
    }
  } catch (error) {
    state = { tasks: [], colorTheme: 'purple' };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function createId() {
  if (window.crypto && typeof window.crypto.randomUUID === 'function') {
    return window.crypto.randomUUID();
  }

  return 'task-' + Date.now() + '-' + Math.random().toString(16).slice(2);
}

function getProgress() {
  const total = state.tasks.length;
  const done = state.tasks.filter(function (task) {
    return task.done;
  }).length;
  const percent = total > 0 ? (done / total) * 100 : 0;
  const step = total > 0 ? 100 / total : 0;

  return { total, done, percent, step };
}

function formatPercent(value) {
  if (value === 0 || value === 100) {
    return String(Math.round(value));
  }

  return value.toFixed(1);
}

function formatStep(step) {
  if (Number.isInteger(step)) {
    return step + '%';
  }

  return step.toFixed(1) + '%';
}

function applyColorTheme(colorTheme) {
  if (VALID_THEMES.indexOf(colorTheme) === -1) {
    colorTheme = 'purple';
  }
  state.colorTheme = colorTheme;
  document.documentElement.setAttribute('data-color', colorTheme);

  themeOptions.forEach(function (option) {
    option.classList.toggle('is-active', option.dataset.color === colorTheme);
  });
}

function openThemeMenu() {
  themeMenu.hidden = false;
  themeTrigger.setAttribute('aria-expanded', 'true');
}

function closeThemeMenu() {
  themeMenu.hidden = true;
  themeTrigger.setAttribute('aria-expanded', 'false');
}

function toggleThemeMenu() {
  if (themeMenu.hidden) {
    openThemeMenu();
  } else {
    closeThemeMenu();
  }
}

function addTask(text) {
  const trimmed = text.trim();
  if (!trimmed) {
    return;
  }

  state.tasks.push({
    id: createId(),
    text: trimmed,
    done: false,
  });
}

function toggleTask(id) {
  const task = state.tasks.find(function (item) {
    return item.id === id;
  });

  if (!task) {
    return;
  }

  task.done = !task.done;
}

function deleteTask(id) {
  state.tasks = state.tasks.filter(function (item) {
    return item.id !== id;
  });
}

function renderTasks() {
  while (taskListEl.firstChild) {
    taskListEl.removeChild(taskListEl.firstChild);
  }

  if (state.tasks.length === 0) {
    const emptyItem = document.createElement('li');
    emptyItem.className = 'task-list__empty';
    emptyItem.textContent = 'No tasks yet. Add one with +';
    taskListEl.appendChild(emptyItem);
    return;
  }

  state.tasks.forEach(function (task) {
    const item = document.createElement('li');
    item.className = 'task-item' + (task.done ? ' task-item--done' : '');
    item.dataset.id = task.id;

    const checkBtn = document.createElement('button');
    checkBtn.type = 'button';
    checkBtn.className = 'task-item__check';
    checkBtn.setAttribute('aria-label', task.done ? 'Mark as incomplete' : 'Mark as complete');
    checkBtn.appendChild(createCheckIcon());

    const textSpan = document.createElement('span');
    textSpan.className = 'task-item__text';
    textSpan.textContent = task.text;

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'task-item__delete';
    deleteBtn.setAttribute('aria-label', 'Delete task');
    deleteBtn.appendChild(createTrashIcon());

    item.appendChild(checkBtn);
    item.appendChild(textSpan);
    item.appendChild(deleteBtn);
    taskListEl.appendChild(item);
  });
}

function render() {
  const progress = getProgress();

  fill.style.width = progress.percent + '%';
  label.textContent = formatPercent(progress.percent) + '%';
  metaCounter.textContent = progress.done + ' / ' + progress.total + ' completed';

  if (progress.total === 0) {
    metaStep.textContent = 'Add a task to start';
  } else {
    metaStep.textContent = 'Each task +' + formatStep(progress.step);
  }

  renderTasks();
  saveState();
}

loadState();
applyColorTheme(state.colorTheme || 'purple');
render();

taskAddForm.addEventListener('submit', function (event) {
  event.preventDefault();
  addTask(taskAddInput.value);
  taskAddInput.value = '';
  taskAddInput.focus();
  render();
});

taskListEl.addEventListener('click', function (event) {
  const item = event.target.closest('.task-item');
  if (!item) {
    return;
  }

  const id = item.dataset.id;

  if (event.target.closest('.task-item__check')) {
    toggleTask(id);
    render();
    return;
  }

  if (event.target.closest('.task-item__delete')) {
    deleteTask(id);
    render();
  }
});

themeTrigger.addEventListener('click', function (event) {
  event.stopPropagation();
  toggleThemeMenu();
});

themeOptions.forEach(function (option) {
  option.addEventListener('click', function () {
    applyColorTheme(option.dataset.color);
    saveState();
    closeThemeMenu();
  });
});

document.addEventListener('click', function (event) {
  if (!event.target.closest('.theme-picker')) {
    closeThemeMenu();
  }
});

document.addEventListener('keydown', function (event) {
  if (event.key === 'Escape') {
    closeThemeMenu();
  }
});
