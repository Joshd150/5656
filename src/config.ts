process.env.DEPLOYMENT_URL = process.env.DEPLOYMENT_URL || "f678f2751c6a.ngrok-free.app";

if (!process.env.DEPLOYMENT_URL) {
  throw new Error(`Missing Deployment URL for bot, for local this would be localhost:PORT`)
}
export const DEPLOYMENT_URL = process.env.DEPLOYMENT_URL
