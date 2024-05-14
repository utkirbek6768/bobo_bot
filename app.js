const fs = require("fs");
const http = require("http");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const mongoose = require("mongoose");

// Importing custom modules

const functions = require("./functions/function");
const { handleMessage } = require("./modules/messageHandler");
const { handleCallbackQuery } = require("./modules/callbackQueryHandler");
const {
  StartCommand,
  driverRegister,
} = require("./modules/startCommandHandler");

const app = express();

app.use(bodyParser.json());

const TEST_BOT_TOKEN = "6658866622:AAFBGrkHNXsnWdlGkNqYn_qAQmmiYT9w2TI";
const TelegramBotToken = "6302856184:AAFr7Wan3KQJlg0d3DLiCZZ6keAuT6zZU98";
const bot = new TelegramBot(TelegramBotToken, { polling: true });

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("DB connected!");
  })
  .catch(() => {
    console.log("DB connection error: ");
  });

bot.setMyCommands([
  { command: "/start", description: "Start" },
  {
    command: "/new_driver",
    description: "Ro'yxatdan o'tish",
  },
  {
    command: "/status",
    description: "Mening holatim",
  },
]);

bot.on("message", async (msg) => handleMessage(bot, msg));
bot.on("callback_query", async (msg) => handleCallbackQuery(bot, msg));
bot.onText(/\/start/, async (msg) => StartCommand(bot, msg));
bot.onText(/\/Haydovchiman/, async (msg) => driverRegister(bot, msg));
bot.on("web_app_data", async (msg) => {
  //   console.log("bu web_app_data", msg);
  try {
    if (msg.web_app_data && msg.web_app_data.data) {
      const data = JSON.parse(msg.web_app_data.data);
      const button = msg.web_app_data.button_text;
      const chatId = msg.chat.id;
      if (data && button == "Buyurtma berish") {
        functions.createOrder(bot, msg, chatId, data, msg.from);
      } else if (data && button == "Ro'yxatdan o'tish") {
        functions.createDriver(bot, chatId, data, msg.from);
      } else if (data && button == "Anketa yaratish") {
        const lines = data.caption.split("\n\n");
        const obj = {};
        lines.slice(1).forEach((line) => {
          const [key, value] = line.split(": ");
          obj[key.replace(/📩|📍|🚕/g, "").trim()] = value.trim();
        });
        if (data.photo && data.photo.length > 0) {
          const photo = data.photo[data.photo.length - 1];
          const file = await bot.getFile(photo.file_id);
          const fileUrl = `https://api.telegram.org/file/bot${TelegramBotToken}/${file.file_path}`;
          const imagesFolderPath = path.join(__dirname, "image");
          if (!fs.existsSync(imagesFolderPath)) {
            fs.mkdirSync(imagesFolderPath);
          }
          const response = await axios.get(fileUrl, { responseType: "stream" });
          const filePath = path.join(imagesFolderPath, `${file.file_id}.jpg`);
          const writer = fs.createWriteStream(filePath);
          response.data.pipe(writer);
          await new Promise((resolve, reject) => {
            writer.on("finish", resolve);
            writer.on("error", reject);
          });

          await bot.sendPhoto(data.chat.id, filePath, {
            caption: JSON.stringify(obj, null, 2),
          });

          console.log(`Image downloaded and saved to ${filePath}`);
          console.log(obj.Ismi);
        }
      } else if (data && button == "Exprement") {
        console.log("this Exprement data", data);
      }
    } else {
      console.error("web_app_data is missing in the message.");
    }
  } catch (error) {
    console.error("Error handling web_app_data event:", error);
  }
});

const port = process.env.PORT || 4100;
const server = http.createServer(app);
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
