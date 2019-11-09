import { User } from "../entity/User";
import { MoreThanOrEqual } from "typeorm";
import { NOTIFICATION_LEVEL } from "../types";
import bot from ".";
import { logger } from "../logger";

export const getBloksMsigLink = (proposer, proposalId) =>
  `https://bloks.io/msig/${proposer}/${proposalId}`;

export const getUsersToNotify = async (notificationLevel: NOTIFICATION_LEVEL) => {
  return User.find({
    dacNotificationLevel: MoreThanOrEqual(notificationLevel)
  });
};

export const sendToUsers = async (users: User[], message, messageOptions?) => {
  for (const user of users) {
    // https://core.telegram.org/bots/api#sendmessage
    try {
      await bot.telegram.sendMessage(user.telegramChatId, message, messageOptions);
    } catch (error) {
      // ignore 403: Forbidden: bot was blocked by the user 
      if(error.code !== 403) {
        logger.error(error.message)
      }
    }
  }
}