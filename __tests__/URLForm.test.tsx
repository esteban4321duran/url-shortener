import { render, screen } from "@testing-library/react";
import URLForm from "../components/URLForm";
import user from "@testing-library/user-event";

const submitHandler = jest.fn();
beforeEach(() => {
    renderUrlForm();
    submitHandler.mockClear();
});

describe("rendering", () => {
    it("renders input form", () => {
        const originalUrlInput = selectOriginalUrlInput();
        const submitButton = selectSubmitButton();
        expect(originalUrlInput).toBeInTheDocument();
        expect(submitButton).toBeInTheDocument();
    });
});

describe("validation", () => {
    it("calls submitHandler with input values if fields pass validation", async () => {
        const originalUrlValue = "http://www.example.com";
        const originalUrlInput = selectOriginalUrlInput();
        await user.type(originalUrlInput, originalUrlValue);
        const submitButton = selectSubmitButton();
        await user.click(submitButton);
        expect(submitHandler).toHaveBeenCalledTimes(1);
        expect(originalUrlInput).not.toBeInvalid();
        expect(submitHandler).toBeCalledWith({
            originalUrl: originalUrlValue,
        });
    });
    it("shows error message on invalid originalUrl", async () => {
        const originalUrlInput = selectOriginalUrlInput();
        await user.type(originalUrlInput, "not a url");
        const submitButton = selectSubmitButton();
        await user.click(submitButton);
        expect(submitHandler).not.toHaveBeenCalled();
        expect(originalUrlInput).toBeInvalid();
        expect(originalUrlInput).toHaveErrorMessage(/invalid url/i);
    });
    it("goes back to default is originalUrl is empty", async () => {
        const originalUrlInput = selectOriginalUrlInput();
        const submitButton = selectSubmitButton();
        await user.click(submitButton);
        expect(submitHandler).not.toHaveBeenCalled();
        expect(originalUrlInput).not.toBeInvalid();
        expect(originalUrlInput).not.toHaveErrorMessage();
    });
    it.skip("shows error message if originalUrl is longer than max length (takes too long)", async () => {
        const originalUrlInput = selectOriginalUrlInput();
        const longerThanMaxLength = createMaxLengthUrl(
            "http://www.example.com"
        );
        await user.type(originalUrlInput, longerThanMaxLength);
        const submitButton = selectSubmitButton();
        await user.click(submitButton);
        expect(submitHandler).not.toHaveBeenCalled();
        expect(originalUrlInput).toBeInvalid();
        expect(originalUrlInput).toHaveErrorMessage(/the url is too long/i);
    }, 60000);
});

function renderUrlForm() {
    return render(<URLForm submitHandler={submitHandler} />);
}
function selectOriginalUrlInput(): HTMLInputElement {
    return screen.getByRole("textbox", {
        name: /original url/i,
    });
}
function selectSubmitButton(): HTMLButtonElement {
    return screen.getByRole("button", { name: /shorten/i });
}
function createMaxLengthUrl(url: string) {
    const MAX_LENGTH = 2048;
    return (
        url +
        "/" +
        Array.from(Array(MAX_LENGTH))
            .map(() => "a")
            .join("")
    );
}
