const fs = require("fs");
const https = require("https");
const path = require("path");
const Order = require("../schemas/order.schema");
const Driver = require("../schemas/driver.schema");
const Queue = require("../schemas/queue.schema");
const Passenger = require("../schemas/passenger.schema");
const {
  remove,
  start,
  openWebKeyboardPassengers,
  openWebKeyboardDriver,
  openWebKeyboardDriverPost,
} = require("../markups/markups");

const kanalId = "-1001967326386";
const adminId = "177482674";
// const infoGroupChatId = "-1002104497635";
const infoGroupChatId = "-1001967326386";

// const imageOrder = "./images/order.jpg";
// const imageDriver = "./images/driver_car.jpg";

const imageOrder =
  "https://qph.cf2.quoracdn.net/main-qimg-b8c260dba266ea341bef10b4e338c0fe-pjlq";
const imageDriver =
  "https://img.freepik.com/premium-psd/isolated-realistic-shiny-metalic-orange-luxury-city-taxi-cab-car-from-right-front-angle-view_16145-9738.jpg";

const sendWelcomeMessage = async (bot, chatId) => {
  try {
    await bot.sendMessage(
      chatId,
      `Assalomu alaykum dispatcher botga xush kelibsiz` +
        "\n\n" +
        `Buyutma berish tugmasi orqali tez va oson buyurtma bering! 👇` +
        "\n\n",
      openWebKeyboardPassengers
    );
  } catch (err) {
    console.error("Error sending welcome message:", err);
  }
};

const sendStartShiftMessage = async (bot, chatId, userName) => {
  const startShift = "start";
  await bot.sendMessage(
    chatId,
    `Assalomu alaykum ${userName} xush kelibsiz` +
      "\n\n" +
      `Ishni boshlaymizmi ?`,
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
};

const sendStopShiftMessage = async (bot, chatId, region) => {
  try {
    const res = await Driver.findOne({ chatId: chatId });
    const queue = await Queue.findOne({}, region);

    if (!res) {
      console.log("Driver not found with chat ID:", chatId);
      return;
    }

    if (!queue || !queue[region]) {
      console.log("Queue not found or empty for region:", region);
      return;
    }

    const index = queue[region].findIndex(
      (element) => element.chatId == chatId
    );
    if (index >= 0) {
      const stopShift = "stop";
      const location = res.where === "fer" ? "Farg'onada" : "Toshkentda";
      const message =
        `${res.userName} siz ${index + 1} - bo'lib ${location} navbatdasiz.` +
        "\n\n" +
        `Hozirda sizda ${JSON.stringify(
          res.order.passengersCount
        )} ta yo'lovchi bor.`;

      await bot.sendMessage(chatId, message, {
        reply_markup: JSON.stringify({
          inline_keyboard: [
            [
              {
                text: "Navbatdan chiqish",
                callback_data: JSON.stringify({ com: stopShift, id: chatId }),
              },
            ],
          ],
          resize_keyboard: true,
        }),
      });
    } else {
      console.log("Chat ID not found in the queue for region:", region);
    }
  } catch (error) {
    console.log("Error:", error);
  }
};

const changeRegion = async (bot, chatId) => {
  try {
    await bot.sendMessage(chatId, "Qaysi hududan buyurtma olishni tanlang", {
      reply_markup: JSON.stringify({
        inline_keyboard: [
          [
            {
              text: "Farg'onaga",
              callback_data: JSON.stringify({
                com: "region",
                reg: "fer",
                id: chatId,
              }),
            },
          ],
          [
            {
              text: "Toshkentdga",
              callback_data: JSON.stringify({
                com: "region",
                reg: "tosh",
                id: chatId,
              }),
            },
          ],
        ],
      }),
    });
  } catch (error) {
    console.log(error);
  }
};

const createOrder = async (bot, msg, chatId, data, from) => {
  try {
    const cleanPhone = data.phoneNumber.toString().replace(/[\s\+]/g, "");
    const {
      where,
      whereto,
      passengersCount,
      delivery,
      description,
      orderStatus,
    } = data;
    const createOrder = new Order({
      where: where,
      whereto: whereto,
      passengersCount: passengersCount,
      delivery: delivery,
      description: description.length > 0 ? description : "Kiritilmagan",
      orderStatus: orderStatus,
      phoneNumber: `+${cleanPhone}`,
      userName: from.username ? from.username : "",
      passengersChatId: chatId,
      driverChatId: "",
      driverId: "",
      messageId: "",
    });

    await createOrder
      .save()
      .then(async (res) => {
        const resId = res._id.toString();
        const newOrder = "nor";
        const next = "nxt";
        const acceptance = "at";
        const error = "er";
        const {
          where,
          whereto,
          passengersCount,
          delivery,
          description,
          phoneNumber,
          userName,
        } = res;
        const options = {
          caption:
            `📩 Yangi buyrtma` +
            "\n\n" +
            `📍 Qayrerdan: ${where == "fer" ? "Farg'onadan" : "Toshkentdan"}` +
            "\n\n" +
            `📍 Qayerga: ${whereto == "fer" ? "Farg'onaga" : "Toshkentga"}` +
            "\n\n" +
            `🔢 Yo'lovchilar soni: ${
              passengersCount ? passengersCount + " ta" : "Kiritilmagan"
            }` +
            "\n\n" +
            `📦 Pochta: ${delivery ? "Bor" : "Yo'q"}` +
            "\n\n" +
            `✒️ Izoh: ${
              description.length > 0 ? description : "Kiritilmagan"
            }` +
            "\n\n" +
            `☎️ Telefon: ${phoneNumber}` +
            "\n\n" +
            `📲 Telegram: @${userName}`,
          reply_markup: JSON.stringify({
            inline_keyboard: [
              [
                {
                  text: "✅Buyurtmani oldim",
                  callback_data: JSON.stringify({
                    cm: newOrder,
                    vl: acceptance,
                    id: resId,
                    ct: passengersCount,
                  }),
                },
              ],
              [
                {
                  text: "⏭O'tkazib yuborish",
                  callback_data: JSON.stringify({
                    cm: newOrder,
                    vl: next,
                    id: resId,
                    ct: passengersCount,
                  }),
                },
              ],
              [
                {
                  text: "❌Buyurtmada xatolik",
                  callback_data: JSON.stringify({
                    cm: newOrder,
                    vl: error,
                    id: resId,
                    ct: passengersCount,
                  }),
                },
              ],
            ],
          }),
        };

        const optionsForKanal = {
          caption:
            `📩 Yangi buyrtma` +
            "\n\n" +
            `📍 Qayrerdan: ${where == "fer" ? "Farg'onadan" : "Toshkentdan"}` +
            "\n\n" +
            `📍 Qayerga: ${whereto == "fer" ? "Farg'onaga" : "Toshkentga"}` +
            "\n\n" +
            `🔢 Yo'lovchilar soni: ${
              passengersCount ? passengersCount + " ta" : "Kiritilmagan"
            }` +
            "\n\n" +
            `📦 Pochta: ${delivery ? "Bor" : "Yo'q"}` +
            "\n\n" +
            `✒️ Izoh: ${
              description.length > 0 ? description : "Kiritilmagan"
            }` +
            "\n\n" +
            `☎️ Telefon: ${phoneNumber}` +
            "\n\n" +
            `📲 Telegram: @${userName}`,
          reply_markup: JSON.stringify({
            inline_keyboard: [
              [
                {
                  text: "✅Buyurtmani oldim",
                  callback_data: JSON.stringify({
                    cm: newOrder,
                    vl: acceptance,
                    id: resId,
                    ct: passengersCount,
                  }),
                },
              ],
              [
                {
                  text: "❌Buyurtmada xatolik",
                  callback_data: JSON.stringify({
                    cm: newOrder,
                    vl: error,
                    id: resId,
                    ct: passengersCount,
                  }),
                },
              ],
            ],
          }),
        };

        const queue = await Queue.findOne({});

        if (queue[where].length > 0) {
          try {
            const driverChatId = queue[where][0].chatId;
            const driver = await Driver.findOne({ chatId: driverChatId });

            if (driver) {
              const { order, userName } = driver;
              const totalPassengersCount =
                Number(passengersCount) +
                (order ? Number(order.passengersCount) : 0);
              if (totalPassengersCount > 4) {
                handleNextDriver(bot, msg, res._id, kanalId, chatId);
              } else {
                await bot.sendPhoto(driverChatId, imageOrder, options);
                const newOrderText =
                  `♻️ Yangi buyurtma ( ${userName} ) ga tashlab berildi` +
                  "\n\n" +
                  `📍 Qayrerdan: ${
                    where == "fer" ? "Farg'onadan" : "Toshkentdan"
                  }` +
                  "\n" +
                  `📍 Qayerga: ${
                    whereto == "fer" ? "Farg'onaga" : "Toshkentga"
                  }` +
                  "\n" +
                  `🔢 Yo'lovchilar soni: ${
                    passengersCount ? passengersCount + " ta" : "Kiritilmagan"
                  }` +
                  "\n" +
                  `📦 Pochta: ${delivery ? "Bor" : "Yo'q"}` +
                  "\n" +
                  `✒️ Izoh: ${
                    description.length > 0 ? description : "Kiritilmagan"
                  }` +
                  "\n\n" +
                  `🔑 KEY: ${resId}`;
                const infoRes = await bot.sendMessage(
                  infoGroupChatId,
                  newOrderText
                );
                if (!infoRes) {
                  console.log("infoRes erroe");
                }
                // console.log("infoRes", infoRes);
                updateOrder(
                  bot,
                  driver._id,
                  resId,
                  "messageId",
                  infoRes.message_id
                );
              }
            }

            await bot.sendMessage(
              chatId,
              "Buyurtmangiz uchun raxmat, tez orada haydovchilarimiz sizbilan bog'lanishadi."
            );
          } catch (error) {
            console.log(error);
          }
        } else {
          await bot.sendMessage(
            chatId,
            "Buyurtmangiz uchun raxmat, tez orada haydovchilarimiz sizbilan bog'lanishadi."
          );
          await bot.sendPhoto(kanalId, imageOrder, optionsForKanal);
        }
      })
      .catch((err) => {
        console.log(err.message);
      });
  } catch (error) {
    console.log(error.message);
  }
};

const updateOrder = async (bot, driverId, orderId, item, value) => {
  try {
    const updateFields = { [item]: value };
    const res = await Order.findOneAndUpdate(
      { _id: orderId },
      { $set: updateFields },
      { new: true }
    );
  } catch (error) {
    console.error("Error updating order:", error);
  }
};

const createDriver = async (bot, chatId, data, from) => {
  try {
    await Driver.deleteMany({ chatId: chatId });

    const createDriver = new Driver({
      userName: data.userName,
      telegramName: "",
      phoneNumber: `${data.phoneNumber}`,
      carNumber: data.carNumber,
      carType: data.carType,
      tariff: data.tariff,
      shift: data.shift,
      queue: data.queue,
      where: data.where,
      queueIndex: data.queueIndex,
      active: data.active,
      chatId: chatId,
      order: {
        id: [],
        passengersCount: 0,
      },
    });

    const res = await createDriver.save();
    const {
      _id,
      userName,
      telegramName,
      phoneNumber,
      carNumber,
      carType,
      active,
    } = res;
    // const resId = _id.toString();

    const options = {
      caption:
        `📩 Yangi haydovchi mavjud uni tasdiqlaysizmi?` +
        "\n\n" +
        `📍 Ismi: ${userName}` +
        "\n" +
        `📍 Tell: ${phoneNumber}` +
        "\n" +
        `📍 Telegram: ${telegramName ? telegramName : "kiritilmagan"}` +
        "\n" +
        `📍 Mashina raqami: ${carNumber}` +
        "\n" +
        `🚕 Mashina turi: ${carType}` +
        "\n",
      reply_markup: JSON.stringify({
        inline_keyboard: [
          [
            {
              text: "✅Tasdiqlash",
              callback_data: JSON.stringify({
                cm: "confirm",
                vl: "yes",
                id: res.chatId,
              }),
            },
            {
              text: "❌Bekor qilish",
              callback_data: JSON.stringify({
                cm: "confirm",
                vl: "no",
                id: res.chatId,
              }),
            },
          ],
        ],
      }),
    };

    await bot.sendPhoto(adminId, imageDriver, options);
    // await bot.sendPhoto(chatId, imageDriver, options);
    bot.sendMessage(
      chatId,
      "Arizangiz muvofaqqiyatli yaratildi admin tasdiqlagandan so'ng ishni boshlashingiz mumkin."
    );
  } catch (error) {
    console.log(error);
  }
};

const updateDriver = async (
  chatId,
  item1,
  value1,
  item2,
  value2,
  item3,
  region
) => {
  try {
    const updateFields = { [item1]: value1, [item2]: value2, [item3]: region };
    const res = await Driver.findOneAndUpdate(
      { chatId: chatId },
      { $set: updateFields },
      { new: true }
    );
    if (res) {
      const queueRemove = await Queue.findOneAndUpdate(
        {},
        {
          $pull: { [region]: { chatId: chatId } },
        },
        { new: true }
      );
      if (queueRemove) {
        const queueUpdate = await Queue.findOneAndUpdate(
          {},
          {
            $push: { [region]: { chatId: chatId } },
          },
          { new: true }
        );
        if (queueUpdate) {
          //   console.log("BU queueUpdate ==>", queueUpdate);
        } else {
          console.log("Error updating queue");
          return null;
        }
      }
    } else {
      console.log("Error updating driver");
      return null;
    }
  } catch (error) {
    console.error("Error updating order:", error);
    return null;
  }
};

const queueOut = async (region, chatId) => {
  try {
    const queueUpdate = await Queue.findOneAndUpdate(
      {},
      { $pull: { [region]: { chatId: chatId } } },
      { new: true }
    );
    return queueUpdate;
  } catch (error) {
    console.log(error);
  }
};

const createPassenger = () => {
  const passenger = new Passenger({
    userName: "",
    phoneNumber: "",
    chatId: "",
  });
};

// const queueDelete = async () => {
//   await Queue.updateMany({}, { $pull: { tosh: { chatId: "7005130337" } } });
// };
// queueDelete();
const deleteOldOrders = async () => {
  try {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const result = await Order.deleteMany({ createdAt: { $lt: threeDaysAgo } });
    console.log(`${result.deletedCount} orders deleted`);
  } catch (error) {
    console.error("Error deleting orders:", error);
  }
};

const handleNextDriver = async (bot, msg, orderId, kanalId, chatId) => {
  try {
    const driver = await Driver.findOne({ chatId: chatId });
    if (!driver) {
      console.log("Driver not found");
      return;
    }
    const where = driver.where;
    const queue = await Queue.findOne({});
    if (!queue) {
      console.log("Queue is empty");
      return;
    }
    const items = queue[where];
    const driverIndex = items.findIndex((item) => item.chatId == chatId);
    if (driverIndex === -1) {
      console.log("Driver not found in queue");
      return;
    }
    const nextIndex = driverIndex + 1 < items.length ? driverIndex + 1 : null;
    if (nextIndex != null) {
      const nextDriverChatId = items[nextIndex].chatId;
      if (!nextDriverChatId) {
        console.log("Next driver chat ID not found");
        return;
      }
      sendingOrderToDriverOrKanal(
        bot,
        nextDriverChatId,
        orderId,
        "nxt",
        false,
        msg.from
      );
    } else {
      sendingOrderToDriverOrKanal(bot, kanalId, orderId, "nxt", true, msg.from);
    }
  } catch (err) {
    console.error(err.message);
    console.log(err);
  }
};

const sendingOrderToDriverOrKanal = async (
  bot,
  chatId,
  orderId,
  command,
  kanal,
  from
) => {
  try {
    const order = await Order.findOne({ _id: orderId });
    if (!order) {
      console.log("Order not found");
      return;
    }

    const {
      _id,
      where: orderWhere,
      whereto,
      passengersCount,
      delivery,
      description,
      phoneNumber,
      messageId,
    } = order;

    const options = {
      caption:
        `${
          command == "at"
            ? "Buyurtma sizga biriktirildi."
            : command == "er"
            ? "❌ Buyurtmada xatolik."
            : "📩 Yangi buyrtma"
        }` +
        "\n\n" +
        `📍 Qayrerdan: ${orderWhere == "fer" ? "Farg'onadan" : "Toshkentdan"}` +
        "\n\n" +
        `📍 Qayerga: ${whereto == "fer" ? "Farg'onaga" : "Toshkentga"}` +
        "\n\n" +
        `🔢 Yo'lovchilar soni: ${
          passengersCount ? passengersCount + " ta" : "Kiritilmagan"
        }` +
        "\n\n" +
        `📦 Pochta: ${delivery ? "Bor" : "Yo'q"}` +
        "\n\n" +
        `✒️ Izoh: ${description.length > 0 ? description : "Kiritilmagan"}` +
        "\n\n" +
        `☎️ Telefon: ${phoneNumber}` +
        "\n\n" +
        `📲 Telegram: @${from.username ? from.username : ""}`,
      reply_markup: JSON.stringify({
        inline_keyboard:
          (command != "at") | (command == "er")
            ? [
                [
                  {
                    text: "✅ Buyurtmani oldim",
                    callback_data: JSON.stringify({
                      cm: "nor",
                      vl: "at",
                      id: order._id.toString(),
                      ct: passengersCount,
                    }),
                  },
                ],
                kanal
                  ? []
                  : [
                      {
                        text: "⏭ O'tkazib yuborish",
                        callback_data: JSON.stringify({
                          cm: "nor",
                          vl: "nxt",
                          id: order._id.toString(),
                          ct: passengersCount,
                        }),
                      },
                    ],
                [
                  {
                    text: "❌ Buyurtmada xatolik",
                    callback_data: JSON.stringify({
                      cm: "nor",
                      vl: "er",
                      id: order._id.toString(),
                      ct: passengersCount,
                    }),
                  },
                ],
              ]
            : [],
      }),
    };

    await bot
      .sendPhoto(chatId, imageOrder, options)
      .then(async (sent) => {
        const driver = await Driver.findOne({ chatId });
        if (driver) {
          const nextOrderText =
            `${
              command === "nxt"
                ? `♻️ Buyurtma navbatdagi haydovchi ( ${driver.userName}: ${
                    driver.telegramName
                      ? driver.telegramName
                      : driver.phoneNumber
                  } ) ga o'tkazib yuborildi`
                : command === "at"
                ? `✅ Buyurtmani  ( ${driver.userName}: ${
                    driver.telegramName
                      ? driver.telegramName
                      : driver.phoneNumber
                  } ) qabul qildi`
                : "❌ Ushbu buyurtmada xatolik aniqlandi va adminga yuborildi"
            }` +
            "\n\n" +
            `📍 Qayrerdan: ${
              orderWhere == "fer" ? "Farg'onadan" : "Toshkentdan"
            }` +
            "\n" +
            `📍 Qayerga: ${whereto == "fer" ? "Farg'onaga" : "Toshkentga"}` +
            "\n" +
            `🔢 Yo'lovchilar soni: ${
              passengersCount ? passengersCount + " ta" : "Kiritilmagan"
            }` +
            "\n" +
            `📦 Pochta: ${delivery ? "Bor" : "Yo'q"}` +
            "\n" +
            `✒️ Izoh: ${
              description.length > 0 ? description : "Kiritilmagan"
            }` +
            "\n\n" +
            `🔑 KEY: ${_id}`;
          if (!kanal) {
            const infoRes = await bot.sendMessage(
              infoGroupChatId,
              nextOrderText
            );
            if (!infoRes) {
              console.log("infoRes erroe");
            }
            // console.log("infoRes", infoRes);
            updateOrder(
              bot,
              driver._id,
              order._id,
              "messageId",
              infoRes.message_id
            );
            await bot.deleteMessage(infoGroupChatId, messageId);
          } else {
            try {
              await bot.deleteMessage(infoGroupChatId, messageId);
            } catch (error) {
              console.log(error.message);
            }
          }
        }
      })
      .catch((err) => {
        console.log(err.message);
      });
  } catch (error) {
    console.error(error.message);
  }
};

// ========bu eski orderlani o'chirish uchun============
const checkAndDeleteOrders = async () => {
  const currentDate = new Date();
  if (currentDate.getHours() === 0 && currentDate.getMinutes() === 0) {
    await deleteOldOrders();
  }
};
checkAndDeleteOrders();
setInterval(checkAndDeleteOrders, 60 * 1000);
// ========eski orderlani o'chirish tugadi============

module.exports = {
  createOrder,
  createDriver,
  updateOrder,
  updateDriver,
  createPassenger,
  sendStartShiftMessage,
  sendStopShiftMessage,
  sendWelcomeMessage,
  changeRegion,
  queueOut,
  sendingOrderToDriverOrKanal,
  handleNextDriver,
};
