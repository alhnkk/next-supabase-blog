import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL!,

  logger: {
    level: "debug",
    disabled: process.env.NODE_ENV === "production",
  },

  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    sendEmailVerificationOnSignUp: false,
    minPasswordLength: 6,
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },

  plugins: [
    admin({
      defaultRole: "user",
      adminRoles: ["admin"],
      defaultBanReason: "Kuralları ihlal etti",
      bannedUserMessage: "Hesabınız askıya alındı. Destek ile iletişime geçin.",
    }),
  ],

  onError: (error: any, request: any) => {
    console.error("🚨 Better Auth Error:", error);
    console.error("🔍 Request info:", {
      url: request?.url,
      method: request?.method,
    });
    return null;
  },
});
