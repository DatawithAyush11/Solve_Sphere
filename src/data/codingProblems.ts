export interface CodingProblem {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  description: string;
  examples: { input: string; output: string; explanation?: string }[];
  constraints: string[];
  starterCode: Record<string, string>;
  testCases: { input: any; expected: any; description: string }[];
  hints: string[];
  tags: string[];
}

export const codingProblems: CodingProblem[] = [
  {
    id: 'cp_1',
    title: 'Two Sum',
    difficulty: 'easy',
    category: 'Arrays & Hashing',
    tags: ['array', 'hash-table'],
    description: `Given an array of integers \`nums\` and an integer \`target\`, return the indices of the two numbers that add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
    examples: [
      { input: 'nums = [2, 7, 11, 15], target = 9', output: '[0, 1]', explanation: 'nums[0] + nums[1] = 2 + 7 = 9' },
      { input: 'nums = [3, 2, 4], target = 6', output: '[1, 2]' },
      { input: 'nums = [3, 3], target = 6', output: '[0, 1]' },
    ],
    constraints: ['2 ≤ nums.length ≤ 10⁴', '-10⁹ ≤ nums[i] ≤ 10⁹', 'Only one valid answer exists'],
    hints: [
      'A brute force solution is O(n²). Can you do better?',
      'Consider using a hash map to store each number and its index as you iterate.',
      'For each element x, check if (target - x) already exists in the map.',
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
  // Your solution here
  
}`,
      python: `def two_sum(nums: list[int], target: int) -> list[int]:
    # Your solution here
    pass`,
      java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your solution here
        return new int[]{};
    }
}`,
    },
    testCases: [
      { input: { nums: [2, 7, 11, 15], target: 9 }, expected: [0, 1], description: 'Basic case' },
      { input: { nums: [3, 2, 4], target: 6 }, expected: [1, 2], description: 'Middle elements' },
      { input: { nums: [3, 3], target: 6 }, expected: [0, 1], description: 'Duplicate elements' },
    ],
  },
  {
    id: 'cp_2',
    title: 'Valid Parentheses',
    difficulty: 'easy',
    category: 'Stack',
    tags: ['stack', 'string'],
    description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    examples: [
      { input: 's = "()"', output: 'true' },
      { input: 's = "()[]{}"', output: 'true' },
      { input: 's = "(]"', output: 'false' },
    ],
    constraints: ['1 ≤ s.length ≤ 10⁴', 's consists of parentheses only \'()[]{}\'' ],
    hints: [
      'Use a stack data structure.',
      'Push opening brackets onto the stack. When you see a closing bracket, check if the top of the stack is the matching opening bracket.',
      'At the end, the stack should be empty for a valid string.',
    ],
    starterCode: {
      javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
function isValid(s) {
  // Your solution here
  
}`,
      python: `def is_valid(s: str) -> bool:
    # Your solution here
    pass`,
      java: `class Solution {
    public boolean isValid(String s) {
        // Your solution here
        return false;
    }
}`,
    },
    testCases: [
      { input: { s: '()' }, expected: true, description: 'Simple valid' },
      { input: { s: '()[]{}' }, expected: true, description: 'Multiple types valid' },
      { input: { s: '(]' }, expected: false, description: 'Wrong close bracket' },
      { input: { s: '([)]' }, expected: false, description: 'Interleaved invalid' },
      { input: { s: '{[]}' }, expected: true, description: 'Nested valid' },
    ],
  },
  {
    id: 'cp_3',
    title: 'Reverse Linked List',
    difficulty: 'easy',
    category: 'Linked List',
    tags: ['linked-list', 'iterative', 'recursive'],
    description: `Given the \`head\` of a singly linked list, reverse the list, and return the reversed list.

A linked list is represented as an array for input/output purposes: \`[1, 2, 3, 4, 5]\` represents 1→2→3→4→5→null.`,
    examples: [
      { input: 'head = [1, 2, 3, 4, 5]', output: '[5, 4, 3, 2, 1]' },
      { input: 'head = [1, 2]', output: '[2, 1]' },
      { input: 'head = []', output: '[]' },
    ],
    constraints: ['Number of nodes: 0 ≤ n ≤ 5000', '-5000 ≤ Node.val ≤ 5000'],
    hints: [
      'Consider both iterative and recursive approaches.',
      'For iterative: you need to track previous, current, and next nodes.',
      'For recursive: reverse the rest of the list, then fix the head\'s references.',
    ],
    starterCode: {
      javascript: `/**
 * @param {ListNode} head (represented as an array)
 * @return {ListNode} (return as reversed array)
 */
function reverseList(arr) {
  // Notes: Input comes as an array, treat it as a linked list
  // Return the reversed array
  
}`,
      python: `def reverse_list(arr: list) -> list:
    # Notes: Input comes as an array, treat it as a linked list
    # Return the reversed array
    pass`,
      java: `class Solution {
    public int[] reverseList(int[] arr) {
        // Your solution here
        return new int[]{};
    }
}`,
    },
    testCases: [
      { input: { arr: [1, 2, 3, 4, 5] }, expected: [5, 4, 3, 2, 1], description: 'Standard list' },
      { input: { arr: [1, 2] }, expected: [2, 1], description: 'Two elements' },
      { input: { arr: [] }, expected: [], description: 'Empty list' },
    ],
  },
  {
    id: 'cp_4',
    title: 'Maximum Subarray',
    difficulty: 'medium',
    category: 'Dynamic Programming',
    tags: ['array', 'dynamic-programming', 'divide-and-conquer'],
    description: `Given an integer array \`nums\`, find the subarray with the largest sum, and return its sum.

A subarray is a contiguous part of an array.`,
    examples: [
      { input: 'nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]', output: '6', explanation: 'The subarray [4, -1, 2, 1] has the largest sum = 6' },
      { input: 'nums = [1]', output: '1' },
      { input: 'nums = [5, 4, -1, 7, 8]', output: '23' },
    ],
    constraints: ['1 ≤ nums.length ≤ 10⁵', '-10⁴ ≤ nums[i] ≤ 10⁴'],
    hints: [
      'This is the classic Kadane\'s Algorithm problem.',
      'At each position, decide: should I extend the previous subarray, or start fresh?',
      'currentMax = max(nums[i], currentMax + nums[i])',
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @return {number}
 */
function maxSubArray(nums) {
  // Your solution here (Kadane's Algorithm)
  
}`,
      python: `def max_sub_array(nums: list[int]) -> int:
    # Your solution here (Kadane's Algorithm)
    pass`,
      java: `class Solution {
    public int maxSubArray(int[] nums) {
        // Your solution here
        return 0;
    }
}`,
    },
    testCases: [
      { input: { nums: [-2, 1, -3, 4, -1, 2, 1, -5, 4] }, expected: 6, description: 'Mixed positive and negative' },
      { input: { nums: [1] }, expected: 1, description: 'Single element' },
      { input: { nums: [5, 4, -1, 7, 8] }, expected: 23, description: 'Mostly positive' },
      { input: { nums: [-1] }, expected: -1, description: 'Single negative' },
    ],
  },
  {
    id: 'cp_5',
    title: 'Climbing Stairs',
    difficulty: 'easy',
    category: 'Dynamic Programming',
    tags: ['dynamic-programming', 'memoization', 'fibonacci'],
    description: `You are climbing a staircase. It takes \`n\` steps to reach the top.

Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?`,
    examples: [
      { input: 'n = 2', output: '2', explanation: 'Two ways: (1 step + 1 step) or (2 steps)' },
      { input: 'n = 3', output: '3', explanation: 'Three ways: (1+1+1), (1+2), (2+1)' },
    ],
    constraints: ['1 ≤ n ≤ 45'],
    hints: [
      'Think about it: to reach step n, you either came from step n-1 (took 1 step) or step n-2 (took 2 steps).',
      'So ways(n) = ways(n-1) + ways(n-2) — this is the Fibonacci sequence!',
      'Base cases: ways(1) = 1, ways(2) = 2',
    ],
    starterCode: {
      javascript: `/**
 * @param {number} n
 * @return {number}
 */
function climbStairs(n) {
  // Your solution here
  
}`,
      python: `def climb_stairs(n: int) -> int:
    # Your solution here
    pass`,
      java: `class Solution {
    public int climbStairs(int n) {
        // Your solution here
        return 0;
    }
}`,
    },
    testCases: [
      { input: { n: 1 }, expected: 1, description: 'One step' },
      { input: { n: 2 }, expected: 2, description: 'Two steps' },
      { input: { n: 3 }, expected: 3, description: 'Three steps' },
      { input: { n: 5 }, expected: 8, description: 'Five steps' },
      { input: { n: 10 }, expected: 89, description: 'Ten steps' },
    ],
  },
  {
    id: 'cp_6',
    title: 'Binary Search',
    difficulty: 'easy',
    category: 'Binary Search',
    tags: ['array', 'binary-search'],
    description: `Given an array of integers \`nums\` which is sorted in ascending order, and an integer \`target\`, write a function to search \`target\` in \`nums\`. If \`target\` exists, then return its index. Otherwise, return \`-1\`.

You must write an algorithm with \`O(log n)\` runtime complexity.`,
    examples: [
      { input: 'nums = [-1, 0, 3, 5, 9, 12], target = 9', output: '4', explanation: '9 exists in nums at index 4' },
      { input: 'nums = [-1, 0, 3, 5, 9, 12], target = 2', output: '-1', explanation: '2 does not exist in nums' },
    ],
    constraints: ['1 ≤ nums.length ≤ 10⁴', '-10⁴ < nums[i], target < 10⁴', 'All integers in nums are unique', 'nums is sorted in ascending order'],
    hints: [
      'Use two pointers: left = 0, right = nums.length - 1.',
      'At each step, check the middle element: mid = Math.floor((left + right) / 2).',
      'If nums[mid] === target, return mid. If nums[mid] < target, search right half. Else search left half.',
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
function search(nums, target) {
  // Your O(log n) solution here
  
}`,
      python: `def search(nums: list[int], target: int) -> int:
    # Your O(log n) solution here
    pass`,
      java: `class Solution {
    public int search(int[] nums, int target) {
        // Your solution here
        return -1;
    }
}`,
    },
    testCases: [
      { input: { nums: [-1, 0, 3, 5, 9, 12], target: 9 }, expected: 4, description: 'Target found' },
      { input: { nums: [-1, 0, 3, 5, 9, 12], target: 2 }, expected: -1, description: 'Target not found' },
      { input: { nums: [5], target: 5 }, expected: 0, description: 'Single element found' },
      { input: { nums: [5], target: -5 }, expected: -1, description: 'Single element not found' },
    ],
  },
  {
    id: 'cp_7',
    title: 'Merge Two Sorted Lists',
    difficulty: 'easy',
    category: 'Linked List',
    tags: ['linked-list', 'recursion'],
    description: `You are given the heads of two sorted linked lists \`list1\` and \`list2\`.

Merge the two lists into one sorted list. The list should be made by splicing together the nodes of the first two lists.

Return the head of the merged linked list.

(For this problem, lists are represented as arrays.)`,
    examples: [
      { input: 'list1 = [1, 2, 4], list2 = [1, 3, 4]', output: '[1, 1, 2, 3, 4, 4]' },
      { input: 'list1 = [], list2 = []', output: '[]' },
      { input: 'list1 = [], list2 = [0]', output: '[0]' },
    ],
    constraints: ['Number of nodes in each list: 0 ≤ n ≤ 50', '-100 ≤ Node.val ≤ 100', 'Both lists are sorted in non-decreasing order'],
    hints: [
      'Two-pointer approach: compare the front of each list.',
      'Add the smaller element to your result and advance that pointer.',
      'Handle remaining elements after one list is exhausted.',
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} list1
 * @param {number[]} list2
 * @return {number[]}
 */
function mergeTwoLists(list1, list2) {
  // Your solution here
  
}`,
      python: `def merge_two_lists(list1: list, list2: list) -> list:
    # Your solution here
    pass`,
      java: `class Solution {
    public int[] mergeTwoLists(int[] list1, int[] list2) {
        // Your solution here
        return new int[]{};
    }
}`,
    },
    testCases: [
      { input: { list1: [1, 2, 4], list2: [1, 3, 4] }, expected: [1, 1, 2, 3, 4, 4], description: 'Standard merge' },
      { input: { list1: [], list2: [] }, expected: [], description: 'Both empty' },
      { input: { list1: [], list2: [0] }, expected: [0], description: 'One empty' },
    ],
  },
  {
    id: 'cp_8',
    title: 'Number of Islands',
    difficulty: 'medium',
    category: 'Graphs',
    tags: ['array', 'dfs', 'bfs', 'union-find'],
    description: `Given an \`m x n\` 2D binary grid representing a map of \`'1'\` (land) and \`'0'\` (water), return the number of islands.

An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.

The grid is represented as a 2D array of strings.`,
    examples: [
      {
        input: `grid = [
  ["1","1","1","1","0"],
  ["1","1","0","1","0"],
  ["1","1","0","0","0"],
  ["0","0","0","0","0"]
]`,
        output: '1',
      },
      {
        input: `grid = [
  ["1","1","0","0","0"],
  ["1","1","0","0","0"],
  ["0","0","1","0","0"],
  ["0","0","0","1","1"]
]`,
        output: '3',
      },
    ],
    constraints: ['m == grid.length', 'n == grid[i].length', '1 ≤ m, n ≤ 300', 'grid[i][j] is \'0\' or \'1\''],
    hints: [
      'Use DFS or BFS to explore each island.',
      'Mark visited cells by changing "1" to "0" (or a visited marker).',
      'Each unvisited "1" you encounter is a new island — increment counter and DFS to mark the whole island.',
    ],
    starterCode: {
      javascript: `/**
 * @param {string[][]} grid
 * @return {number}
 */
function numIslands(grid) {
  // Your DFS/BFS solution here
  
}`,
      python: `def num_islands(grid: list[list[str]]) -> int:
    # Your DFS/BFS solution here
    pass`,
      java: `class Solution {
    public int numIslands(char[][] grid) {
        // Your solution here
        return 0;
    }
}`,
    },
    testCases: [
      {
        input: { grid: [['1','1','1','1','0'],['1','1','0','1','0'],['1','1','0','0','0'],['0','0','0','0','0']] },
        expected: 1,
        description: 'One large island',
      },
      {
        input: { grid: [['1','1','0','0','0'],['1','1','0','0','0'],['0','0','1','0','0'],['0','0','0','1','1']] },
        expected: 3,
        description: 'Three separate islands',
      },
    ],
  },
  {
    id: 'cp_9',
    title: 'Longest Common Subsequence',
    difficulty: 'medium',
    category: 'Dynamic Programming',
    tags: ['string', 'dynamic-programming'],
    description: `Given two strings \`text1\` and \`text2\`, return the length of their longest common subsequence. If there is no common subsequence, return \`0\`.

A subsequence of a string is a new string generated from the original string with some characters (can be none) deleted without changing the relative order of the remaining characters.

A common subsequence of two strings is a subsequence that is common to both strings.`,
    examples: [
      { input: 'text1 = "abcde", text2 = "ace"', output: '3', explanation: 'The LCS is "ace" which has length 3' },
      { input: 'text1 = "abc", text2 = "abc"', output: '3', explanation: 'The LCS is "abc" which has length 3' },
      { input: 'text1 = "abc", text2 = "def"', output: '0', explanation: 'No common subsequence' },
    ],
    constraints: ['1 ≤ text1.length, text2.length ≤ 1000', 'text1 and text2 consist of only lowercase English characters'],
    hints: [
      'Use 2D DP table: dp[i][j] = LCS of text1[0..i-1] and text2[0..j-1].',
      'If text1[i-1] === text2[j-1]: dp[i][j] = dp[i-1][j-1] + 1',
      'Else: dp[i][j] = max(dp[i-1][j], dp[i][j-1])',
    ],
    starterCode: {
      javascript: `/**
 * @param {string} text1
 * @param {string} text2
 * @return {number}
 */
function longestCommonSubsequence(text1, text2) {
  // Your DP solution here
  
}`,
      python: `def longest_common_subsequence(text1: str, text2: str) -> int:
    # Your DP solution here
    pass`,
      java: `class Solution {
    public int longestCommonSubsequence(String text1, String text2) {
        // Your solution here
        return 0;
    }
}`,
    },
    testCases: [
      { input: { text1: 'abcde', text2: 'ace' }, expected: 3, description: 'Basic LCS' },
      { input: { text1: 'abc', text2: 'abc' }, expected: 3, description: 'Identical strings' },
      { input: { text1: 'abc', text2: 'def' }, expected: 0, description: 'No common subsequence' },
    ],
  },
  {
    id: 'cp_10',
    title: 'Trapping Rain Water',
    difficulty: 'hard',
    category: 'Two Pointers',
    tags: ['array', 'two-pointers', 'stack', 'dynamic-programming'],
    description: `Given \`n\` non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.`,
    examples: [
      { input: 'height = [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]', output: '6', explanation: 'The elevation map traps 6 units of rain water' },
      { input: 'height = [4, 2, 0, 3, 2, 5]', output: '9' },
    ],
    constraints: ['n == height.length', '1 ≤ n ≤ 2 × 10⁴', '0 ≤ height[i] ≤ 10⁵'],
    hints: [
      'For each position, water trapped = min(maxLeft, maxRight) - height[i].',
      'Precompute maxLeft and maxRight arrays for O(n) time, O(n) space.',
      'Optimize to O(1) space using two pointers — left and right moving inward.',
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} height
 * @return {number}
 */
function trap(height) {
  // Your two-pointer solution here
  
}`,
      python: `def trap(height: list[int]) -> int:
    # Your two-pointer solution here
    pass`,
      java: `class Solution {
    public int trap(int[] height) {
        // Your solution here
        return 0;
    }
}`,
    },
    testCases: [
      { input: { height: [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1] }, expected: 6, description: 'Classic example' },
      { input: { height: [4, 2, 0, 3, 2, 5] }, expected: 9, description: 'Second example' },
      { input: { height: [3, 0, 2, 0, 4] }, expected: 7, description: 'Simple trap' },
    ],
  },
  {
    id: 'cp_11',
    title: 'Fibonacci Number',
    difficulty: 'easy',
    category: 'Dynamic Programming',
    tags: ['math', 'dynamic-programming', 'memoization'],
    description: `The Fibonacci numbers, commonly denoted \`F(n)\`, form a sequence called the Fibonacci sequence, such that each number is the sum of the two preceding ones, starting from 0 and 1.

F(0) = 0, F(1) = 1
F(n) = F(n - 1) + F(n - 2), for n > 1

Given \`n\`, calculate \`F(n)\`.`,
    examples: [
      { input: 'n = 2', output: '1', explanation: 'F(2) = F(1) + F(0) = 1 + 0 = 1' },
      { input: 'n = 3', output: '2', explanation: 'F(3) = F(2) + F(1) = 1 + 1 = 2' },
      { input: 'n = 4', output: '3', explanation: 'F(4) = F(3) + F(2) = 2 + 1 = 3' },
    ],
    constraints: ['0 ≤ n ≤ 30'],
    hints: [
      'You can use recursion with memoization.',
      'Or use iterative DP with O(1) space — just track the last two numbers.',
      'fib(0) = 0, fib(1) = 1, fib(n) = fib(n-1) + fib(n-2)',
    ],
    starterCode: {
      javascript: `/**
 * @param {number} n
 * @return {number}
 */
function fib(n) {
  // Your solution here
  
}`,
      python: `def fib(n: int) -> int:
    # Your solution here
    pass`,
      java: `class Solution {
    public int fib(int n) {
        // Your solution here
        return 0;
    }
}`,
    },
    testCases: [
      { input: { n: 0 }, expected: 0, description: 'F(0)' },
      { input: { n: 1 }, expected: 1, description: 'F(1)' },
      { input: { n: 5 }, expected: 5, description: 'F(5)' },
      { input: { n: 10 }, expected: 55, description: 'F(10)' },
    ],
  },
  {
    id: 'cp_12',
    title: 'Palindrome Check',
    difficulty: 'easy',
    category: 'Strings',
    tags: ['string', 'two-pointers'],
    description: `A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.

Given a string \`s\`, return \`true\` if it is a palindrome, or \`false\` otherwise.`,
    examples: [
      { input: 's = "A man, a plan, a canal: Panama"', output: 'true', explanation: '"amanaplanacanalpanama" is a palindrome' },
      { input: 's = "race a car"', output: 'false', explanation: '"raceacar" is not a palindrome' },
      { input: 's = " "', output: 'true', explanation: 'An empty string is a palindrome' },
    ],
    constraints: ['1 ≤ s.length ≤ 2 × 10⁵', 's consists only of printable ASCII characters'],
    hints: [
      'First clean the string: convert to lowercase, keep only alphanumeric.',
      'Use two pointers — one from each end — and compare characters.',
      'Alternatively, compare the cleaned string with its reverse.',
    ],
    starterCode: {
      javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
function isPalindrome(s) {
  // Your solution here
  
}`,
      python: `def is_palindrome(s: str) -> bool:
    # Your solution here
    pass`,
      java: `class Solution {
    public boolean isPalindrome(String s) {
        // Your solution here
        return false;
    }
}`,
    },
    testCases: [
      { input: { s: 'A man, a plan, a canal: Panama' }, expected: true, description: 'Classic palindrome with spaces' },
      { input: { s: 'race a car' }, expected: false, description: 'Not a palindrome' },
      { input: { s: ' ' }, expected: true, description: 'Whitespace only' },
      { input: { s: 'Was it a car or a cat I saw?' }, expected: true, description: 'Palindrome sentence' },
    ],
  },
];

export function getProblemById(id: string): CodingProblem | undefined {
  return codingProblems.find(p => p.id === id);
}

export function getProblemsByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): CodingProblem[] {
  return codingProblems.filter(p => p.difficulty === difficulty);
}

export const CODING_CATEGORIES = [
  ...new Set(codingProblems.map(p => p.category)),
];
