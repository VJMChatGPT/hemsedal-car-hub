import { render, screen } from "@testing-library/react";
import HomePage from "@/features/home/pages/HomePage";

describe("HomePage", () => {
  it("renders key sections", () => {
    render(<HomePage />);

    expect(screen.getByText("Drive Norway with calm confidence.")).toBeInTheDocument();
    expect(screen.getByText("Built for Winter")).toBeInTheDocument();
    expect(screen.getByText("Pick. Confirm. Drive.")).toBeInTheDocument();
  });
});
