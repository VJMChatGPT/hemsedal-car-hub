import { render, screen } from "@testing-library/react";
import HomePage from "@/features/home/pages/HomePage";

describe("HomePage", () => {
  it("renders key sections", () => {
    render(<HomePage />);

    expect(screen.getByText("Explore Hemsedal")).toBeInTheDocument();
    expect(screen.getByText("Choose Your Perfect Ride")).toBeInTheDocument();
    expect(screen.getByText("Reserva Tu Vehículo")).toBeInTheDocument();
    expect(screen.getByText("Ready to Hit the Road?")).toBeInTheDocument();
  });
});
