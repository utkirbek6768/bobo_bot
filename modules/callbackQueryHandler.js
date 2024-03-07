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
    if (data.com === "start") {
      try {
        await bot.deleteMessage(chatId, msg.message.message_id);
        functions.changeRegion(bot, chatId, data.id);
      } catch (error) {
        console.log(error);
      }
    } else if (data.com === "region") {
      try {
        await bot.deleteMessage(chatId, msg.message.message_id);
        functions
          .updateDriver(
            bot,
            data.id,
            "shift",
            true,
            "queue",
            true,
            "where",
            data.reg
          )
          .then(async (res) => {
            const driverId = res._id.toString();
            functions.sendStopShiftMessage(bot, chatId, driverId);
          })
          .catch((err) => {
            console.log(err);
          });
      } catch (error) {
        console.log(error);
      }
    } else if (data.com === "stop") {
      try {
        await bot.deleteMessage(chatId, msg.message.message_id);

        const res = await functions.updateDriver(
          bot,
          data.id,
          "shift",
          false,
          "queue",
          false,
          "where",
          "all"
        );
        const driverId = res._id.toString();

        const startShift = "start";
        await bot.sendMessage(chatId, `Smanani boshlaymizmi ?`, {
          reply_markup: JSON.stringify({
            inline_keyboard: [
              [
                {
                  text: "Smanani boshlash",
                  callback_data: JSON.stringify({
                    com: startShift,
                    id: driverId,
                  }),
                },
              ],
            ],
          }),
        });
      } catch (error) {
        console.error("Error handling stop command:", error);
      }
    } else if (data.com === "nor") {
      if (data.val == "accept") {
        await bot.sendMessage(chatId, data.id);
      } else if (data.val == "next") {
        await bot.sendMessage(chatId, data.id);
      } else if (data.val == "err") {
        await bot.sendMessage(chatId, data.id);
      }
    }
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  handleCallbackQuery,
};
