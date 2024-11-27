import { betterAuth } from "better-auth";
import {
  bearer,
  organization,
  passkey,
  twoFactor,
  admin,
  username,
  multiSession,
} from "better-auth/plugins";
import { reactInvitationEmail } from "@/components/email/invitation";
import { reactResetPasswordEmail } from "@/components/email/rest-password";
import { resend } from "@/lib/resend";
import { prismaAdapter } from "better-auth/adapters/prisma";
import db from "@/lib/db";
import { additionalUserFields } from "@/lib/auth/additional-fields";
import { trustedOrigins } from "@/constants/trustedOrigins";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL!,
  trustedOrigins: trustedOrigins,
  database: prismaAdapter(db, {
    provider: "mongodb",
  }),
  user: {
    additionalFields: additionalUserFields,
  },
  emailVerification: {
    async sendVerificationEmail(user, url) {
      await resend.emails.send({
        from: process.env.SEND_EMAIL_FROM!,
        to: user.email,
        subject: "Verify your email address",
        html: `<a href="${url}">Verify your email address</a>`,
      });
    },
    sendOnSignUp: true,
    requireEmailVerification: true,
  },
  emailAndPassword: {
    enabled: true,
    async sendResetPassword(user, url) {
      await resend.emails.send({
        from: process.env.SEND_EMAIL_FROM!,
        to: user.email,
        subject: "Reset your password",
        react: reactResetPasswordEmail({
          username: user.email,
          resetLink: url,
        }),
      });
    },
  },
  plugins: [
    organization({
      async sendInvitationEmail(data) {
        await resend.emails.send({
          from: process.env.SEND_EMAIL_FROM!,
          to: data.email,
          subject: "You've been invited to join an organization",
          react: reactInvitationEmail({
            username: data.email,
            invitedByUsername: data.inviter.user.name,
            invitedByEmail: data.inviter.user.email,
            teamName: data.organization.name,
            inviteLink:
              process.env.NODE_ENV === "development"
                ? `http://localhost:3000/accept-invitation/${data.id}`
                : `https://${
                    process.env.BETTER_AUTH_URL ||
                    process.env.NEXT_PUBLIC_APP_URL ||
                    process.env.VERCEL_URL
                  }/accept-invitation/${data.id}`,
          }),
        });
      },
    }),
    twoFactor({
      issuer: process.env.APP_NAME!,
      otpOptions: {
        async sendOTP(user, otp) {
          await resend.emails.send({
            from: process.env.SEND_EMAIL_FROM!,
            to: user.email,
            subject: "Your OTP",
            html: `Your OTP is ${otp}`,
          });
        },
      },
    }),
    username(),
    passkey({
      rpID: process.env.RP_ID!,
      rpName: process.env.RP_NAME!,
      origin: process.env.APP_ORIGIN!,
    }),
    bearer(),
    admin(),
    multiSession({
      maximumSessions: 1,
    }),
  ],
  advanced: {
    cookiePrefix: process.env.APP_NAME!,
    // crossSubDomainCookies:{
    //   enabled:true,
    //   domain:process.env.BETTER_AUTH_TRUSTED_ORIGINS!
    // }
  },
});
