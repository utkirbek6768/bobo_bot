const fs = require("fs");
const https = require("https");
const path = require("path");
const Order = require("../schemas/order.schema");
const Driver = require("../schemas/driver.schema");
const Passenger = require("../schemas/passenger.schema");

const sendWelcomeMessage = async (bot, chatId) => {
  try {
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
    console.error("Error sending welcome message:", err);
  }
};

const sendStartShiftMessage = async (bot, chatId, userName, driverId) => {
  const startShift = "start";
  await bot.sendMessage(
    chatId,
    `Assalomu alaykum ${userName} xush kelibsiz` +
      "\n\n" +
      `Smanani boshlaymizmi ?`,
    {
      reply_markup: JSON.stringify({
        inline_keyboard: [
          [
            {
              text: "Smanani boshlash",
              callback_data: JSON.stringify({
                com: startShift,
                id: driverId,
              }),
            },
          ],
        ],
      }),
    }
  );
};

const sendStopShiftMessage = async (bot, chatId, driverId) => {
  const res = await Driver.findOne({ _id: driverId });
  console.log(res);

  const stopShift = "stop";
  const outQueue = "out";
  await bot.sendMessage(
    chatId,
    `${res.userName} siz ${
      res.userName != null ? res.queueIndex : "0"
    } bo'lib ${res.where === "fer" ? "Farg'onaga" : "Toshkentga"} navbatdasiz`,
    {
      reply_markup: JSON.stringify({
        inline_keyboard: [
          [
            {
              text: "Smanani to'xtatish",
              callback_data: JSON.stringify({
                com: stopShift,
                id: driverId,
              }),
            },
          ],
        ],
      }),
    }
  );
};

const changeRegion = async (bot, chatId, driverId) => {
  await bot.sendMessage(chatId, "Qaysi hududan buyurtma olishni tanlang", {
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [
          {
            text: "Farg'onaga",
            callback_data: JSON.stringify({
              com: "region",
              reg: "fer",
              id: driverId,
            }),
          },
        ],
        [
          {
            text: "Toshkentdan",
            callback_data: JSON.stringify({
              com: "region",
              reg: "tosh",
              id: driverId,
            }),
          },
        ],
      ],
    }),
  });
};

const createOrder = async (bot, chatId, data) => {
  try {
    const imageUrl =
      "https://codecapsules.io/wp-content/uploads/2023/07/how-to-create-and-host-a-telegram-bot-on-code-capsules-768x768.png";
    const createOrder = new Order({
      where: data.where,
      whereto: data.whereto,
      passengersCount: data.passengersCount,
      delivery: data.delivery,
      description: data.description,
      orderStatus: data.orderStatus,
      passengersChatId: chatId,
      driverChatId: "",
      driverId: "",
    });

    await createOrder
      .save()
      .then(async (res) => {
        const resId = res._id.toString();
        const { where, whereto, passengersCount, delivery, description } = res;
        const options = {
          caption:
            `📩 Yangi buyrtma` +
            "\n\n" +
            `📍 Qayrerdan: ${
              where == "fergana" ? "Farg'onadan" : "Toshkentdan"
            }` +
            "\n\n" +
            `📍 Qayerga: ${
              whereto == "fergana" ? "Farg'onaga" : "Toshkentga"
            }` +
            "\n\n" +
            `🔢 Yo'lovchilar soni: ${passengersCount} ta` +
            "\n\n" +
            `📦 Pochta: ${delivery ? "Bor" : "Yo'q"}` +
            "\n\n" +
            `✒️ Izoh: ${description.length > 0 ? description : "Kiritilmagan"}`,
          reply_markup: JSON.stringify({
            inline_keyboard: [
              [
                {
                  text: "Buyurtmani oldim",
                  callback_data: JSON.stringify({
                    com: "newOrder",
                    ok: true,
                    id: resId,
                  }),
                },
                {
                  text: "O'tkazib yuborish",
                  callback_data: JSON.stringify({
                    com: "newOrder",
                    ok: false,
                    id: resId,
                  }),
                },
              ],
            ],
          }),
        };
        await bot.sendPhoto(chatId, imageUrl, options);
      })
      .catch((err) => {
        console.log(err);
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
    console.log(res);
  } catch (error) {
    console.error("Error updating order:", error);
  }
};

const createDriver = async (bot, chatId, data) => {
  try {
    await Driver.deleteMany({ chatId: chatId });

    const imageUrl =
      "https://img.freepik.com/premium-psd/isolated-realistic-shiny-metalic-orange-luxury-city-taxi-cab-car-from-right-front-angle-view_16145-9738.jpg";
    const createDriver = new Driver({
      userName: data.userName,
      carNumber: data.carNumber,
      carType: data.carType,
      where: data.where,
      tariff: data.tariff,
      shift: data.shift,
      queue: data.queue,
      queueIndex: data.queueIndex,
      active: data.active,
      chatId: chatId,
    });

    const res = await createDriver.save();
    const resId = res._id.toString();
    const { userName, carNumber, carType, active } = res;

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
                com: "startShift",
                id: resId,
              }),
            },
          ],
        ],
      }),
    };

    await bot.sendPhoto(chatId, imageUrl, options);
  } catch (error) {
    console.log(error);
  }
};

const updateDriver = async (
  bot,
  driverId,
  item1,
  value1,
  item2,
  value2,
  item3,
  value3
) => {
  try {
    const updateFields = { [item1]: value1, [item2]: value2, [item3]: value3 };
    const res = await Driver.findOneAndUpdate(
      { _id: driverId },
      { $set: updateFields },
      { new: true }
    );
    return res;
  } catch (error) {
    console.error("Error updating order:", error);
  }
};

const createPassenger = () => {
  const createPassenger = new Passenger({
    userName: "",
    phoneNumber: "",
    chatId: "",
  });
};

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
};
