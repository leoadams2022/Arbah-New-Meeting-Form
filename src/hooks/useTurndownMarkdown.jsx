import { useRef, useCallback, useMemo, useEffect } from "react";
import TurndownService from "turndown";

function useTurndown(options = {}, customRules = []) {
  const turndownRef = useRef(null);
  const rulesRegistry = useRef(new Map());

  // Memoize default options
  const defaultOptions = useMemo(
    () => ({
      headingStyle: "atx",
      hr: "---",
      bulletListMarker: "-",
      codeBlockStyle: "fenced",
      fence: "```",
      emDelimiter: "*",
      strongDelimiter: "**",
      linkStyle: "inlined",
      linkReferenceStyle: "full",
      ...options,
    }),
    [options],
  );

  // Memoize default rules (these never change)
  const defaultRules = useMemo(
    () => [
      // {
      //   name: "underline",
      //   rule: {
      //     filter: ["u"],
      //     replacement: (content) => `<u>${content}</u>`,
      //   },
      // },
      {
        name: "strikethrough",
        rule: {
          filter: ["strike", "del", "s"],
          replacement: (content) => `~~${content}~~`,
        },
      },
      {
        name: "div",
        rule: {
          filter: ["div"],
          replacement: (content) => `\n\n${content}\n\n`,
        },
      },
      {
        name: "span",
        rule: {
          filter: ["span"],
          replacement: (content) => content,
        },
      },
      {
        name: "paragraph",
        rule: {
          filter: ["p"],
          replacement: (content) => `\n\n${content}\n\n`,
        },
      },
      {
        name: "lineBreak",
        rule: {
          filter: ["br"],
          replacement: () => "  \n",
        },
      },
      {
        name: "heading",
        rule: {
          filter: ["h1", "h2", "h3", "h4", "h5", "h6"],
          replacement: (content, node) => {
            const level = parseInt(node.tagName.charAt(1));
            const prefix = "#".repeat(level);
            return `\n\n${prefix} ${content}\n\n`;
          },
        },
      },
      {
        name: "listItem",
        rule: {
          filter: ["li"],
          replacement: (content, node, options) => {
            content = content
              .replace(/^\n+/, "")
              .replace(/\n+$/, "\n")
              .replace(/\n/gm, "\n  ");

            let prefix = options.bulletListMarker + " ";
            const parent = node.parentNode;

            if (parent && parent.nodeName === "OL") {
              const start = parent.getAttribute("start");
              const index = Array.from(parent.children).indexOf(node) + 1;
              prefix = (start ? Number(start) + index - 1 : index) + ". ";
            }

            return prefix + (content.trim() ? content : "");
          },
        },
      },
    ],
    [],
  );

  // Memoize custom rules
  const memoizedCustomRules = useMemo(() => customRules, [customRules]);

  // Combine all rules
  const allRules = useMemo(
    () => [...defaultRules, ...memoizedCustomRules],
    [defaultRules, memoizedCustomRules],
  );

  // Initialize registry with all rules
  useEffect(() => {
    allRules.forEach(({ name, rule }) => {
      rulesRegistry.current.set(name, rule);
    });
  }, [allRules]);

  // Initialize Turndown service
  const initializeTurndown = useCallback(() => {
    const turndownService = new TurndownService(defaultOptions);

    // Add all rules from registry
    rulesRegistry.current.forEach((rule, name) => {
      turndownService.addRule(name, rule);
    });

    return turndownService;
  }, [defaultOptions]);

  const getTurndown = useCallback(() => {
    if (!turndownRef.current) {
      turndownRef.current = initializeTurndown();
    }
    return turndownRef.current;
  }, [initializeTurndown]);

  // Rest of the functions remain the same...
  const convert = useCallback(
    (html) => {
      try {
        const turndown = getTurndown();
        return turndown.turndown(html);
      } catch (error) {
        console.error("Error converting HTML to Markdown:", error);
        return "";
      }
    },
    [getTurndown],
  );

  const addRule = useCallback(
    (name, rule) => {
      const turndown = getTurndown();
      turndown.addRule(name, rule);
      rulesRegistry.current.set(name, rule);
    },
    [getTurndown],
  );

  const removeRule = useCallback(
    (ruleName) => {
      if (!ruleName) return turndownRef.current;

      rulesRegistry.current.delete(ruleName);

      const newTurndown = new TurndownService(defaultOptions);

      rulesRegistry.current.forEach((rule, name) => {
        newTurndown.addRule(name, rule);
      });

      turndownRef.current = newTurndown;

      return turndownRef.current;
    },
    [defaultOptions],
  );

  const getActiveRules = useCallback(() => {
    return Array.from(rulesRegistry.current.keys());
  }, []);

  const hasRule = useCallback((ruleName) => {
    return rulesRegistry.current.has(ruleName);
  }, []);

  const convertWithOptions = useCallback(
    (html, temporaryOptions = {}) => {
      try {
        const tempTurndown = new TurndownService({
          ...defaultOptions,
          ...temporaryOptions,
        });

        rulesRegistry.current.forEach((rule, name) => {
          tempTurndown.addRule(name, rule);
        });

        return tempTurndown.turndown(html);
      } catch (error) {
        console.error(
          "Error converting HTML to Markdown with custom options:",
          error,
        );
        return "";
      }
    },
    [defaultOptions],
  );

  const batchConvert = useCallback(
    (htmlArray) => {
      const turndown = getTurndown();
      return htmlArray.map((html) => turndown.turndown(html));
    },
    [getTurndown],
  );

  const resetRules = useCallback(() => {
    turndownRef.current = initializeTurndown();
    return turndownRef.current;
  }, [initializeTurndown]);

  return {
    convert,
    convertWithOptions,
    batchConvert,
    addRule,
    removeRule,
    getActiveRules,
    hasRule,
    resetRules,
    getTurndown,
  };
}

export default useTurndown;
