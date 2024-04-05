require("dotenv").config();
const { LocalStorage } = require("node-localstorage");
const {
  remove,
  start,
  openWebKeyboardPassengers,
  openWebKeyboardDriver,
  openWebKeyboardDriverPost,
} = require("../markups/markups");
const functions = require("../functions/function");
const Order = require("../schemas/order.schema");
const Driver = require("../schemas/driver.schema");
const Queue = require("../schemas/queue.schema");
const localStorage = new LocalStorage("./scratch");
const imageUrl =
  "https://codecapsules.io/wp-content/uploads/2023/07/how-to-create-and-host-a-telegram-bot-on-code-capsules-768x768.png";

const handleMessage = async (bot, msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  const telefonRegex = /^998(?:73|90|91|93|94|95|97|98|99)[1-9]\d{6}$/;
  const messageId = msg.message_id;
  //   const step = localStorage.getItem("step") || "start";
  try {
    if (msg.text == "/start") {
      try {
        const res = await Driver.findOne({ chatId: chatId });
        if (res) {
          // const driverId = res._id.toString();
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
    } else if (msg.text == "/register") {
      try {
        await bot.sendMessage(
          chatId,
          "Assalomu alaykum hurmatli haydovchi biz siz bilan hamkorlik qilishdan mamnunmiz.\n\nIltimos quyidagi tugma orqali ro'yxatdan o'ting",
          openWebKeyboardDriver
        );
      } catch (err) {
        console.log(err);
      }
    } else if (msg.text == "/createpost") {
      try {
        await bot.sendMessage(
          chatId,
          "Assalomu alaykum hurmatli haydovchi kanalga elon berish uchun oson  post tayorlashingiz mumkin .\n\nIltimos quyidagi tugma orqali boshlang",
          remove
        );
      } catch (err) {
        console.log(err);
      }
    } else {
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  handleMessage,
};
