import type { Metadata } from "next";
import HistoryClient from "./client";

export const metadata: Metadata = {
  title: "History — DevTools",
  description: "Tools you've recently visited, searchable and grouped by day.",
  alternates: { canonical: "/history" },
};

export default function Page() {
  return <HistoryClient />;
}
