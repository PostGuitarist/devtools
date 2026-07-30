import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { axe } from "vitest-axe";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

import Base64EncoderPage from "./client";

describe("Base64EncoderPage accessibility", () => {
  it("has no detectable axe violations", async () => {
    const { container } = render(<Base64EncoderPage />);
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});
