import express from 'express';
import { getTaskReport, getUserReport } from '../controler/reportControler.js';

const reportRoutes = express.Router();

// get methods

reportRoutes.get("/task",getTaskReport);

reportRoutes.get("/user",getUserReport);

// post methods

// put methods

// delete methods

export default reportRoutes;

