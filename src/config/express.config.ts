import {
    Application, 
    urlencoded, 
    json
} from 'express';
import express from 'express';
import cors from 'cors';
import router from '../routes/api.route';

class ExpressConfiguration {
    public app: Application;
    
    constructor() {
        this.app = express();
        this.config();
    }

    private config(): void {
        this.app.use(urlencoded({extended: true}));
        this.app.use(json());
        this.app.use(cors({origin: '*'}));
        this.app.use('/api', router);
    }
}

export default new ExpressConfiguration().app;