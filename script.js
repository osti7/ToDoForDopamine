const STORAGE_KEY = 'todoForDopamine';

const fill = document.querySelector('.progress-fill');
const label = document.querySelector('.progress-label');
const taskListEl = document.querySelector('.task-list');
const taskAddForm = document.querySelector('.task-add');
const taskAddInput = document.querySelector('.task-add__input');
const metaCounter = document.querySelector('.task-meta-counter');
const metaStep = document.querySelector('.task-meta-step');
const themeTrigger = document.querySelector('.theme-picker__trigger');
const themeMenu = document.querySelector('.theme-picker__menu');

const CHECK_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true">' +
  '<path d="M5 13l4 4L19 7"></path></svg>';

const TRASH_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
  '<path d="M3 6h18"></path>' +
  '<path d="M8 6V4h8v2"></path>' +
  '<path d="M19 6l-1 14H6L5 6"></path>' +
  '<path d="M10 11v6"></path><path d="M14 11v6"></path></svg>';

const THEME_OPTIONS = [
  { color: 'red', label: 'RD' },
  { color: 'orange', label: 'RNG' },
  { color: 'yellow', label: 'YLLW' },
  { color: 'green', label: 'GRN' },
  { color: 'blue', label: 'BL' },
  { color: 'purple', label: 'PRPL' },
  { color: 'pink', label: 'PNK' },
  { color: 'black', label: 'BLCK' },
];

let state = {
  tasks: [],
  colorTheme: 'purple',
};

function createElement(tag, props) {
  var el = document.createElement(tag);
  Object.keys(props).forEach(function (key) {
    if (key === 'className') {
      el.className = props[key];
    } else if (key === 'textContent') {
      el.textContent = props[key];
    } else if (key === 'innerHTML') {
      el.innerHTML = props[key];
    } else {
      el.setAttribute(key, props[key]);
    }
  });
  return el;
}

function findTaskById(id) {
  return state.tasks.find(function (item) {
    return item.id === id;
  });
}

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
  state.colorTheme = colorTheme;
  document.documentElement.setAttribute('data-color', colorTheme);

  document.querySelectorAll('.theme-picker__option').forEach(function (option) {
    option.classList.toggle('is-active', option.dataset.color === colorTheme);
  });
}

function setThemeMenuOpen(isOpen) {
  themeMenu.hidden = !isOpen;
  themeTrigger.setAttribute('aria-expanded', String(isOpen));
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
  const task = findTaskById(id);
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

function renderThemeOptions() {
  var container = document.querySelector('.theme-picker__options');
  container.innerHTML = '';

  THEME_OPTIONS.forEach(function (theme) {
    var colorName = theme.color.charAt(0).toUpperCase() + theme.color.slice(1);
    var btn = createElement('button', {
      type: 'button',
      className: 'theme-picker__option',
      'data-color': theme.color,
      'aria-label': colorName + ' theme',
    });

    btn.appendChild(createElement('span', { className: 'theme-picker__swatch' }));
    btn.appendChild(document.createTextNode(' ' + theme.label));
    container.appendChild(btn);
  });
}

function renderTasks() {
  taskListEl.innerHTML = '';

  if (state.tasks.length === 0) {
    taskListEl.appendChild(createElement('li', {
      className: 'task-list__empty',
      textContent: 'No tasks yet. Add one with +',
    }));
    return;
  }

  state.tasks.forEach(function (task) {
    var item = createElement('li', {
      className: 'task-item' + (task.done ? ' task-item--done' : ''),
      'data-id': task.id,
    });

    item.appendChild(createElement('button', {
      type: 'button',
      className: 'task-item__check',
      'aria-label': task.done ? 'Mark as incomplete' : 'Mark as complete',
      innerHTML: CHECK_ICON,
    }));

    item.appendChild(createElement('span', {
      className: 'task-item__text',
      textContent: task.text,
    }));

    item.appendChild(createElement('button', {
      type: 'button',
      className: 'task-item__delete',
      'aria-label': 'Delete task',
      innerHTML: TRASH_ICON,
    }));

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
renderThemeOptions();
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
  setThemeMenuOpen(themeMenu.hidden);
});

themeMenu.addEventListener('click', function (event) {
  var option = event.target.closest('.theme-picker__option');
  if (!option) {
    return;
  }
  applyColorTheme(option.dataset.color);
  saveState();
  setThemeMenuOpen(false);
});

document.addEventListener('click', function (event) {
  if (!event.target.closest('.theme-picker')) {
    setThemeMenuOpen(false);
  }
});

document.addEventListener('keydown', function (event) {
  if (event.key === 'Escape') {
    setThemeMenuOpen(false);
  }
});
