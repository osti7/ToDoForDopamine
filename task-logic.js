var STORAGE_KEY = 'todoForDopamine';

var state = {
  tasks: [],
  colorTheme: 'purple',
};

function createId() {
  if (
    typeof window !== 'undefined' &&
    window.crypto &&
    typeof window.crypto.randomUUID === 'function'
  ) {
    return window.crypto.randomUUID();
  }

  return 'task-' + Date.now() + '-' + Math.random().toString(16).slice(2);
}

function getProgress() {
  var total = state.tasks.length;
  var done = state.tasks.filter(function (task) {
    return task.done;
  }).length;
  var percent = total > 0 ? (done / total) * 100 : 0;
  var step = total > 0 ? 100 / total : 0;

  return { total: total, done: done, percent: percent, step: step };
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

function addTask(text) {
  var trimmed = text.trim();
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
  var task = state.tasks.find(function (item) {
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

function loadState() {
  try {
    var saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

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

function resetState() {
  state.tasks = [];
  state.colorTheme = 'purple';
}

function getState() {
  return state;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    STORAGE_KEY: STORAGE_KEY,
    createId: createId,
    getProgress: getProgress,
    formatPercent: formatPercent,
    formatStep: formatStep,
    addTask: addTask,
    toggleTask: toggleTask,
    deleteTask: deleteTask,
    loadState: loadState,
    saveState: saveState,
    resetState: resetState,
    getState: getState,
  };
}
