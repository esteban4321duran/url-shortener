import React, { useState } from "react";
import Image from "next/image";

interface propsInterface {
    submitHandler: (inputValues: { originalUrl: string }) => void;
}

const MAX_LENGTH = 2048;

const URLForm: React.FC<propsInterface> = ({ submitHandler }) => {
    const [originalUrl, setOriginalUrl] = useState("");
    const [invalidUrl, setInvalidUrl] = useState(false);
    const [originalUrlMessage, setOriginalUrlMessage] = useState("");

    return (
        <form
            className="shadow-lg p-4 bg-slate-100 w-full max-w-lg flex flex-col items-center space-y-4 rounded-sm"
            onSubmit={(event: React.SyntheticEvent) => {
                event.preventDefault();
                if (originalUrl === "") {
                    setInvalidUrl(false);
                    return;
                }
                if (originalUrl.length > MAX_LENGTH) {
                    setInvalidUrl(true);
                    setOriginalUrlMessage("The URL is too long");
                    return;
                }
                if (!isValidUrl(originalUrl)) {
                    setInvalidUrl(true);
                    setOriginalUrlMessage("Invalid URL");
                    return;
                }

                setInvalidUrl(false);
                submitHandler({ originalUrl });
            }}
        >
            <label className="flex justify-center space-x-4">
                <span>Original URL:</span>
                <input
                    type="text"
                    onChange={(event: React.FormEvent<HTMLInputElement>) => {
                        setOriginalUrl(event.currentTarget.value);
                    }}
                    value={originalUrl}
                    aria-invalid={invalidUrl ? "true" : "false"}
                    aria-errormessage="originalUrlError"
                />
                <button
                    aria-label="paste"
                    onClick={async () => {
                        const clipboardText =
                            await navigator.clipboard.readText();

                        setOriginalUrl(clipboardText.trim());
                    }}
                >
                    <Image
                        src="/images/paste.png"
                        width={25}
                        height={25}
                        alt="paste button"
                    />
                </button>
            </label>
            {invalidUrl && (
                <span id="originalUrlError" className="text-red-600">
                    {originalUrlMessage}
                </span>
            )}
            <button type="submit" className="border rounded-sm py-1 px-4">
                Shorten
            </button>
        </form>
    );
};
export default URLForm;

function isValidUrl(possibleUrl: string): boolean {
    let url;
    try {
        url = new URL(possibleUrl);
    } catch (error) {
        return false;
    }
    return url.protocol === "http:" || url.protocol === "https:";
}
