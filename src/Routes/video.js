import express from "express";
import { tryCatch } from "../Utils/CrashHandling";
import VideoEntry from "../schema/Video";
import { BadRequest } from "../Error/AppError";
import { DataAlreadyExists } from "../Error/errorCodes";
const router = express.Router();

router.post(
  "/:videoId",
  tryCatch(async (req, res) => {
    const videoId = req.params.videoId;

    const isAlreadyExists = await VideoEntry.findOne({ videoId });
    if (isAlreadyExists) {
      throw new BadRequest(
        DataAlreadyExists,
        `Video with id ${videoId} is already present`
      );
    }

    const video = new VideoEntry({ videoId });
    await video.save();
    res.json({ reactions: video.reactions });
  })
);

export default router;
