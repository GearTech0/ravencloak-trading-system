import express from 'express';
import ChallengeRoute from './api/Challenge.route';
import UserRoute from './api/User.route';
import InstrumentRoute from './api/Instrument.route';
let router = express.Router();

const challengeRoute: ChallengeRoute = new ChallengeRoute('/challenge');
const userRoute: UserRoute = new UserRoute('/user');
const instrumentRoute: InstrumentRoute = new InstrumentRoute('/instruments');

challengeRoute.Register(router);
userRoute.Register(router);
instrumentRoute.Register(router);

export default router;