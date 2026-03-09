import { api } from './api';

export async function extractJobWithGemini(urlOrText) {
  const data = await api.post('/api/extract', { urlOrText });
  return data.job;
}

export async function fetchLeetCodeQuestion() {
  const problems = [
    { id: 1, title: "Two Sum", difficulty: "Easy", slug: "two-sum", tags: ["Array", "Hash Table"] },
    { id: 2, title: "Add Two Numbers", difficulty: "Medium", slug: "add-two-numbers", tags: ["Linked List", "Recursion"] },
    { id: 3, title: "Longest Substring Without Repeating Characters", difficulty: "Medium", slug: "longest-substring-without-repeating-characters", tags: ["String", "Sliding Window"] },
    { id: 20, title: "Valid Parentheses", difficulty: "Easy", slug: "valid-parentheses", tags: ["Stack", "String"] },
    { id: 21, title: "Merge Two Sorted Lists", difficulty: "Easy", slug: "merge-two-sorted-lists", tags: ["Linked List", "Recursion"] },
    { id: 53, title: "Maximum Subarray", difficulty: "Medium", slug: "maximum-subarray", tags: ["Array", "Dynamic Programming"] },
    { id: 70, title: "Climbing Stairs", difficulty: "Easy", slug: "climbing-stairs", tags: ["Dynamic Programming", "Memoization"] },
    { id: 121, title: "Best Time to Buy and Sell Stock", difficulty: "Easy", slug: "best-time-to-buy-and-sell-stock", tags: ["Array", "DP"] },
    { id: 200, title: "Number of Islands", difficulty: "Medium", slug: "number-of-islands", tags: ["BFS", "DFS", "Graph"] },
    { id: 206, title: "Reverse Linked List", difficulty: "Easy", slug: "reverse-linked-list", tags: ["Linked List", "Recursion"] },
    { id: 226, title: "Invert Binary Tree", difficulty: "Easy", slug: "invert-binary-tree", tags: ["Tree", "BFS"] },
    { id: 238, title: "Product of Array Except Self", difficulty: "Medium", slug: "product-of-array-except-self", tags: ["Array", "Prefix Sum"] },
    { id: 300, title: "Longest Increasing Subsequence", difficulty: "Medium", slug: "longest-increasing-subsequence", tags: ["DP", "Binary Search"] },
    { id: 322, title: "Coin Change", difficulty: "Medium", slug: "coin-change", tags: ["DP", "BFS"] },
    { id: 347, title: "Top K Frequent Elements", difficulty: "Medium", slug: "top-k-frequent-elements", tags: ["Heap", "Hash Table"] },
    { id: 739, title: "Daily Temperatures", difficulty: "Medium", slug: "daily-temperatures", tags: ["Stack", "Monotonic Stack"] },
  ];
  const dayOfYear = Math.floor((Date.now() / 86400000)) % problems.length;
  return problems[dayOfYear];
}