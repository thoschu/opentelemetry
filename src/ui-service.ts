import start from './tracer';
start('ui-service');

import express from 'express';
import { Express } from 'express';

const app: Express = express();

const port: string | number = process.env.PORT || 8080;

app.use('/', express.static(__dirname + '/public'));

app.listen(port, (): void => {
    console.log(`Example app listening on port ${port}`);
});
