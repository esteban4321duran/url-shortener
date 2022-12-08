import Head from "next/head";
import URLForm from "@/components/URLForm";
import { useState, useEffect } from "react";
import Image from "next/image";

const Home: React.FC = () => {
    //TODO declare types for these states
    const [inputValues, setInputValues] = useState<any>({});
    const [submitForm, setSubmitForm] = useState(false);
    const [shortenedUrl, setShortenedUrl] = useState("");

    function handleSubmit(inputValues: { originalUrl: string }) {
        setInputValues((oldState: any) => {
            return { ...oldState, ...inputValues };
        });
        setSubmitForm(true);
    }

    useEffect(() => {
        if (!submitForm) return;
        async function sendInput() {
            const response = await fetch("/api/urls", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ originalUrl: inputValues.originalUrl }),
            });
            const responseData = await response.json();
            setShortenedUrl(responseData.shortenedUrl);
            setSubmitForm(false);
        }
        sendInput();
    }, [inputValues, submitForm]);

    return (
        <>
            <Head>
                <title>Esteban's URL shortener</title>
            </Head>
            <header className="flex justify-center mt-10">
                <h1 className="font-semibold text-6xl">
                    Esteban's URL shortener
                </h1>
            </header>
            <main className="flex flex-col space-y-8 ">
                <URLForm submitHandler={handleSubmit} />
                <div className="shadow-lg p-4 bg-slate-100 w-full max-w-lg  flex justify-center space-x-4">
                    <label className="">
                        <span>Shortened URL:</span>
                        <input type="text" value={shortenedUrl} readOnly />
                    </label>
                    <button
                        aria-label="copy"
                        onClick={() => {
                            navigator.clipboard.writeText(shortenedUrl);
                        }}
                    >
                        <Image
                            src="/images/copy.png"
                            alt="copy button"
                            width={25}
                            height={25}
                        />
                    </button>
                </div>
            </main>
        </>
    );
};

export default Home;
