require("dotenv").config();
const {
  remove,
  openWebKeyboardDriver,
  openWebKeyboardDriverPost,
  openWebKeyboardPassengers,
  oneFile,
  exprement,
} = require("../markups/markups");
const functions = require("../functions/function");
const Driver = require("../schemas/driver.schema");

const handleMessage = async (bot, msg) => {
  const chatId = msg.chat.id;
  //   console.log(msg);
  try {
    if (msg.text == "/start" || msg.text == "/status") {
      await handleStartCommand(bot, chatId);
    } else if (msg.text == "/start@tashkent_fergana_dispatcher_bot") {
      functions.sendWelcomeMessage(bot, msg.from.id);
    } else if (msg.text == "/new_driver") {
      await handleNewDriverRegistration(bot, chatId);
    } else if (msg.text == "/newOrderButton") {
      await bot.sendMessage(
        chatId,
        "Buyurtma berish",
        openWebKeyboardPassengers
      );
    } else if (msg.text == "/onefile") {
      await bot.sendMessage(chatId, "One File", oneFile);
    } else if (msg.text == "/exprement") {
      await bot.sendMessage(chatId, "exprement", openWebKeyboardDriverPost);
    }
  } catch (error) {
    console.error("Error handling message:", error);
  }
};

const handleStartCommand = async (bot, chatId) => {
  try {
    const res = await Driver.findOne({ chatId: chatId });
    if (res) {
      if (res.approvedByAdmin === true) {
        if (res.carNumber && !res.shift) {
          await functions.sendStartShiftMessage(bot, chatId, res.userName);
        } else if (res.carNumber && res.shift) {
          await functions.sendStopShiftMessage(bot, chatId, res.where);
        } else {
          await functions.sendStopShiftMessage(bot, chatId);
        }
      } else {
        await bot.sendMessage(
          chatId,
          "Hurmatli haydovchi arizangiz adminga yuborildi tasdiqlanishi bilan sizga habar beramiz."
        );
      }
    } else {
      functions.sendWelcomeMessage(bot, chatId);
    }
  } catch (error) {
    console.error("Error handling /start command:", error);
  }
};

const handleNewDriverRegistration = async (bot, chatId) => {
  try {
    await bot.sendMessage(
      chatId,
      "Assalomu alaykum hurmatli haydovchi biz siz bilan hamkorlik qilishdan mamnunmiz.\n\nIltimos quyidagi tugma orqali ro'yxatdan o'ting",
      openWebKeyboardDriver
    );
    // await bot.sendMessage(
    //   chatId,
    //   "Anketa yaratish",
    //   openWebKeyboardDriverPost
    // );
    // await bot.sendMessage(chatId, "Buyurtma berish", openWebKeyboardPassengers);
  } catch (error) {
    console.error("Error handling /new_driver command:", error);
  }
};

module.exports = {
  handleMessage,
};
