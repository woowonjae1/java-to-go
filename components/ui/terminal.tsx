"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface TerminalProps {
  commands: string[];
  outputs: Record<number, string[]>;
  typingSpeed?: number;
  delayBetweenCommands?: number;
}

interface HistoryItem {
  id: string;
  type: "command" | "output";
  text: string;
}

export function Terminal({
  commands,
  outputs,
  typingSpeed = 45,
  delayBetweenCommands = 1000,
}: TerminalProps) {
  const [activeCommandIndex, setActiveCommandIndex] = useState(0);
  const [currentTypedText, setCurrentTypedText] = useState("");
  const [phase, setPhase] = useState<"typing" | "completed-command" | "waiting">("typing");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [copied, setCopied] = useState(false);
  
  const terminalBodyRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of terminal when history or typing changes
  useEffect(() => {
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
    }
  }, [history, currentTypedText]);

  // Timing/Typing animation effect
  useEffect(() => {
    if (!isPlaying) return;
    if (activeCommandIndex >= commands.length) return;

    const currentTargetCommand = commands[activeCommandIndex];

    if (phase === "typing") {
      // Typing phase
      if (currentTypedText.length < currentTargetCommand.length) {
        const timeout = setTimeout(() => {
          setCurrentTypedText((prev) => prev + currentTargetCommand[prev.length]);
        }, typingSpeed);
        return () => clearTimeout(timeout);
      } else {
        // Typing finished for this command
        const timeout = setTimeout(() => {
          setPhase("completed-command");
        }, 300); // Small pause after completing typing before outputting
        return () => clearTimeout(timeout);
      }
    } else if (phase === "completed-command") {
      // Execution Phase - Add command and its outputs to permanent history
      const outputLines = outputs[activeCommandIndex] || [];
      
      setHistory((prev) => {
        // Double-check to prevent duplicate insertion
        if (prev.some((item) => item.id === `cmd-${activeCommandIndex}`)) {
          return prev;
        }
        return [
          ...prev,
          {
            id: `cmd-${activeCommandIndex}`,
            type: "command",
            text: currentTargetCommand,
          },
          ...outputLines.map((line, idx) => ({
            id: `out-${activeCommandIndex}-${idx}`,
            type: "output" as const,
            text: line,
          })),
        ];
      });
      
      setCurrentTypedText("");
      setPhase("waiting");
    } else if (phase === "waiting") {
      // Delay before moving to the next command
      const timeout = setTimeout(() => {
        setPhase("typing");
        setActiveCommandIndex((prev) => prev + 1);
      }, delayBetweenCommands);

      return () => clearTimeout(timeout);
    }
  }, [
    isPlaying,
    phase,
    activeCommandIndex,
    currentTypedText,
    commands,
    outputs,
    typingSpeed,
    delayBetweenCommands,
  ]);

  // Syntax highlighting for commands
  const highlightCommand = (cmd: string) => {
    if (!cmd) return null;
    const parts = cmd.split(" ");
    return (
      <>
        {parts.map((part, index) => {
          let className = "text-zinc-100";
          
          if (index === 0) {
            // CLI runner
            if (["npm", "npx", "yarn", "pnpm", "bun", "git", "go"].includes(part)) {
              className = "text-emerald-400 font-semibold";
            } else {
              className = "text-cyan-400 font-semibold";
            }
          } else if (part.startsWith("-")) {
            // Command flags
            className = "text-amber-400";
          } else if (part.includes("@")) {
            // Version references
            className = "text-indigo-400";
          } else if (["install", "init", "add", "run", "build"].includes(part)) {
            // Key actions
            className = "text-purple-400 font-medium";
          } else if (index === 1 && !part.startsWith("-")) {
            // Target package or subcommand
            className = "text-zinc-200 font-medium";
          } else {
            // Standard parameters
            className = "text-zinc-400";
          }

          return (
            <span key={index}>
              <span className={className}>{part}</span>
              {index < parts.length - 1 ? " " : ""}
            </span>
          );
        })}
      </>
    );
  };

  // Nice rendering for outputs
  const highlightOutput = (line: string) => {
    if (line.startsWith("✔")) {
      return (
        <span className="text-zinc-300">
          <span className="text-emerald-400 font-bold mr-1.5">✔</span>
          {line.substring(2)}
        </span>
      );
    }
    if (line.toLowerCase().includes("error") || line.toLowerCase().includes("failed")) {
      return <span className="text-rose-400">{line}</span>;
    }
    return <span className="text-zinc-400">{line}</span>;
  };

  // Reset/Replay execution
  const handleReplay = () => {
    setHistory([]);
    setCurrentTypedText("");
    setActiveCommandIndex(0);
    setPhase("typing");
    setIsPlaying(true);
  };

  // Copy full terminal contents
  const handleCopy = () => {
    const linesToCopy: string[] = [];
    
    // Process history
    history.forEach((item) => {
      if (item.type === "command") {
        linesToCopy.push(`$ ${item.text}`);
      } else {
        linesToCopy.push(item.text);
      }
    });

    // Process current typing
    if (phase === "typing" && activeCommandIndex < commands.length) {
      linesToCopy.push(`$ ${currentTypedText}`);
    }

    navigator.clipboard.writeText(linesToCopy.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isFinished = activeCommandIndex >= commands.length;

  return (
    <div className="relative w-full max-w-3xl mx-auto rounded-xl border border-zinc-800 bg-[#09090b]/90 backdrop-blur-md overflow-hidden font-mono shadow-2xl before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-zinc-700/40 before:to-transparent">
      {/* Top Chrome Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-900 bg-zinc-950/40 select-none">
        {/* Left Window Buttons */}
        <div className="flex gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-500/80 hover:bg-rose-500 transition-colors cursor-pointer" onClick={handleReplay} title="Reset terminal" />
          <span className="w-3 h-3 rounded-full bg-amber-500/80 hover:bg-amber-500 transition-colors cursor-pointer" onClick={() => setIsPlaying(false)} title="Pause" />
          <span className="w-3 h-3 rounded-full bg-emerald-500/80 hover:bg-emerald-500 transition-colors cursor-pointer" onClick={() => setIsPlaying(true)} title="Resume" />
        </div>

        {/* Center Title */}
        <div className="text-xs text-zinc-400 font-medium tracking-wide font-sans flex items-center gap-1.5">
          <svg
            className="w-3.5 h-3.5 text-zinc-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          bash - java-to-go
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Play / Pause */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={isFinished}
            className="p-1 rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            title={isPlaying ? "Pause animation" : "Resume animation"}
          >
            {isPlaying ? (
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Reset / Replay */}
          <button
            onClick={handleReplay}
            className="p-1 rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-all"
            title="Restart terminal sequence"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3-3 3 3m-3-3v12" />
            </svg>
          </button>

          {/* Copy Clipboard */}
          <button
            onClick={handleCopy}
            className="p-1 rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-all relative"
            title="Copy terminal contents"
          >
            {copied ? (
              <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Terminal Screen Body */}
      <div
        ref={terminalBodyRef}
        className="p-5 md:p-6 overflow-y-auto max-h-[380px] min-h-[220px] text-[13px] md:text-sm text-zinc-300 flex flex-col gap-2 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent scroll-smooth"
      >
        {/* Render History lines */}
        {history.map((line) => (
          <motion.div
            key={line.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className="leading-relaxed whitespace-pre-wrap break-all"
          >
            {line.type === "command" ? (
              <div className="flex items-start gap-2">
                <span className="text-indigo-400 font-bold select-none">~</span>
                <span className="text-zinc-500 font-bold select-none">$</span>
                <div className="flex-1">{highlightCommand(line.text)}</div>
              </div>
            ) : (
              <div className="pl-6 text-zinc-400">{highlightOutput(line.text)}</div>
            )}
          </motion.div>
        ))}

        {/* Render Active typing command line if not finished */}
        {!isFinished && (
          <div className="flex items-start gap-2 leading-relaxed">
            <span className="text-indigo-400 font-bold select-none">~</span>
            <span className="text-zinc-500 font-bold select-none">$</span>
            <div className="flex-1 flex items-center flex-wrap">
              <span>{highlightCommand(currentTypedText)}</span>
              {phase === "typing" && (
                <span className="inline-block w-1.5 h-4 ml-1 bg-emerald-400 align-middle animate-[pulse_1s_infinite]" />
              )}
            </div>
          </div>
        )}

        {/* Finished terminal state */}
        {isFinished && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-start gap-2 leading-relaxed text-zinc-500 select-none"
          >
            <span className="text-indigo-400 font-bold">~</span>
            <span className="text-zinc-500 font-bold">$</span>
            <div className="flex-1 flex items-center gap-2">
              <span className="inline-block w-1.5 h-4 bg-zinc-600 align-middle animate-pulse" />
              <button
                onClick={handleReplay}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-sans hover:underline focus:outline-none ml-2"
              >
                Replay Animation
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
