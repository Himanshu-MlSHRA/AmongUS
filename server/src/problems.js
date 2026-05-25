// Sample coding challenges. In production these'd live in a DB.
export const PROBLEMS = [
  {
    id: 'two-sum',
    title: 'Two Sum',
    instructions:
      'Given an array of integers `nums` and an integer `target`, return the indices of the two numbers such that they add up to target.',
    hint: 'Use a hash map to store seen values and their indices for O(n) time.',
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]' },
    ],
    starter: `function solution(nums, target) {\n  // your code here\n  return [];\n}`,
    tests: [
      { args: [[2, 7, 11, 15], 9], expect: [0, 1] },
      { args: [[3, 2, 4], 6], expect: [1, 2] },
      { args: [[3, 3], 6], expect: [0, 1] },
    ],
  },
  {
    id: 'reverse-string',
    title: 'Reverse String',
    instructions: 'Write a function that reverses a string.',
    hint: 'You can swap characters in place using two pointers.',
    examples: [
      { input: '"hello"', output: '"olleh"' },
      { input: '"Hannah"', output: '"hannaH"' },
    ],
    starter: `function solution(s) {\n  // your code here\n  return s;\n}`,
    tests: [
      { args: ['hello'], expect: 'olleh' },
      { args: ['Hannah'], expect: 'hannaH' },
      { args: [''], expect: '' },
    ],
  },
  {
    id: 'fizzbuzz',
    title: 'FizzBuzz',
    instructions:
      'Return an array of strings 1..n where multiples of 3 become "Fizz", multiples of 5 become "Buzz", and multiples of both become "FizzBuzz".',
    hint: 'Check divisibility by 15 first, then 3, then 5.',
    examples: [
      { input: 'n = 3', output: '["1","2","Fizz"]' },
      { input: 'n = 5', output: '["1","2","Fizz","4","Buzz"]' },
    ],
    starter: `function solution(n) {\n  // your code here\n  return [];\n}`,
    tests: [
      { args: [3], expect: ['1', '2', 'Fizz'] },
      { args: [5], expect: ['1', '2', 'Fizz', '4', 'Buzz'] },
      {
        args: [15],
        expect: [
          '1', '2', 'Fizz', '4', 'Buzz', 'Fizz', '7', '8',
          'Fizz', 'Buzz', '11', 'Fizz', '13', '14', 'FizzBuzz',
        ],
      },
    ],
  },
];

export function pickProblem() {
  return PROBLEMS[Math.floor(Math.random() * PROBLEMS.length)];
}
