var logic = require('../task-logic');

beforeEach(function () {
  logic.resetState();
  localStorage.clear();
});

// ---------- createId ----------

describe('createId', function () {
  it('returns a non-empty string', function () {
    var id = logic.createId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  it('generates unique ids on successive calls', function () {
    var ids = new Set();
    for (var i = 0; i < 50; i++) {
      ids.add(logic.createId());
    }
    expect(ids.size).toBe(50);
  });

  it('falls back to timestamp-based id when crypto.randomUUID is unavailable', function () {
    var original = window.crypto.randomUUID;
    window.crypto.randomUUID = undefined;

    var id = logic.createId();
    expect(id).toMatch(/^task-\d+-/);

    window.crypto.randomUUID = original;
  });
});

// ---------- formatPercent ----------

describe('formatPercent', function () {
  it('returns "0" for zero', function () {
    expect(logic.formatPercent(0)).toBe('0');
  });

  it('returns "100" for one hundred', function () {
    expect(logic.formatPercent(100)).toBe('100');
  });

  it('returns one decimal place for values between 0 and 100', function () {
    expect(logic.formatPercent(33.333)).toBe('33.3');
    expect(logic.formatPercent(50.5)).toBe('50.5');
    expect(logic.formatPercent(66.666)).toBe('66.7');
  });

  it('returns one decimal place for very small values', function () {
    expect(logic.formatPercent(0.1)).toBe('0.1');
  });

  it('returns one decimal place for values near 100', function () {
    expect(logic.formatPercent(99.9)).toBe('99.9');
  });
});

// ---------- formatStep ----------

describe('formatStep', function () {
  it('returns integer step without decimals', function () {
    expect(logic.formatStep(25)).toBe('25%');
    expect(logic.formatStep(50)).toBe('50%');
    expect(logic.formatStep(100)).toBe('100%');
  });

  it('returns non-integer step with one decimal', function () {
    expect(logic.formatStep(33.333)).toBe('33.3%');
    expect(logic.formatStep(14.2857)).toBe('14.3%');
  });

  it('handles zero', function () {
    expect(logic.formatStep(0)).toBe('0%');
  });
});

// ---------- getProgress ----------

describe('getProgress', function () {
  it('returns zeros when there are no tasks', function () {
    var p = logic.getProgress();
    expect(p).toEqual({ total: 0, done: 0, percent: 0, step: 0 });
  });

  it('returns correct values for one task not done', function () {
    logic.addTask('Task A');
    var p = logic.getProgress();
    expect(p.total).toBe(1);
    expect(p.done).toBe(0);
    expect(p.percent).toBe(0);
    expect(p.step).toBe(100);
  });

  it('returns 100% when single task is done', function () {
    logic.addTask('Task A');
    var st = logic.getState();
    st.tasks[0].done = true;
    var p = logic.getProgress();
    expect(p.percent).toBe(100);
    expect(p.done).toBe(1);
  });

  it('calculates partial progress correctly', function () {
    logic.addTask('A');
    logic.addTask('B');
    logic.addTask('C');
    logic.addTask('D');

    var st = logic.getState();
    st.tasks[0].done = true;

    var p = logic.getProgress();
    expect(p.total).toBe(4);
    expect(p.done).toBe(1);
    expect(p.percent).toBe(25);
    expect(p.step).toBe(25);
  });

  it('handles all tasks done', function () {
    logic.addTask('A');
    logic.addTask('B');
    var st = logic.getState();
    st.tasks.forEach(function (t) { t.done = true; });

    var p = logic.getProgress();
    expect(p.percent).toBe(100);
    expect(p.done).toBe(2);
  });

  it('handles non-integer step values (3 tasks)', function () {
    logic.addTask('A');
    logic.addTask('B');
    logic.addTask('C');
    var p = logic.getProgress();
    expect(p.step).toBeCloseTo(33.333, 2);
  });
});

// ---------- addTask ----------

describe('addTask', function () {
  it('adds a task to state', function () {
    logic.addTask('Buy groceries');
    var st = logic.getState();
    expect(st.tasks.length).toBe(1);
    expect(st.tasks[0].text).toBe('Buy groceries');
    expect(st.tasks[0].done).toBe(false);
    expect(st.tasks[0].id).toBeTruthy();
  });

  it('trims whitespace from task text', function () {
    logic.addTask('  Cook dinner  ');
    var st = logic.getState();
    expect(st.tasks[0].text).toBe('Cook dinner');
  });

  it('ignores empty string', function () {
    logic.addTask('');
    expect(logic.getState().tasks.length).toBe(0);
  });

  it('ignores whitespace-only string', function () {
    logic.addTask('   ');
    expect(logic.getState().tasks.length).toBe(0);
  });

  it('adds multiple tasks with unique ids', function () {
    logic.addTask('Task 1');
    logic.addTask('Task 2');
    logic.addTask('Task 3');
    var st = logic.getState();
    expect(st.tasks.length).toBe(3);
    var ids = st.tasks.map(function (t) { return t.id; });
    expect(new Set(ids).size).toBe(3);
  });
});

// ---------- toggleTask ----------

describe('toggleTask', function () {
  it('marks an undone task as done', function () {
    logic.addTask('A');
    var id = logic.getState().tasks[0].id;
    logic.toggleTask(id);
    expect(logic.getState().tasks[0].done).toBe(true);
  });

  it('marks a done task as undone', function () {
    logic.addTask('A');
    var id = logic.getState().tasks[0].id;
    logic.toggleTask(id);
    logic.toggleTask(id);
    expect(logic.getState().tasks[0].done).toBe(false);
  });

  it('does nothing for a non-existent id', function () {
    logic.addTask('A');
    logic.toggleTask('non-existent-id');
    expect(logic.getState().tasks[0].done).toBe(false);
  });

  it('only toggles the matching task', function () {
    logic.addTask('A');
    logic.addTask('B');
    var idA = logic.getState().tasks[0].id;
    logic.toggleTask(idA);
    expect(logic.getState().tasks[0].done).toBe(true);
    expect(logic.getState().tasks[1].done).toBe(false);
  });
});

// ---------- deleteTask ----------

describe('deleteTask', function () {
  it('removes a task by id', function () {
    logic.addTask('A');
    logic.addTask('B');
    var idA = logic.getState().tasks[0].id;
    logic.deleteTask(idA);
    var st = logic.getState();
    expect(st.tasks.length).toBe(1);
    expect(st.tasks[0].text).toBe('B');
  });

  it('does nothing for a non-existent id', function () {
    logic.addTask('A');
    logic.deleteTask('non-existent-id');
    expect(logic.getState().tasks.length).toBe(1);
  });

  it('can delete all tasks', function () {
    logic.addTask('A');
    logic.addTask('B');
    var st = logic.getState();
    logic.deleteTask(st.tasks[0].id);
    logic.deleteTask(logic.getState().tasks[0].id);
    expect(logic.getState().tasks.length).toBe(0);
  });
});

// ---------- saveState / loadState ----------

describe('saveState and loadState', function () {
  it('persists tasks to localStorage and restores them', function () {
    logic.addTask('Saved task');
    logic.getState().tasks[0].done = true;
    logic.saveState();

    logic.resetState();
    expect(logic.getState().tasks.length).toBe(0);

    logic.loadState();
    var st = logic.getState();
    expect(st.tasks.length).toBe(1);
    expect(st.tasks[0].text).toBe('Saved task');
    expect(st.tasks[0].done).toBe(true);
  });

  it('persists colorTheme', function () {
    logic.getState().colorTheme = 'red';
    logic.saveState();

    logic.resetState();
    logic.loadState();
    expect(logic.getState().colorTheme).toBe('red');
  });

  it('filters out invalid tasks on load', function () {
    localStorage.setItem(logic.STORAGE_KEY, JSON.stringify({
      tasks: [
        { text: 'Valid', done: false },
        null,
        { text: '', done: true },
        { text: 123, done: false },
        { text: '  ', done: false },
      ],
    }));

    logic.loadState();
    var st = logic.getState();
    expect(st.tasks.length).toBe(1);
    expect(st.tasks[0].text).toBe('Valid');
  });

  it('handles corrupt JSON gracefully', function () {
    localStorage.setItem(logic.STORAGE_KEY, 'not-json!!!');
    logic.loadState();
    var st = logic.getState();
    expect(st.tasks).toEqual([]);
    expect(st.colorTheme).toBe('purple');
  });

  it('handles missing localStorage data', function () {
    logic.loadState();
    var st = logic.getState();
    expect(st.tasks).toEqual([]);
  });

  it('assigns ids to tasks loaded without ids', function () {
    localStorage.setItem(logic.STORAGE_KEY, JSON.stringify({
      tasks: [{ text: 'No id', done: false }],
    }));

    logic.loadState();
    var st = logic.getState();
    expect(st.tasks[0].id).toBeTruthy();
  });

  it('trims task text on load', function () {
    localStorage.setItem(logic.STORAGE_KEY, JSON.stringify({
      tasks: [{ id: 'x', text: '  spaced  ', done: false }],
    }));

    logic.loadState();
    expect(logic.getState().tasks[0].text).toBe('spaced');
  });
});

// ---------- resetState ----------

describe('resetState', function () {
  it('clears tasks and resets colorTheme', function () {
    logic.addTask('X');
    logic.getState().colorTheme = 'green';
    logic.resetState();
    var st = logic.getState();
    expect(st.tasks).toEqual([]);
    expect(st.colorTheme).toBe('purple');
  });
});
