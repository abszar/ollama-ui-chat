import React, { useState } from "react";
import { Theme } from "@mui/material";
import CodeBlock from "../CodeBlock";
import { useCodeSidebarStore } from "../../store/codeSidebarStore";

export const MarkdownComponents = (theme: Theme) => {
  const openSidebar = useCodeSidebarStore(state => state.openSidebar);

  return {
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || "");
      const language = match ? match[1] : "";

      if (!inline && language) {
        const code = String(children).replace(/\n$/, "");
        // Only open sidebar for code blocks that are not inline
        if (code.includes('\n')) {
          openSidebar(code, language);
        }
        return (
          <CodeBlock
            code={code}
            language={language}
          />
        );
      }

      return (
        <code
          className={className}
          {...props}
          style={{
            backgroundColor:
              theme.palette.mode === "dark"
                ? "rgba(0,0,0,0.2)"
                : "rgba(0,0,0,0.05)",
            padding: "2px 4px",
            borderRadius: "4px",
            fontSize: "0.9em",
            fontFamily:
              'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            overflowWrap: "break-word",
          }}
        >
          {children}
        </code>
      );
    },
    p({ children }: any) {
      return (
        <p
          style={{
            margin: "0.5em 0",
            lineHeight: "1.6",
            overflowWrap: "break-word",
            wordWrap: "break-word",
            wordBreak: "break-word",
            hyphens: "auto",
          }}
        >
          {children}
        </p>
      );
    },
    pre({ children }: any) {
      return (
        <pre
          style={{
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            overflowWrap: "break-word",
          }}
        >
          {children}
        </pre>
      );
    },
    a({ children, href }: any) {
      const [isHovered, setIsHovered] = useState(false);
      
      return (
        <a
          href={href}
          style={{
            color: theme.palette.mode === "dark" 
              ? theme.palette.primary.light 
              : theme.palette.primary.main,
            textDecoration: isHovered ? "underline" : "none",
            transition: "color 0.2s ease",
          }}
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {children}
        </a>
      );
    },
  };
};
