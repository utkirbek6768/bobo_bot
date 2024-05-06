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
        `Buyutma berish tugmasi orqali tez va oson buyurtma bering !` +
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
    const res = await Driver.findOne({ chatId: chatId }).select(
      "userName where"
    );
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
      const message = `${res.userName} siz ${
        index + 1
      } - bo'lib ${location} navbatdasiz.`;

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

const createOrder = async (bot, chatId, data, from) => {
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
      phoneNumber: cleanPhone.length > 6 ? "+" + cleanPhone : " Kiritilmagan",
      userName: from.username ? from.username : "",
      passengersChatId: chatId,
      driverChatId: "",
      driverId: "",
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
                  text: "Buyurtmani oldim",
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
                  text: "O'tkazib yuborish",
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
                  text: "Buyurtmada xatolik",
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
                  text: "Buyurtmani oldim",
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
                  text: "Buyurtmada xatolik",
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
            // const { driverPassengersCount } = driver;
            // const totalPassengersCount =
            //   passengersCount + driverPassengersCount;
            if (driver) {
              await bot.sendPhoto(driverChatId, imageOrder, options);
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
    console.log(error);
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
      telegramName: data.userName,
      phoneNumber: `+${data.phoneNumber}`,
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
    const { _id, userName, carNumber, carType, active } = res;
    const resId = _id.toString();

    const options = {
      caption:
        `📩 Haydovchi malumotlari` +
        "\n\n" +
        `📍 Ismi: ${userName}` +
        "\n\n" +
        `📍 Mashina raqami: ${carNumber}` +
        "\n\n" +
        `🚕 Mashina turi: ${carType}` +
        "\n\n" +
        `📦 Haydovchi: ${active ? "Smenada" : "Smenadan tashqarida"}` +
        "\n\n",
      reply_markup: JSON.stringify({
        inline_keyboard: [
          [
            {
              text: "Smenani boshlash",
              callback_data: JSON.stringify({
                com: "start",
                id: resId,
              }),
            },
          ],
        ],
      }),
    };

    await bot.sendPhoto(chatId, imageDriver, options);
    // await bot.sendMessage(
    //   chatId,
    //   'Kanalga elon berish uchun "Post atyorlash" tugmasida foydalaning',
    //   openWebKeyboardDriverPost
    // );
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

const queueDelete = async () => {
  await Queue.updateMany({}, { $pull: { tosh: { chatId: "7005130337" } } });
};
queueDelete();
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

const sendingOrderToDriverOrKanal = async (
  bot,
  chatId,
  data,
  command,
  kanal,
  from
) => {
  const order = await Order.findOne({ _id: data.id });
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
  } = order;

  const options = {
    caption:
      `📩 ${
        command != "at" ? "Yangi buyrtma" : "Buyurtma sizga biriktirildi"
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
                  text: "Buyurtmani oldim",
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
                      text: "O'tkazib yuborish",
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
                  text: "Buyurtmada xatolik",
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

  await bot.sendPhoto(chatId, imageOrder, options);
  // .then(async (sent) => {
  //   const order = await Driver.findOne({ chatId });
  //   if (order) {
  //     console.log(sent);
  //     console.log(from);
  //     console.log(order);
  //     // const nextOrderText =
  //     //   `📩 Buyurtma navbatdagi haydovchi ( ${order.userName} ) ga o'tkazib yuborildi` +
  //     //   "\n\n" +
  //     //   `📍 Qayrerdan: ${
  //     //     orderWhere == "fer" ? "Farg'onadan" : "Toshkentdan"
  //     //   }` +
  //     //   "\n" +
  //     //   `📍 Qayerga: ${whereto == "fer" ? "Farg'onaga" : "Toshkentga"}` +
  //     //   "\n" +
  //     //   `🔢 Yo'lovchilar soni: ${
  //     //     passengersCount ? passengersCount + " ta" : "Kiritilmagan"
  //     //   }` +
  //     //   "\n" +
  //     //   `📦 Pochta: ${delivery ? "Bor" : "Yo'q"}` +
  //     //   "\n" +
  //     //   `✒️ Izoh: ${description.length > 0 ? description : "Kiritilmagan"}` +
  //     //   "\n\n" +
  //     //   `🔑 KEY: ${_id}`;
  //     // await bot.sendMessage(kanalId, nextOrderText);
  //   }
  // })
  // .catch((err) => {
  //   console.log(err);
  // });
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
};
