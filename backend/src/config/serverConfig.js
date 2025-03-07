import dotenv from 'dotenv';
dotenv.config();

const ServerConfig = {
  PORT: process.env.PORT,
  DB_URL: process.env.DB_URL,
};

export default ServerConfig;
