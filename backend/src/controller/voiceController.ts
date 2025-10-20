import { Controller } from "../interfaces/Controller";
import { Request, Response } from "express";

import dotenv from 'dotenv';
dotenv.config();

export class VoiceController extends Controller{
    public test(Request:Request, Response:Response){
        Response.send(`This is VoiceController`);
    }
}
