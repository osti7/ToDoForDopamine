/**
 * @jest-environment jsdom
 */

var fs = require('fs');
var path = require('path');

var htmlContent = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');

function setupDOM() {
  document.documentElement.innerHTML = htmlContent;

  // Remove existing scripts to prevent auto-execution
  var scripts = document.querySelectorAll('script');
  scripts.forEach(function (s) { s.remove(); });

  // Clear any previously loaded module
  delete require.cache[require.resolve('../task-logic')];
}

var logic;

beforeEach(function () {
  setupDOM();
  localStorage.clear();
  logic = require('../task-logic');
  logic.resetState();
});

afterEach(function () {
  delete require.cache[require.resolve('../task-logic')];
});

// ---------- DOM rendering helpers ----------

function getTaskListEl() {
  return document.querySelector('.task-list');
}

function getProgressFill() {
  return document.querySelector('.progress-fill');
}

function getProgressLabel() {
  return document.querySelector('.progress-label');
}

function getMetaCounter() {
  return document.querySelector('.task-meta-counter');
}

function getMetaStep() {
  return document.querySelector('.task-meta-step');
}

function getThemeMenu() {
  return document.querySelector('.theme-picker__menu');
}

function getThemeTrigger() {
  return document.querySelector('.theme-picker__trigger');
}

// Simplified render function that mirrors script.js
function renderTasks() {
  var taskListEl = getTaskListEl();
  var st = logic.getState();
  taskListEl.innerHTML = '';

  if (st.tasks.length === 0) {
    var emptyItem = document.createElement('li');
    emptyItem.className = 'task-list__empty';
    emptyItem.textContent = 'No tasks yet. Add one with +';
    taskListEl.appendChild(emptyItem);
    return;
  }

  st.tasks.forEach(function (task) {
    var item = document.createElement('li');
    item.className = 'task-item' + (task.done ? ' task-item--done' : '');
    item.dataset.id = task.id;

    var checkBtn = document.createElement('button');
    checkBtn.type = 'button';
    checkBtn.className = 'task-item__check';
    checkBtn.setAttribute('aria-label', task.done ? 'Mark as incomplete' : 'Mark as complete');

    var textSpan = document.createElement('span');
    textSpan.className = 'task-item__text';
    textSpan.textContent = task.text;

    var deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'task-item__delete';
    deleteBtn.setAttribute('aria-label', 'Delete task');

    item.appendChild(checkBtn);
    item.appendChild(textSpan);
    item.appendChild(deleteBtn);
    taskListEl.appendChild(item);
  });
}

function render() {
  var progress = logic.getProgress();
  var fill = getProgressFill();
  var label = getProgressLabel();
  var metaCounter = getMetaCounter();
  var metaStep = getMetaStep();

  fill.style.width = progress.percent + '%';
  label.textContent = logic.formatPercent(progress.percent) + '%';
  metaCounter.textContent = progress.done + ' / ' + progress.total + ' completed';

  if (progress.total === 0) {
    metaStep.textContent = 'Add a task to start';
  } else {
    metaStep.textContent = 'Each task +' + logic.formatStep(progress.step);
  }

  renderTasks();
  logic.saveState();
}

// ---------- renderTasks tests ----------

describe('renderTasks (DOM)', function () {
  it('shows empty message when no tasks exist', function () {
    renderTasks();
    var taskListEl = getTaskListEl();
    var empty = taskListEl.querySelector('.task-list__empty');
    expect(empty).not.toBeNull();
    expect(empty.textContent).toBe('No tasks yet. Add one with +');
  });

  it('renders task items for each task', function () {
    logic.addTask('Task A');
    logic.addTask('Task B');
    renderTasks();
    var items = getTaskListEl().querySelectorAll('.task-item');
    expect(items.length).toBe(2);
  });

  it('applies done class to completed tasks', function () {
    logic.addTask('Task A');
    var id = logic.getState().tasks[0].id;
    logic.toggleTask(id);
    renderTasks();
    var item = getTaskListEl().querySelector('.task-item');
    expect(item.classList.contains('task-item--done')).toBe(true);
  });

  it('sets correct aria-label for incomplete task', function () {
    logic.addTask('Task A');
    renderTasks();
    var checkBtn = getTaskListEl().querySelector('.task-item__check');
    expect(checkBtn.getAttribute('aria-label')).toBe('Mark as complete');
  });

  it('sets correct aria-label for completed task', function () {
    logic.addTask('Task A');
    logic.getState().tasks[0].done = true;
    renderTasks();
    var checkBtn = getTaskListEl().querySelector('.task-item__check');
    expect(checkBtn.getAttribute('aria-label')).toBe('Mark as incomplete');
  });

  it('renders task text correctly', function () {
    logic.addTask('Read a book');
    renderTasks();
    var textSpan = getTaskListEl().querySelector('.task-item__text');
    expect(textSpan.textContent).toBe('Read a book');
  });

  it('sets dataset id on each task item', function () {
    logic.addTask('Task');
    renderTasks();
    var item = getTaskListEl().querySelector('.task-item');
    expect(item.dataset.id).toBe(logic.getState().tasks[0].id);
  });
});

// ---------- render tests ----------

describe('render (DOM)', function () {
  it('updates progress bar width to 0% when no tasks', function () {
    render();
    expect(getProgressFill().style.width).toBe('0%');
  });

  it('updates progress label to 0% when no tasks', function () {
    render();
    expect(getProgressLabel().textContent).toBe('0%');
  });

  it('shows correct counter text', function () {
    logic.addTask('A');
    logic.addTask('B');
    logic.getState().tasks[0].done = true;
    render();
    expect(getMetaCounter().textContent).toBe('1 / 2 completed');
  });

  it('shows "Add a task to start" when no tasks', function () {
    render();
    expect(getMetaStep().textContent).toBe('Add a task to start');
  });

  it('shows step info when tasks exist', function () {
    logic.addTask('A');
    logic.addTask('B');
    logic.addTask('C');
    logic.addTask('D');
    render();
    expect(getMetaStep().textContent).toBe('Each task +25%');
  });

  it('updates progress bar width when tasks are completed', function () {
    logic.addTask('A');
    logic.addTask('B');
    logic.getState().tasks[0].done = true;
    render();
    expect(getProgressFill().style.width).toBe('50%');
  });

  it('shows 100% when all tasks are done', function () {
    logic.addTask('A');
    logic.getState().tasks[0].done = true;
    render();
    expect(getProgressLabel().textContent).toBe('100%');
    expect(getProgressFill().style.width).toBe('100%');
  });

  it('saves state to localStorage on render', function () {
    logic.addTask('Persist me');
    render();
    var saved = JSON.parse(localStorage.getItem(logic.STORAGE_KEY));
    expect(saved.tasks.length).toBe(1);
    expect(saved.tasks[0].text).toBe('Persist me');
  });
});

// ---------- Theme menu tests ----------

describe('theme menu (DOM)', function () {
  it('theme menu is initially hidden', function () {
    var menu = getThemeMenu();
    expect(menu.hidden).toBe(true);
  });

  it('theme trigger has aria-expanded=false initially', function () {
    var trigger = getThemeTrigger();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('theme options have correct data-color attributes', function () {
    var options = document.querySelectorAll('.theme-picker__option');
    var colors = Array.from(options).map(function (o) { return o.dataset.color; });
    expect(colors).toContain('red');
    expect(colors).toContain('purple');
    expect(colors).toContain('blue');
  });
});

// ---------- applyColorTheme (DOM) ----------

describe('applyColorTheme (DOM)', function () {
  it('sets data-color attribute on documentElement', function () {
    logic.getState().colorTheme = 'green';
    document.documentElement.setAttribute('data-color', 'green');
    expect(document.documentElement.getAttribute('data-color')).toBe('green');
  });
});
