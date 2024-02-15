import express from "express";
import { tryCatch } from "../Utils/CrashHandling";

import VideoEntry from "../schema/Video";
import User from "../schema/User";

import Joi from "joi";

import PossibleReactions from "./../Validations/PossibleReactions";
import { BadRequest, NotFound } from "../Error/AppError";
import { ValidationError } from "../Error/errorCodes";
import {
  InvalidVideoId,
  RequestValidationErrorMessage,
} from "../Error/errorMessages";

const router = express.Router();

const ReactionRequestSchema = Joi.object({
  reaction: Joi.string()
    .required()
    .valid(...PossibleReactions),

  "user-id": Joi.string().optional(),
  "system-id": Joi.string().optional(),
});

const fetchExistingVideo = async (videoId) => {
  const video = await VideoEntry.findOne({ videoId });
  return video;
};

const fetchOrCreateUser = async (userId, systemId) => {
  const existingUser = await User.findOne({ systemId });
  if (existingUser) {
    return existingUser;
  }

  const newUser = new User({ userId, systemId });
  await newUser.save();
  return newUser;
};

router.get(
  "/:videoId",
  tryCatch(async (req, res) => {
    const videoId = req.params.videoId;
    const video = await fetchExistingVideo(videoId);

    if (!video) {
      throw new NotFound(`Video with id ${videoId} not found`);
    }

    res.json({ reactions: video.reactions });
  })
);

router.post(
  "/:videoId",
  tryCatch(async (req, res) => {
    const requestBody = req.body;

    const { error } = ReactionRequestSchema.validate(requestBody);

    if (error) {
      throw new BadRequest(
        ValidationError,
        RequestValidationErrorMessage,
        error.details[0].message
      );
    }

    const videoId = req.params.videoId;

    const video = await fetchExistingVideo(videoId);

    if (!video) {
      throw new BadRequest(ValidationError, InvalidVideoId(videoId));
    }

    const userId = requestBody["user-id"] ?? null,
      systemId = requestBody["system-id"],
      reactionType = requestBody["reaction"];

    const user = await fetchOrCreateUser(userId, systemId);

    let previousReaction = null;
    if (user.reactions) {
      for (const reactionName of PossibleReactions) {
        if (user.reactions.get(reactionName)?.includes(videoId)) {
          previousReaction = reactionName;
          break;
        }
      }
    }

    const videoUpdateQuery = {},
      userUpdateQuery = {};

    if (previousReaction == null) {
      // User is reacting for the video for the first time

      videoUpdateQuery["$inc"] = { [`reactions.${reactionType}`]: 1 };
      userUpdateQuery["$push"] = {
        [`reactions.${reactionType}`]: videoId,
      };
    } else {
      // User had already reacted for the selected video

      userUpdateQuery["$pull"] = {
        [`reactions.${previousReaction}`]: videoId,
      };

      videoUpdateQuery["$inc"] = { [`reactions.${previousReaction}`]: -1 };

      // User is adding a new reaction
      if (previousReaction !== reactionType) {
        videoUpdateQuery["$inc"][`reactions.${reactionType}`] = 1;

        userUpdateQuery["$push"] = {
          [`reactions.${reactionType}`]: videoId,
        };
      }
    }

    const updatedVideo = await VideoEntry.findOneAndUpdate(
      { videoId },
      videoUpdateQuery,
      {
        new: true,
        upsert: true,
      }
    );

    const updatedUser = await User.findOneAndUpdate(
      { systemId },
      userUpdateQuery,
      {
        new: true,
        upsert: true,
      }
    );

    res.json({
      video: updatedVideo.reactions,
      user: updatedUser.reactions,
    });
  })
);

export default router;
