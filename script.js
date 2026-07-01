var fill = document.querySelector('.progress-fill');
var label = document.querySelector('.progress-label');
var taskListEl = document.querySelector('.task-list');
var taskAddForm = document.querySelector('.task-add');
var taskAddInput = document.querySelector('.task-add__input');
var metaCounter = document.querySelector('.task-meta-counter');
var metaStep = document.querySelector('.task-meta-step');
var themeTrigger = document.querySelector('.theme-picker__trigger');
var themeMenu = document.querySelector('.theme-picker__menu');
var themeOptions = document.querySelectorAll('.theme-picker__option');

var CHECK_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true">' +
  '<path d="M5 13l4 4L19 7"></path></svg>';

var TRASH_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
  '<path d="M3 6h18"></path>' +
  '<path d="M8 6V4h8v2"></path>' +
  '<path d="M19 6l-1 14H6L5 6"></path>' +
  '<path d="M10 11v6"></path><path d="M14 11v6"></path></svg>';

function applyColorTheme(colorTheme) {
  var st = getState();
  st.colorTheme = colorTheme;
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

function renderTasks() {
  var st = getState();
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
    checkBtn.innerHTML = CHECK_ICON;

    var textSpan = document.createElement('span');
    textSpan.className = 'task-item__text';
    textSpan.textContent = task.text;

    var deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'task-item__delete';
    deleteBtn.setAttribute('aria-label', 'Delete task');
    deleteBtn.innerHTML = TRASH_ICON;

    item.appendChild(checkBtn);
    item.appendChild(textSpan);
    item.appendChild(deleteBtn);
    taskListEl.appendChild(item);
  });
}

function render() {
  var progress = getProgress();

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
applyColorTheme(getState().colorTheme || 'purple');
render();

taskAddForm.addEventListener('submit', function (event) {
  event.preventDefault();
  addTask(taskAddInput.value);
  taskAddInput.value = '';
  taskAddInput.focus();
  render();
});

taskListEl.addEventListener('click', function (event) {
  var item = event.target.closest('.task-item');
  if (!item) {
    return;
  }

  var id = item.dataset.id;

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
