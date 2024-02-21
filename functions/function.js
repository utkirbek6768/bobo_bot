const fs = require("fs");
const https = require("https");
const path = require("path");
const Order = require("../schemas/order.schema");
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

const createOrder = async (bot, chatId, data) => {
  try {
    const imageUrl =
      "https://codecapsules.io/wp-content/uploads/2023/07/how-to-create-and-host-a-telegram-bot-on-code-capsules-768x768.png";
    const createOrder = new Order({ ...data });

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

module.exports = {
  loadLanguageFile,
  createOrder,
};
