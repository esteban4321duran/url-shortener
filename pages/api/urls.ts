import { NextApiRequest, NextApiResponse } from "next";
import connectionPool from "../../config/db";
import { ResultSetHeader } from "mysql2";
import idHasher from "../../config/hashIds";

const MAX_URL_LENGTH = 2048;

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === "POST") {
        const { originalUrl } = req?.body;

        if (originalUrl === undefined)
            return res.status(400).json({
                message: "originalUrl field must be provided",
            });

        if (originalUrl === "")
            return res.status(400).json({
                message: "originalUrl field can not be empty",
            });

        if (originalUrl.length > MAX_URL_LENGTH)
            return res.status(400).json({
                message: "originalUrl field is too long",
            });

        if (!isValidUrl(originalUrl))
            return res.status(400).json({
                message: "originalUrl field is invalid",
            });

        const [rows, fields] = await connectionPool.query(
            "INSERT INTO urls (original_url) VALUES (?);",
            originalUrl
        );

        const { insertId: newRowId } = rows as ResultSetHeader;

        const shortenedUrl = `${process.env.DOMAIN_NAME}${idHasher.encode(
            newRowId
        )}`;

        await connectionPool.query(
            "UPDATE urls SET shortened_url = ? WHERE id = ?",
            [shortenedUrl, newRowId]
        );

        return res.status(201).json({
            shortenedUrl,
        });
    }
}

function isValidUrl(possibleUrl: string): boolean {
    let url;
    try {
        url = new URL(possibleUrl);
    } catch (error) {
        return false;
    }
    return url.protocol === "http:" || url.protocol === "https:";
}
