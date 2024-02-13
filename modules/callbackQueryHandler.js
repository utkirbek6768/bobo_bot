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
    if (data.command === "sendSms") {
    } else if (data.command === "getme") {
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
