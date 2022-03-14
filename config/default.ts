export default {
  frontend_url: process.env.FRONTEND_URL as string,
  port: process.env.PORT as string,
  db_url: process.env.DB_URL as string,
  log_level: "info",
  salt: 10,
  forgot_password_token_secret: process.env.FORGOT_PASSWORD_TOKEN_SECRET,
};
