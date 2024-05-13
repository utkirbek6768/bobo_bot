require("dotenv").config();
const Driver = require("../schemas/driver.schema");
const Queue = require("../schemas/queue.schema");
const Order = require("../schemas/order.schema");
const functions = require("../functions/function.js");
const handleCallbackQuery = async (bot, msg) => {
  //   console.log(msg);
  const data = JSON.parse(msg.data);
  const chat_instance = msg.chat_instance;
  const chatId = msg.from.id;
  //   const kanalId = "-1001962113423"; // bu boboni kanali chatId si
  const kanalId = "-1001967326386";
  const adminId = "177482674";

  const kanalMessageId = msg.message.message_id;
  const chatType = msg.message.chat.type; // supergroup, private
  try {
    if (data.com === "start") {
      try {
        await bot.deleteMessage(chatId, msg.message.message_id);
        functions.changeRegion(bot, chatId);
      } catch (error) {
        console.log(error.message);
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
        await bot.deleteMessage(
          chatType != "supergroup" ? chatId : kanalId,
          kanalMessageId
        );
        try {
          const query = {
            chatId: chatId,
          };
          const update = {
            $push: { "order.id": data.id },
            $inc: { "order.passengersCount": parseInt(data.ct, 10) },
          };
          const options = { new: true };
          const res = await Driver.findOneAndUpdate(query, update, options);

          if (res) {
            const { passengersCount } = res.order;
            functions.sendingOrderToDriverOrKanal(
              bot,
              chatId,
              data.id,
              data.vl,
              false,
              msg.from
            );

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
                `<b>Haydovchi sizda yolovchilar soni 3 nafardan o'tdi va siz navbatdan chiqarildingiz.</b>\n\n` +
                  `<b>Sizga oq yo'y tilaymiz.</b>\n\n` +
                  `<i>Eslatma: Agar qaytadan navbatga qo'ysangiz, siz hududga ohirgi bo'lib navbatga qo'yilasiz!</i>`,
                {
                  parse_mode: "HTML",
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
          console.error("Error handling stop command:", error.message);
        }
      } else if (data.vl == "nxt") {
        await bot.deleteMessage(chatId, kanalMessageId);
        try {
          functions.handleNextDriver(bot, msg, data.id, kanalId, chatId);
        } catch (err) {
          console.log(err.message);
        }
      } else if (data.vl == "er") {
        await bot.deleteMessage(
          chatType != "supergroup" ? chatId : msg.message.chat.id,
          kanalMessageId
        );
        functions.sendingOrderToDriverOrKanal(
          bot,
          177482674,
          data.id,
          data.vl,
          true,
          msg.from
        );
      }
    } else if (data.cm === "confirm") {
      if (data.vl === "yes") {
        await bot.deleteMessage(chatId, msg.message.message_id);
        const res = await Driver.findOneAndUpdate(
          { chatId: data.id },
          { $set: { approvedByAdmin: true } },
          { new: true }
        );
        if (res) {
          if (res.approvedByAdmin === true) {
            if (res.carNumber && !res.shift) {
              await functions.sendStartShiftMessage(bot, data.id, res.userName);
            } else if (res.carNumber && res.shift) {
              await functions.sendStopShiftMessage(bot, data.id, res.where);
            } else {
              await functions.sendStopShiftMessage(bot, data.id);
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
      } else if (data.vl === "no") {
        console.log(data.vl, data.id);
        const res = await Driver.findOneAndDelete({ chatId: data.id });
        console.log(res);
      }
    } else if (data.cm === "backOr") {
      await bot.deleteMessage(chatId, msg.message.message_id);
      functions.sendingOrderToChannel(bot, data.id, data.vl);
    } else if (data.cm === "deleteOr") {
      await bot.deleteMessage(chatId, msg.message.message_id);
      const res = await Order.findOneAndDelete({ _id: data.id });
      if (!res) {
        console.log("order o'chirilmadi");
        return;
      }
      await bot.sendMessage(kanalId, `${res._id} kalitli o'rder o'chirildi`);
      console.log(`${res._id} kalitli o'rder o'chirildi`);
    } else {
    }
  } catch (error) {
    console.error(error.message);
  }
};

module.exports = {
  handleCallbackQuery,
};
