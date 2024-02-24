require("dotenv").config();
const { LocalStorage } = require("node-localstorage");
// const functions = require("../my_function/function.js");
const { remove, start, openWebKeyboard } = require("../markups/markups");
const functions = require("../functions/function");

const localStorage = new LocalStorage("./scratch");
const imageUrl =
  "https://codecapsules.io/wp-content/uploads/2023/07/how-to-create-and-host-a-telegram-bot-on-code-capsules-768x768.png";

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
        // const options = {
        //   caption:
        //     `Assalomu alaykum dispatcher botga xush kelibsiz` +
        //     "\n\n" +
        //     `Buyutma berish tugmasi orqali tez va oson buyurtma bering !` +
        //     "\n\n" +
        //     `Agar haydovchi bo'lsangiz Ro'yxatdan o'tish tugmasi orqali ro'xatdan o'ting!`,
        // };
        // await bot.sendPhoto(chatId, imageUrl, options);
        await bot.sendMessage(
          chatId,
          `Assalomu alaykum dispatcher botga xush kelibsiz` +
            "\n\n" +
            `Buyutma berish tugmasi orqali tez va oson buyurtma bering !` +
            "\n\n" +
            `Agar haydovchi bo'lsangiz Ro'yxatdan o'tish tugmasi orqali ro'xatdan o'ting!`,
          openWebKeyboard
        );
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
