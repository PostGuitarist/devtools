import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { axe } from "vitest-axe";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

import CaseConverterPage from "./client";

describe("CaseConverterPage accessibility", () => {
  it("has no detectable axe violations", async () => {
    const { container } = render(<CaseConverterPage />);
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});
