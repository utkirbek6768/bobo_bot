const fs = require("fs");
const https = require("https");
const path = require("path");
require("dotenv").config();
// const apiModule = require("../my_axios.js");
// const api = apiModule.instance;
const functions = require("../functions/function.js");
// const { remove, start } = require("../markups/markups");

const handleCallbackQuery = async (bot, msg) => {
  const data = JSON.parse(msg.data);
  const chatId = msg.message.chat.id;
  try {
    if (data.command === "startSmena") {
      try {
        await bot.deleteMessage(chatId, msg.message.message_id);
        updateOrder(bot, chatId, orderId, item, value);
        await bot.sendMessage(
          chatId,
          "Qaysi hududan buyurtma olishni tanlang",
          {
            reply_markup: JSON.stringify({
              inline_keyboard: [
                [
                  {
                    text: "Toshkentdan ➡️ Farg'onaga",
                    callback_data: JSON.stringify({
                      com: "region",
                      reg: "fergana",
                      id: data.id,
                    }),
                  },
                ],
                [
                  {
                    text: "Farg'onaga ➡️ Toshkentdan",
                    callback_data: JSON.stringify({
                      com: "region",
                      reg: "toshkent",
                      id: data.id,
                    }),
                  },
                ],
              ],
            }),
          }
        );
      } catch (error) {
        console.log(error);
      }
    } else if (data.command === "changeRegion") {
      try {
        await bot.deleteMessage(chatId, msg.message.message_id);
      } catch (error) {
        console.log(error);
      }
    }
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  handleCallbackQuery,
};
