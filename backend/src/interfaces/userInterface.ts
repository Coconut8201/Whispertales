import { storyInterface } from "./storyInterface";

export interface userInterface {
    userName: string,
    userPassword: string,
    booklist: Array<string>, //僅存放story 的id
    voiceList: Array<string>,
}