import vm from 'node:vm';

// PROTOTYPE-ONLY sandbox. NOT production-safe.
// Runs user code with a 1.5s timeout in a fresh context.
// In production, swap for a Docker-based runner.
export function runUserCode({ code, tests }) {
  const result = {
    passed: 0,
    total: tests.length,
    logs: [],
    error: null,
    cases: [],
  };

  const sandboxLogs = [];
  const sandbox = {
    console: {
      log: (...args) => sandboxLogs.push(args.map(String).join(' ')),
      error: (...args) => sandboxLogs.push('ERR: ' + args.map(String).join(' ')),
    },
  };
  const context = vm.createContext(sandbox);

  let solution;
  try {
    const script = new vm.Script(`${code}\n;solution;`);
    solution = script.runInContext(context, { timeout: 1500 });
  } catch (e) {
    result.error = `${e.name}: ${e.message}`;
    result.logs = sandboxLogs;
    return result;
  }

  if (typeof solution !== 'function') {
    result.error = 'No `solution` function found. Make sure you defined `function solution(...)`.';
    result.logs = sandboxLogs;
    return result;
  }

  for (const t of tests) {
    try {
      const out = solution(...t.args);
      const ok = JSON.stringify(out) === JSON.stringify(t.expect);
      result.cases.push({
        args: t.args,
        expect: t.expect,
        got: out,
        passed: ok,
      });
      if (ok) result.passed += 1;
    } catch (e) {
      result.cases.push({
        args: t.args,
        expect: t.expect,
        got: null,
        passed: false,
        error: `${e.name}: ${e.message}`,
      });
    }
  }

  result.logs = sandboxLogs;
  return result;
}
