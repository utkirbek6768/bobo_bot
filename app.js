const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
const TelegramBot = require("node-telegram-bot-api");

// Importing custom modules
const { handleMessage } = require("./modules/messageHandler");
const {
  StartCommand,
  driverRegister,
} = require("./modules/startCommandHandler");

const { handleCallbackQuery } = require("./modules/callbackQueryHandler");
const functions = require("./functions/function");
const mongoose = require("mongoose");
const { log } = require("console");

// Creating Express app
const app = express();

// Using body-parser middleware
app.use(bodyParser.json());

// Setting up Telegram bot
// const TelegramBotToken = process.env.BOT_TOKEN;
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

bot.setMyCommands([{ command: "/start", description: "Start" }]);

// Handling messages, callback queries, and commands
bot.on("message", async (msg) => handleMessage(bot, msg));
bot.on("callback_query", async (msg) => handleCallbackQuery(bot, msg));
bot.onText(/\/start/, async (msg) => StartCommand(bot, msg));
bot.onText(/\/Haydovchiman/, async (msg) => driverRegister(bot, msg));

bot.on("web_app_data", async (msg) => {
  try {
    if (msg.web_app_data && msg.web_app_data.data) {
      const data = JSON.parse(msg.web_app_data.data);
      const button = JSON.parse(msg.web_app_data.button_text);
      const chatId = msg.chat.id;
      const fromId = msg.from.id;
      console.log(data);
      if (data && button == "Buyurtma berish") {
        console.log(msg);
        functions.createOrder(bot, chatId, data);
      }
    } else {
      console.error("web_app_data is missing in the message.");
    }
  } catch (error) {
    console.error("Error handling web_app_data event:", error);
  }
});

// Starting HTTP server
const port = process.env.PORT || 4100;
const server = http.createServer(app);
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
