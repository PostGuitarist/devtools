"use client";

import { getToolsByCategory, toolCategories, tools } from "@/lib/tools-registry";
import { ToolCard } from "@/components/tools/tool-card";

export default function Home() {
  const liveCount = tools.filter((tool) => !tool.comingSoon).length;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-12 px-6 py-16 sm:py-20">
      <div className="flex flex-col gap-4">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Developer tools that
          <br />
          respect your <span className="text-primary">time.</span>
        </h1>
        <p className="text-muted-foreground max-w-xl text-base leading-relaxed">
          Format, encode, decode, and generate — all in your browser. Fast,
          private, and free. Nothing you paste ever leaves your machine.
        </p>
        <div className="text-muted-foreground flex items-center gap-3 font-mono text-[11px] tracking-wide">
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-green-500" />
            {liveCount} TOOLS LIVE
          </span>
          <span className="text-border">/</span>
          <span>{toolCategories.length} CATEGORIES</span>
          <span className="text-border">/</span>
          <span>100% CLIENT-SIDE</span>
        </div>
      </div>

      {toolCategories.map((category) => {
        const categoryTools = getToolsByCategory(category.id);
        if (categoryTools.length === 0) return null;

        return (
          <section key={category.id} className="flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <span className="bg-primary size-1.5 rounded-full" />
              <h2 className="text-[13px] font-bold tracking-wide uppercase">
                {category.name}
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categoryTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
