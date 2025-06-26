import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const passwordUpdateSchema = z
  .object({
    currentPassword: z.string().optional(), // Make optional for provider users
    newPassword: z
      .string()
      .min(8, "Yeni şifre en az 8 karakter olmalı")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermeli"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Şifreler eşleşmiyor",
    path: ["confirmPassword"],
  });

// PUT /api/user/password - Kullanıcı şifresini değiştir
export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json(
        { error: "Giriş yapmalısınız" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword } = passwordUpdateSchema.parse(body);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    // Check if user already has a credential account (password)
    const existingCredentialAccount = await prisma.account.findFirst({
      where: {
        userId: user.id,
        providerId: "credential",
      },
    });

    // If user has existing password, verify current password
    if (existingCredentialAccount?.password && !currentPassword) {
      return NextResponse.json(
        { error: "Mevcut şifrenizi girmeniz gerekiyor" },
        { status: 400 }
      );
    }

    if (existingCredentialAccount?.password && currentPassword) {
      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        existingCredentialAccount.password
      );

      if (!isCurrentPasswordValid) {
        return NextResponse.json(
          { error: "Mevcut şifre yanlış" },
          { status: 400 }
        );
      }
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    if (existingCredentialAccount) {
      // Update existing credential account
      await prisma.account.update({
        where: { id: existingCredentialAccount.id },
        data: {
          password: hashedNewPassword,
        },
      });
    } else {
      // Create new credential account for provider users
      await prisma.account.create({
        data: {
          userId: user.id,
          providerId: "credential",
          accountId: user.email, // Use email as account ID for credentials
          password: hashedNewPassword,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Şifre başarıyla güncellendi",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: error.errors },
        { status: 400 }
      );
    }

    console.error("[PUT /api/user/password]:", error);
    return NextResponse.json(
      { error: "Şifre güncellenirken hata oluştu" },
      { status: 500 }
    );
  }
}
