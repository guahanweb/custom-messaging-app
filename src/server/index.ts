import { default as express, Express } from "express";
import http from 'http';
import bodyParser from "body-parser";
import nunjucks from 'nunjucks';
import config from '../config';
import preflightInfo from "../middlewares/preflight-info";
import { initialize as initializeSessions } from "./session-management";
import Router from './routes'

interface ICreateServerOptions {
  enableSessions: boolean;
}

interface ICreateServerResponse {
  app: Express;
  server: http.Server;
}

const defaultServerOpts: ICreateServerOptions = {
  enableSessions: false,
}

export async function createServer(opts?: ICreateServerOptions): Promise<ICreateServerResponse> {
  const app = express();
  const server = http.createServer(app);
  const options = {
    ...defaultServerOpts,
    ...opts,
  };

  if (config.environment === 'production') {
    app.set('trust proxy', 1);
  }

  // enable sessions
  if (options.enableSessions) {
      initializeSessions(app);
  }

  app.use(preflightInfo());

  nunjucks.configure('views', {
    autoescape: true,
    express: app,
    watch: (config.environment === 'development'),
  });

  app.set('view engine', 'njk');
  app.use(express.static('public'));

  // set up all routes and config here
  // parse application/x-www-form-urlencoded
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  app.use('/', Router());

  return { app, server };
}
