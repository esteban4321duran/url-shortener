import Hashids from "hashids";
const SALT = "argentina-2022";
const PAD_TO_LENGTH = 4;

const idHasher = new Hashids(SALT, PAD_TO_LENGTH);

export default idHasher;
