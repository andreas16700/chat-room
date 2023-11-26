import type { Post, UnparsedPost } from "../../types/room.type";

import path from "path";
import crypt from 'crypto';
import fs  from 'fs';

const __dirname = path.resolve();
const privateDir = path.join(__dirname, "server", "private")
const roomDir = path.join(privateDir, "chatPrograms")

export module Posts {
    

    const fileNameToHash = (fileName) => 
        encodeURIComponent(crypt.createHash('sha256').update(fileName).digest('base64'))

    const getRawRoomData = async (postFileName: string): Promise<UnparsedPost> => {
        const rawdata = await fs.promises.readFile(path.resolve(roomDir, "posts", postFileName))
        const roomData: UnparsedPost = JSON.parse(rawdata.toString())
        return roomData
    }

    export const getPostData = async (postFileName: string): Promise<Post> => {

        const unparsedPostData: UnparsedPost = await getRawRoomData(postFileName);

        const id = fileNameToHash(postFileName);
        const time: Date = new Date(Date.parse(unparsedPostData.time))
        const title: string = unparsedPostData.title
        const lead: string = unparsedPostData.lead
        const content: string = unparsedPostData.content
        const imageName: string = unparsedPostData.imageName //path.join("build", "postImages", unparsedPostData.imageName)
        return {
            id,
            time,
            title,
            lead,
            content,
            imageName
        }
    }
}