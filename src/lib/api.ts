const URLS = {
  sendCode: "https://functions.poehali.dev/c61cb09f-8af4-48e5-b9f3-8fbf20994a68",
  verifyCode: "https://functions.poehali.dev/ff8f1ca0-cb99-4308-a5a7-0f81d3852832",
  saveProfile: "https://functions.poehali.dev/ba548b4f-3a42-46cb-9ec5-c084d5d409e4",
};

export const api = {
  sendCode: (telegram_id: number) =>
    fetch(URLS.sendCode, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ telegram_id }),
    }).then(r => r.json()),

  verifyCode: (telegram_id: number, code: string) =>
    fetch(URLS.verifyCode, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ telegram_id, code }),
    }).then(r => r.json()),

  saveProfile: (data: {
    telegram_id: number;
    name: string;
    username: string;
    avatar: string;
    bio: string;
    phone: string;
  }) =>
    fetch(URLS.saveProfile, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(r => r.json()),
};
