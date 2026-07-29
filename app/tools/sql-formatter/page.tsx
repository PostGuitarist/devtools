"use client";

import * as React from "react";
import Editor, { loader } from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { format as formatSql, type SqlLanguage } from "sql-formatter";
import { AlignLeft, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToolLayout } from "@/components/tool-layout";
import { downloadTextFile } from "@/lib/download-text-file";

loader.config({ paths: { vs: "/vs" } });

const DIALECTS: { value: SqlLanguage; label: string }[] = [
  { value: "sql", label: "Standard SQL" },
  { value: "mysql", label: "MySQL" },
  { value: "postgresql", label: "PostgreSQL" },
  { value: "sqlite", label: "SQLite" },
  { value: "mariadb", label: "MariaDB" },
  { value: "tsql", label: "T-SQL (SQL Server)" },
  { value: "plsql", label: "PL/SQL (Oracle)" },
];

const PLACEHOLDER = `select u.id, u.name, count(o.id) as order_count from users u left join orders o on o.user_id = u.id where u.active = true group by u.id, u.name order by order_count desc limit 10;`;

export default function SqlFormatterPage() {
  const { resolvedTheme } = useTheme();
  const [code, setCode] = React.useState(PLACEHOLDER);
  const [dialect, setDialect] = React.useState<SqlLanguage>("sql");
  const [error, setError] = React.useState<string | null>(null);

  function format() {
    try {
      setCode(formatSql(code, { language: dialect, keywordCase: "upper" }));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not format SQL");
    }
  }

  return (
    <ToolLayout
      toolId="sql-formatter"
      title="SQL Formatter"
      description="Beautify SQL queries with consistent indentation."
      onClear={() => {
        setCode("");
        setError(null);
      }}
      onCopy={() => navigator.clipboard.writeText(code)}
      onDownload={() => downloadTextFile("query.sql", code)}
      actions={
        <>
          <Select
            value={dialect}
            onValueChange={(value) => setDialect(value as SqlLanguage)}
          >
            <SelectTrigger size="sm" className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DIALECTS.map((d) => (
                <SelectItem key={d.value} value={d.value}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={format}>
            <AlignLeft />
            Format
          </Button>
        </>
      }
    >
      <div className="flex flex-1 flex-col gap-3">
        {error && (
          <Alert variant="destructive">
            <TriangleAlert />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="h-[560px] overflow-hidden rounded-md border">
          <Editor
            language="sql"
            value={code}
            onChange={(value) => setCode(value ?? "")}
            theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
            }}
          />
        </div>
      </div>
    </ToolLayout>
  );
}
