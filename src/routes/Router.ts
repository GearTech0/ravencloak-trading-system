import express from 'express';
import ChallengeRoute from './api/Challenge.route';
import UserRoute from './api/User.route';
let router = express.Router();

const challengeRoute: ChallengeRoute = new ChallengeRoute('/challenge');
const userRoute: UserRoute = new UserRoute('/user');

challengeRoute.Register(router);
userRoute.Register(router);

export default router;