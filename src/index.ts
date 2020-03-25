import * as fs from 'fs';
import path from 'path';
import app from './config/express.config';
import { Robinhood } from './robinhood/robinhood.api';

const secure_info = fs.readFileSync(path.join(__dirname, '/security/secure.json')).toString();
const parsedSecureInfo = JSON.parse(secure_info);

app.listen(3000, () => {
    console.log('Logging in...');
    Robinhood.login(parsedSecureInfo.username, parsedSecureInfo.password).subscribe((val) => {
        console.log(val);
    });
});