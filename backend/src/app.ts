import express from 'express';
import { DataBase } from './utils/DataBase';
import cors from 'cors';
import { router } from './Routers';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
dotenv.config();

const app = express()
const port = process.env || 7943
const DB = new DataBase(process.env.mongoDB_api!);

//系統伺服器
const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        const allowedOrigins = [
            process.env.CORS_Options
        ];
        
        // 允許來自允許列表的請求
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type', 
        'Authorization', 
        'Cookie',
        'X-Requested-With'
    ],
    exposedHeaders: ['Set-Cookie'],
    maxAge: 86400,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
for (const route of router) {
    app.use(route.getRouter())
}

//=============================================
//dev 開發
app.listen(port, () => {
    console.log(`Server: http://localhost:${port}/user`)
});


