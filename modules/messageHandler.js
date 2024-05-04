require("dotenv").config();
const {
  remove,
  openWebKeyboardDriver,
  openWebKeyboardDriverPost,
  openWebKeyboardPassengers,
} = require("../markups/markups");
const functions = require("../functions/function");
const Driver = require("../schemas/driver.schema");

const handleMessage = async (bot, msg) => {
  //   console.log(msg);
  const chatId = msg.chat.id;
  try {
    if (msg.text == "/start") {
      try {
        const res = await Driver.findOne({ chatId: chatId });
        if (res) {
          if (res.carNumber && !res.shift) {
            await functions.sendStartShiftMessage(bot, chatId, res.userName);
          } else if (res.carNumber && res.shift) {
            await functions.sendStopShiftMessage(bot, chatId, res.where);
          } else if (res.length <= 0) {
            await functions.sendStopShiftMessage(bot, chatId);
          }
        } else {
          functions.sendWelcomeMessage(bot, chatId);
        }
      } catch (error) {
        console.error("Error handling /start command:", error);
      }
    } else if (msg.text == "/start@tashkent_fergana_dispatcher_bot") {
      try {
        functions.sendWelcomeMessage(bot, msg.from.id);
      } catch (err) {
        console.log(err);
      }
    } else if (msg.text == "/newDriverRegistration") {
      try {
        // await bot.sendMessage(
        //   chatId,
        //   "Assalomu alaykum hurmatli haydovchi biz siz bilan hamkorlik qilishdan mamnunmiz.\n\nIltimos quyidagi tugma orqali ro'yxatdan o'ting",
        //   openWebKeyboardDriver
        // );
        // await bot.sendMessage(
        //   chatId,
        //   "Anketa yaratish",
        //   openWebKeyboardDriverPost
        // );
        await bot.sendMessage(
          chatId,
          "Buyurtma berish",
          openWebKeyboardPassengers
        );
      } catch (err) {
        console.log(err);
      }
    } else {
    }
  } catch (error) {
    console.error(error.message);
  }
};

module.exports = {
  handleMessage,
};
