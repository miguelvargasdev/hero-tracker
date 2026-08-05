import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ErrorBoundary } from "./ErrorBoundary";

function Bomb(): never {
  throw new Error("boom");
}

describe("ErrorBoundary", () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // React logs the caught error to console.error too; silence it for a clean test run.
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    localStorage.clear();
  });

  it("renders children when there is no error", () => {
    render(
      <ErrorBoundary>
        <div>fine</div>
      </ErrorBoundary>,
    );
    expect(screen.getByText("fine")).toBeInTheDocument();
  });

  it("renders a fallback UI when a child throws", () => {
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    );
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("clears persisted store state when 'Reset app data' is clicked", () => {
    localStorage.setItem("hero-tracker-store", "{\"broken\":true}");
    const reloadSpy = vi.fn();
    vi.stubGlobal("location", { ...window.location, reload: reloadSpy });

    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    );

    fireEvent.click(screen.getByText("Reset app data & reload"));

    expect(localStorage.getItem("hero-tracker-store")).toBeNull();
    expect(reloadSpy).toHaveBeenCalled();

    vi.unstubAllGlobals();
  });
});
