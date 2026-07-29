"use client";

import { getToolsByCategory, toolCategories } from "@/lib/tools-registry";
import { ToolCard } from "@/components/tools/tool-card";

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-6 py-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Developer Utilities
        </h1>
        <p className="text-muted-foreground">
          A fast, fully client-side toolkit for everyday developer tasks.
          Nothing you paste ever leaves your browser.
        </p>
      </div>

      {toolCategories.map((category) => {
        const categoryTools = getToolsByCategory(category.id);
        if (categoryTools.length === 0) return null;

        return (
          <section key={category.id} className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <category.icon className="text-muted-foreground size-5" />
              <h2 className="text-lg font-semibold">{category.name}</h2>
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
