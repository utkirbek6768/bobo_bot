const fs = require("fs");
const https = require("https");
const path = require("path");
// const functions = require("../function/function.js");

const { LocalStorage } = require("node-localstorage");
const localStorage = new LocalStorage("./scratch");

const langCode = "uz";
// const lang = functions.loadLanguageFile(langCode);

// setInterval(() => {
//   langCode.value = localStorage.getItem("lang") || "uz";
// }, 5000);

const remove = {
  reply_markup: {
    remove_keyboard: true,
  },
};

const openWebKeyboard = {
  reply_markup: {
    resize_keyboard: true,
    one_time_keyboard: true,
    keyboard: [
      [
        {
          text: "Buyurtma berish",
          web_app: {
            url: "https://bobomurodsite.netlify.app/",
          },
        },
      ],
      [
        {
          text: "Ro'yxatdan o'tish",
          web_app: {
            url: "https://bobomurodsite.netlify.app/driver",
          },
        },
      ],
    ],
  },
};

// ---------------------------------------------------------------

const start = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [
        {
          text: "Ro'yhatdan o'tish",
          callback_data: JSON.stringify({
            command: "start",
            value: "sendSms",
          }),
        },
      ],
    ],
  }),
};

module.exports = {
  start,
  remove,
  openWebKeyboard,
};
