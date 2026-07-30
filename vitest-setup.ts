// jsdom doesn't implement ResizeObserver, which Radix UI's popover-based
// components (Select, Tooltip, DropdownMenu) rely on for positioning.
if (typeof window !== "undefined" && !window.ResizeObserver) {
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
