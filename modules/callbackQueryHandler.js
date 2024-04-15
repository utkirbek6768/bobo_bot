require("dotenv").config();
const Driver = require("../schemas/driver.schema");
const functions = require("../functions/function.js");
// const FunctionOneA = () => {};
const FunctionOneB = () => {};
const FunctionTwooA = () => {};
const FunctionTwooB = () => {};
const handleCallbackQuery = async (bot, msg) => {
  const data = JSON.parse(msg.data);
  const chat_instance = msg.chat_instance;
  const chatId = msg.message.chat.id;
  const fromChatId = msg.from.id;
  //   const kanalId = "-1001967326386";
  const adminId = "177482674";
  const kanalId = "261802641235886719";
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
            functions.sendStopShiftMessage(bot, chatId, data.reg);
            await Driver.findOneAndUpdate(
              { chatId: chatId },
              { $set: { "order.id": [], "order.passengersCount": 0 } },
              { new: true }
            );
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
      if (data.vl == "at") {
        await bot.deleteMessage(chatId, kanalMessageId);
        await bot.sendMessage(chatId, data.id);

        try {
          const query = {
            chatId: chat_instance == kanalId ? fromChatId : chatId,
          };
          const update = {
            $push: { "order.id": data.id },
            $inc: { "order.passengersCount": parseInt(data.ct, 10) },
          };
          const options = { new: true };
          const res = await Driver.findOneAndUpdate(query, update, options);

          if (res) {
            const { passengersCount } = res.order;

            if (passengersCount >= 4) {
              const result = await Driver.findOne({ chatId: query.chatId });
              const region = result.where;

              if (region == "fer" || region == "tosh") {
                functions.queueOut(region, query.chatId);
              } else {
                functions.queueOut("tosh", query.chatId);
                functions.queueOut("fer", query.chatId);
              }

              functions.updateDriver(
                query.chatId,
                "shift",
                false,
                "queue",
                false,
                "where",
                "all"
              );

              const startShift = "start";
              await bot.sendMessage(
                query.chatId,
                `Haydovchi sizda yolovchilar soni 3 nafardan o'tdi va siz navbatdan chiqarildingiz. Sizga oqyo'y tilaymiz.` +
                  "\n" +
                  "Eslatma: Agar qaytadan navbatga qo'ysangiz sizdagi barcha buyurtmalar olib tashlanadi shuning uchun buyurtmalarni bajargandan so'ng navbatga qo'ying!",
                {
                  reply_markup: JSON.stringify({
                    inline_keyboard: [
                      [
                        {
                          text: "Navbatga qo'yish",
                          callback_data: JSON.stringify({
                            com: startShift,
                            id: query.chatId,
                          }),
                        },
                      ],
                    ],
                  }),
                }
              );
            }
          } else {
            await bot.sendMessage(
              query.chatId,
              "Driver.findOneAndUpdate da qanadaydur hatolik yuz berdi"
            );
          }
        } catch (error) {
          console.error("Error handling stop command:", error);
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
          await bot.sendMessage(adminId, data.id);
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
