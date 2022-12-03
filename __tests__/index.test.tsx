import { render, screen } from "@testing-library/react";
import Home from "@/pages/index";

describe("Home", () => {
    it("renders a heading", () => {
        render(<Home />);
        const heading = screen.getByRole("heading");
        expect(heading).toBeInTheDocument();
    });
    it("renders website's name", () => {
        render(<Home />);
        const heading = screen.getByText(/esteban's url shortener/i);
        expect(heading).toBeInTheDocument();
    });
});
