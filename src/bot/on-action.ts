import { TEosAction } from "../eos/types";
import bot from "./index";
import { User } from "../entity/User";
import { NOTIFICATION_LEVEL } from "../types";
import { MoreThanOrEqual } from "typeorm";
import { Markup } from "telegraf";
import { fetchMsigMetadata } from "../eos/fetch";

const getBloksMsigLink = (proposer, proposalId) =>
  `https://bloks.io/msig/${proposer}/${proposalId}`;

const getUsersToNotify = async (notificationLevel: NOTIFICATION_LEVEL) => {
  return User.find({
    dacNotificationLevel: MoreThanOrEqual(notificationLevel)
  });
};

const getNotificationLevelForAction = (action: TEosAction) => {
  switch (action.name) {
    case "cancelled":
    case "clean":
    case "proposed":
      return NOTIFICATION_LEVEL.IMPORTANT;
    case "approved":
    case "unapproved":
    default:
      return NOTIFICATION_LEVEL.ALL;
  }
};

const getMessageForAction = async (action: TEosAction): Promise<[string, any]> => {
  const memberClientButton = Markup.urlButton(
    "🔎 VIGOR.ai",
    `https://vigor.ai/dac-activity/review-msigs`
  );
  const getBloksButton = (proposer, proposalId) =>
    Markup.urlButton(
      "️🗳️ Vote on Bloks",
      getBloksMsigLink(proposer, proposalId)
    );

  const defaultOptions = {
    parse_mode: `Markdown`,
    disable_web_page_preview: true,
    reply_markup: Markup.inlineKeyboard([memberClientButton]),
  };

  switch (action.name) {
    case "proposed":
      const metadata = JSON.parse(action.data.metadata);
      const description = metadata.description
        ? `\n${metadata.description}`
        : ``;
      return [
        `📖 New Proposal by ${action.data.proposer} (_${action.data.proposal_name}_):
*${metadata.title}*${description}
`,
        {
          ...defaultOptions,
          reply_markup: Markup.inlineKeyboard([
            memberClientButton,
            getBloksButton(action.data.proposer, action.data.proposal_name)
          ])
        }
      ];
    case `cancelled`: {
      const metadata = await fetchMsigMetadata(action)
      const description = metadata.description
        ? `\n${metadata.description}`
        : ``;
      return [
        `❌ Proposal by ${action.data.proposer} was cancelled (_${action.data.proposal_name}_):
*${metadata.title}*${description}
`,
        defaultOptions
      ];
    }
    default: {
      return [
        `👀 New VigorDAC action: *${action.name}*

\`\`\`json
${JSON.stringify(action.data, null, 2)}
\`\`\`
      `,
        defaultOptions
      ];
    }
  }
};

const onAction = async (action: TEosAction) => {
  const notificationLevel = getNotificationLevelForAction(action);
  const users = await getUsersToNotify(notificationLevel);

  const args = await getMessageForAction(action);
  for (const user of users) {
    // https://core.telegram.org/bots/api#sendmessage
    bot.telegram.sendMessage(user.telegramChatId, args[0], args[1]);
  }
};

export default onAction;
