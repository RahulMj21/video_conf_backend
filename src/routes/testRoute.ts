import express, { Request, Response } from "express";
const router = express.Router();

router.route("/healthcheck").get((req: Request, res: Response) => {
  res.status(200).json({ success: true, message: "all good" });
});

export default router;
