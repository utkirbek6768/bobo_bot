require("dotenv").config();
const { LocalStorage } = require("node-localstorage");
// const functions = require("../my_function/function.js");
const { remove, start, openWebKeyboard } = require("../markups/markups");
const { loadLanguageFile } = require("../functions/function.js");

const localStorage = new LocalStorage("./scratch");

const handleMessage = async (bot, msg) => {
  const chatId = msg.chat.id;
  const telefonRegex = /^998(?:73|90|91|93|94|95|97|98|99)[1-9]\d{6}$/;
  //   const step = localStorage.getItem("step") || "start";
  const langCode = localStorage.getItem("lang") || "uz";
  //   const lang = loadLanguageFile(langCode);
  try {
    if (msg.text && msg.text == "/start") {
      try {
        const chatId = msg.chat.id;
        await bot.sendMessage(chatId, "Assalomu alaykum", openWebKeyboard);
      } catch (err) {
        console.log(err);
      }
    } else if (
      msg.text &&
      msg.text == "/start@tashkent_fergana_dispatcher_bot"
    ) {
      try {
        const chatId = msg.chat.id;
        await bot.sendMessage(chatId, "Assalomu alaykum", openWebKeyboard);
      } catch (err) {
        console.log(err);
      }
    } else {
      //   console.log("botga message keldi", msg);
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  handleMessage,
};
