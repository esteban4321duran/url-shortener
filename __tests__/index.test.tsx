import { render, screen } from "@testing-library/react";
import user from "@testing-library/user-event";
import Home from "@/pages/index";

beforeEach(() => {
    render(<Home />);
});
describe("rendering", () => {
    it("renders a heading", () => {
        const heading = screen.getByRole("heading");
        expect(heading).toBeInTheDocument();
    });
    it("renders website's name", () => {
        const heading = screen.getByText(/esteban's url shortener/i);
        expect(heading).toBeInTheDocument();
    });
    it("renders output field", () => {
        const shortenedUrlInput = screen.getByRole("textbox", {
            name: /shortened url/i,
        });
        expect(shortenedUrlInput).toBeInTheDocument();
    });
    it("renders URLForm", () => {
        const urlForm = selectOriginalUrlInput();
        expect(urlForm).toBeInTheDocument();
    });
});

describe("behaviour", () => {
    it("sends POST request and renders shortened url from response on form submit", async () => {
        //mock fetch
        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: () =>
                    Promise.resolve({
                        shortenedUrl: "localhost/3Bhi",
                    }),
            })
        ) as jest.Mock;
        const originalUrlInput = selectOriginalUrlInput();
        await user.type(originalUrlInput, "http://www.example.com");
        const submitButton = selectSubmitButton();
        //component calls fetch. The mocked version will be called instead
        await user.click(submitButton);
        //POST request is sent. The response data is rendered to the outputField
        const outputField = screen.getByDisplayValue(/localhost\/3Bhi/i);
        expect(outputField).toBeInTheDocument();
    });
});

//TODO test output field is read-only
function selectOriginalUrlInput(): HTMLInputElement {
    return screen.getByRole("textbox", {
        name: /original url/i,
    });
}
function selectSubmitButton(): HTMLButtonElement {
    return screen.getByRole("button", { name: /shorten/i });
}
