const fs = require("fs");
const https = require("https");
const path = require("path");
const Order = require("../schemas/order.schema");
const Driver = require("../schemas/driver.schema");
const loadLanguageFile = (language) => {
  //   const filePath = `./i18n/${language}.json`;
  //   try {
  //     const data = fs.readFileSync(filePath, "utf8");
  //     return JSON.parse(data);
  //   } catch (error) {
  //     console.error(`Error loading language file for ${language}:`, error);
  //     return {};
  //   }
};

const createOrder = async (bot, chatId, data, which) => {
  try {
    if (which == "passengers") {
      const imageUrl =
        "https://codecapsules.io/wp-content/uploads/2023/07/how-to-create-and-host-a-telegram-bot-on-code-capsules-768x768.png";
      const createOrder = new Order({ ...data });

      await createOrder
        .save()
        .then(async (res) => {
          const resId = res._id.toString();
          const { where, whereto, passengersCount, delivery, description } =
            res;
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
              `✒️ Izoh: ${
                description.length > 0 ? description : "Kiritilmagan"
              }`,
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
    } else if (which == "drivers") {
      Driver.deleteMany({ chatId: chatId })
        .then((res) => {
          console.log(res.deletedCount + " documents deleted");
        })
        .catch((err) => {
          console.log(err);
        });

      const imageUrl =
        "https://img.freepik.com/premium-psd/isolated-realistic-shiny-metalic-orange-luxury-city-taxi-cab-car-from-right-front-angle-view_16145-9738.jpg";
      const createDriver = new Driver({
        userName: data.userName,
        carNumber: data.carNumber,
        carType: data.carType,
        where: data.where,
        tariff: data.tariff,
        active: data.active,
        chatId: chatId,
      });

      await createDriver
        .save()
        .then(async (res) => {
          const resId = res._id.toString();
          const { userName, carNumber, carType, active } = res;
          const startSmenaOrNext = "SSON";
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
                      com: startSmenaOrNext,
                      ok: true,
                      id: resId,
                    }),
                  },
                  //   {
                  //     text: "O'tkazib yuborish",
                  //     callback_data: JSON.stringify({
                  //       com: startSmenaOrNext,
                  //       ok: false,
                  //       id: resId,
                  //     }),
                  //   },
                ],
              ],
            }),
          };
          await bot.sendPhoto(chatId, imageUrl, options);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  loadLanguageFile,
  createOrder,
};
