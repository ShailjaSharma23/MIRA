export interface CSAnalysis {
  detectedCode?: string;
  timeComplexity?: string;
  spaceComplexity?: string;
  architectureNotes?: string[];
}

export function analyzeCSQuery(query: string): string | null {
  const queryLower = query.toLowerCase();

  if (queryLower.includes("big o") || queryLower.includes("complexity") || queryLower.includes("time complexity")) {
    return [
      "### 💻 Algorithmic Complexity Breakdown (Big-O)",
      "",
      "| Complexity | Name | Example Algorithm / Data Structure | Scalability ($N = 10^6$) |",
      "|---|---|---|---|",
      "| $\\mathcal{O}(1)$ | Constant Time | Hash Map lookup, Array index access | Immediate (~1 op) |",
      "| $\\mathcal{O}(\\log N)$ | Logarithmic Time | Binary Search, Balanced BST lookup | Negligible (~20 ops) |",
      "| $\\mathcal{O}(N)$ | Linear Time | Linear Search, Array traversal | Fast (~$10^6$ ops) |",
      "| $\\mathcal{O}(N \\log N)$ | Linearithmic | Merge Sort, Quick Sort (Avg), Heap Sort | Practical (~$2 \\times 10^7$ ops) |",
      "| $\\mathcal{O}(N^2)$ | Quadratic | Bubble Sort, Nested loops, Matrix mult | Heavy (~$10^{12}$ ops - Bottleneck!) |",
      "| $\\mathcal{O}(2^N)$ | Exponential | Recursive Fibonacci, Subset generation | Impractical for $N > 30$ |",
      "",
      "**Engineering Optimization Rule**: Always strive to reduce $\\mathcal{O}(N^2)$ loops into $\\mathcal{O}(N)$ using Hash Maps / Frequency arrays or $\\mathcal{O}(N \\log N)$ with two-pointer techniques."
    ].join("\n");
  }

  if (queryLower.includes("trie") || queryLower.includes("prefix tree")) {
    return [
      "### 💻 Trie (Prefix Tree) Implementation & Analysis",
      "",
      "```typescript",
      "class TrieNode {",
      "  children: Map<string, TrieNode> = new Map();",
      "  isEndOfWord: boolean = false;",
      "}",
      "",
      "export class Trie {",
      "  private root: TrieNode = new TrieNode();",
      "",
      "  // Time: O(L) where L is word length | Space: O(L)",
      "  insert(word: string): void {",
      "    let current = this.root;",
      "    for (const char of word) {",
      "      if (!current.children.has(char)) {",
      "        current.children.set(char, new TrieNode());",
      "      }",
      "      current = current.children.get(char)!;",
      "    }",
      "    current.isEndOfWord = true;",
      "  }",
      "",
      "  // Time: O(L) | Space: O(1)",
      "  search(word: string): boolean {",
      "    let current = this.root;",
      "    for (const char of word) {",
      "      if (!current.children.has(char)) return false;",
      "      current = current.children.get(char)!;",
      "    }",
      "    return current.isEndOfWord;",
      "  }",
      "",
      "  // Time: O(P) where P is prefix length",
      "  startsWith(prefix: string): boolean {",
      "    let current = this.root;",
      "    for (const char of prefix) {",
      "      if (!current.children.has(char)) return false;",
      "      current = current.children.get(char)!;",
      "    }",
      "    return true;",
      "  }",
      "}",
      "```",
      "",
      "* **Use cases**: Autocomplete search bars, spell checkers, IP routing lookups (Longest Prefix Match).",
      "* **Complexity**: Lookup is independent of the number of words stored ($N$), scaling only with the length of the string ($L$)."
    ].join("\n");
  }

  return null;
}
