const fs = require("fs");
const https = require("https");
const path = require("path");
require("dotenv").config();
// const apiModule = require("../my_axios.js");
// const api = apiModule.instance;
const functions = require("../functions/function.js");
// const { remove, start, openWebKeyboard } = require("../markups/markups");

const { LocalStorage } = require("node-localstorage");
const localStorage = new LocalStorage("./scratch");

// startCommandHandler.js
const StartCommand = async (bot, msg) => {
  //   try {
  //     const chatId = msg.chat.id;
  //     await bot.sendMessage(chatId, uz.hello, start);
  //     localStorage.setItem("step", "sendCode");
  //   } catch (err) {
  //     console.log(err);
  //   }
};

const driverRegister = async (bot, msg) => {
  try {
    const chatId = msg.chat.id;
    const langs = functions.loadLanguageFile("ru");
    await bot.deleteMessage(chatId, msg.message_id);
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  StartCommand,
  driverRegister,
};
