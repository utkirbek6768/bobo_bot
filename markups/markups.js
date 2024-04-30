const remove = {
  reply_markup: {
    remove_keyboard: true,
  },
};
const url = "https://bobomurodsite.netlify.app/";
const openWebKeyboardPassengers = {
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
    ],
  },
};

const openWebKeyboardDriver = {
  reply_markup: {
    resize_keyboard: true,
    one_time_keyboard: true,
    keyboard: [
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

const openWebKeyboardDriverPost = {
  reply_markup: {
    resize_keyboard: true,
    one_time_keyboard: true,
    keyboard: [
      [
        {
          text: "Anketa yaratish",
          web_app: {
            url: "https://bobomurodsite.netlify.app/createpost",
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
  openWebKeyboardPassengers,
  openWebKeyboardDriver,
  openWebKeyboardDriverPost,
};
