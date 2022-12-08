import { useEffect, useState } from "react";
import { GetServerSidePropsContext } from "next";
import connectionPool from "../config/db";
import idHasher from "../config/hashIds";
import { RowDataPacket } from "mysql2";
import { useRouter } from "next/router";
import Spinner from "@/components/Spinner";
import Head from "next/head";

interface PropsInterface {
    originalUrl: string | null;
}

const Redirecting: React.FC<PropsInterface> = ({ originalUrl }) => {
    const router = useRouter();
    const [redirect, setRedirect] = useState(false);
    const [message, setMessage] = useState(
        "Please wait, you are being redirected"
    );
    useEffect(() => {
        if (redirect) router.replace(originalUrl!);
    }, [redirect]);
    useEffect(() => {
        setTimeout(() => {
            setRedirect(true);
        }, 2000);
    });
    if (originalUrl === null)
        setMessage("The shortened URL you provided is not valid");

    return (
        <>
            <Head>
                <title>Redirecting</title>
            </Head>
            <main className="flex justify-center items-center">
                <div className="shadow-lg p-4 bg-slate-100 w-full max-w-lg  flex items-center space-y-4 flex-col">
                    <p className="text-xl">{message}</p>
                    <Spinner />
                </div>
            </main>
        </>
    );
};
export default Redirecting;

export async function getServerSideProps(
    context: GetServerSidePropsContext<{ shortenedUrl: string }>
) {
    //get originalUrl from DB
    const shortenedUrl = context.params?.shortenedUrl!;

    const [urlId] = idHasher.decode(shortenedUrl);
    if (urlId === undefined) {
        const props: PropsInterface = {
            originalUrl: null,
        };
        return {
            props,
        };
    }

    const [rows, _] = await connectionPool.query(
        "SELECT original_url AS `originalUrl` FROM urls WHERE id = ?;",
        urlId
    );

    const [{ originalUrl }] = rows as RowDataPacket[];

    const props: PropsInterface = {
        originalUrl,
    };

    return {
        props,
    };
}
