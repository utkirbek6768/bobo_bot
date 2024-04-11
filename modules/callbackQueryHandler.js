require("dotenv").config();
const Driver = require("../schemas/driver.schema");
const functions = require("../functions/function.js");
// const FunctionOneA = () => {};
const FunctionOneB = () => {};
const FunctionTwooA = () => {};
const FunctionTwooB = () => {};
const handleCallbackQuery = async (bot, msg) => {
  //   console.log(msg);
  const data = JSON.parse(msg.data);
  const chatId = msg.message.chat.id;
  const kanalId = "-1001967326386";
  const botId = "-3223539535442174620";
  const kanalMessageId = msg.message.message_id;
  try {
    if (data.com === "start") {
      try {
        await bot.deleteMessage(chatId, msg.message.message_id);
        functions.changeRegion(bot, chatId);
      } catch (error) {
        console.log(error);
      }
    } else if (data.com === "region") {
      try {
        await bot.deleteMessage(chatId, msg.message.message_id);
        functions
          .updateDriver(
            data.id,
            "shift",
            true,
            "queue",
            true,
            "where",
            data.reg
          )
          .then(async (res) => {
            // console.log("updateDriver log", res);
            functions.sendStopShiftMessage(bot, chatId, data.reg);
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
        await Driver.findOne({ chatId: data.id })
          .then((result) => {
            functions.queueOut(result.where, data.id);
          })
          .catch((err) => {
            console.log(err);
          });

        functions.updateDriver(
          data.id,
          "shift",
          false,
          "queue",
          false,
          "where",
          "all"
        );
        const startShift = "start";
        await bot.sendMessage(chatId, `Smanani boshlaymizmi ?`, {
          reply_markup: JSON.stringify({
            inline_keyboard: [
              [
                {
                  text: "Navbatga qo'yish",
                  callback_data: JSON.stringify({
                    com: startShift,
                    id: data.id,
                  }),
                },
              ],
            ],
          }),
        });
      } catch (error) {
        console.error("Error handling stop command:", error);
      }
    } else if (data.cm === "nor") {
      console.log("bu data", data);
      if (data.vl == "at") {
        if (msg.chat_instance == botId) {
          await bot.deleteMessage(chatId, kanalMessageId);
          await bot.sendMessage(chatId, data.id);

          await Driver.findOneAndUpdate(
            { chatId: chatId },
            {
              $push: { "order.id": data.id },
              $inc: { "order.passengersCount": parseInt(data.ct, 10) },
            },
            { new: true }
          )
            .then(async (res) => {
              const { passengersCount } = res.order;
              try {
                if (passengersCount >= 4) {
                  await Driver.findOne({ chatId: chatId })
                    .then((result) => {
                      const region = result.where;
                      if (region == "fer" || region == "tosh") {
                        functions.queueOut(region, chatId);
                      } else {
                        functions.queueOut("tosh", chatId);
                        functions.queueOut("fer", chatId);
                      }
                    })
                    .catch((err) => {
                      console.log(err);
                    });

                  functions.updateDriver(
                    chatId,
                    "shift",
                    false,
                    "queue",
                    false,
                    "where",
                    "all"
                  );
                  const startShift = "start";
                  await bot.sendMessage(
                    chatId,
                    `Haydovchi sizda yolovchilar soni 3 nafardan o'tdi va siz navbatdan chiqarildingiz. Sizga oqyo'y tilaymiz.`,
                    {
                      reply_markup: JSON.stringify({
                        inline_keyboard: [
                          [
                            {
                              text: "Navbatga qo'yish",
                              callback_data: JSON.stringify({
                                com: startShift,
                                id: chatId,
                              }),
                            },
                          ],
                        ],
                      }),
                    }
                  );
                }
              } catch (error) {
                console.error("Error handling stop command:", error);
              }
            })
            .catch((err) => {
              console.log(err);
            });
        } else {
          console.log(msg);
          console.log(data);
        }
      } else if (data.vl == "nxt") {
        if (msg.chat_instance == botId) {
          await bot.deleteMessage(chatId, kanalMessageId);
          await bot.sendMessage(chatId, data.id);
          FunctionTwooA();
        } else {
          await bot.deleteMessage(kanalId, kanalMessageId);
          await bot.sendMessage(chatId, data.id);
          FunctionTwooB();
        }
      } else if (data.vl == "er") {
        if (msg.chat_instance == botId) {
          await bot.deleteMessage(chatId, kanalMessageId);
          await bot.sendMessage(chatId, data.id);
          FunctionThreeA();
        } else {
          await bot.deleteMessage(kanalId, kanalMessageId);
          await bot.sendMessage(chatId, data.id);
          FunctionThreeB();
        }
      }
    }
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  handleCallbackQuery,
};
