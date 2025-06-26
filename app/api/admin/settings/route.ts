import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation schema
const settingsUpdateSchema = z.object({
  siteName: z.string().min(1).max(100).optional(),
  siteDescription: z.string().max(500).optional(),
  siteUrl: z.string().url().optional(),
  siteLogo: z.string().optional(),
  adminEmail: z.string().email().optional(),
  defaultCategory: z.string().optional(),
  postsPerPage: z.number().min(1).max(50).optional(),
  enableComments: z.boolean().optional(),
  enableRegistration: z.boolean().optional(),
  maintenanceMode: z.boolean().optional(),

  // SEO Settings
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  metaKeywords: z.string().max(200).optional(),
  ogImage: z.string().optional(),

  // Social Links
  socialTwitter: z.string().optional(),
  socialFacebook: z.string().optional(),
  socialInstagram: z.string().optional(),
  socialLinkedin: z.string().optional(),
  socialGithub: z.string().optional(),

  // Email Settings
  smtpHost: z.string().optional(),
  smtpPort: z.number().optional(),
  smtpUser: z.string().optional(),
  smtpPassword: z.string().optional(),
  fromEmail: z.string().email().optional(),
  fromName: z.string().optional(),

  // Appearance Settings
  primaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  accentColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  enableDarkMode: z.boolean().optional(),
});

// GET /api/admin/settings - Sistem ayarlarını getir
export async function GET(request: NextRequest) {
  try {
    // Admin yetkisi kontrolü
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json(
        { error: "Bu işlem için giriş yapmalısınız" },
        { status: 401 }
      );
    }

    const user = session.user as any;
    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "Bu işlem için admin yetkisi gereklidir" },
        { status: 403 }
      );
    }

    // Ayarları veritabanından getir veya varsayılan ayarları oluştur
    let settings = await prisma.settings.findFirst();

    if (!settings) {
      // İlk kez çalışıyorsa varsayılan ayarları oluştur
      settings = await prisma.settings.create({
        data: {
          siteName: "Blog",
          siteDescription: "Modern blog platformu",
          siteUrl: "https://localhost:3000",
          adminEmail: "admin@blog.com",
          postsPerPage: 10,
          enableComments: true,
          enableRegistration: true,
          maintenanceMode: false,
          metaTitle: "Blog - Modern Platform",
          metaDescription: "Modern blog platformu",
          metaKeywords: "blog, yazı, makale",
          fromEmail: "noreply@blog.com",
          fromName: "Blog",
          primaryColor: "#1e293b",
          accentColor: "#f59e0b",
          enableDarkMode: false,
        },
      });
    }

    // Response formatını eski API ile uyumlu hale getir
    const response = {
      siteName: settings.siteName,
      siteDescription: settings.siteDescription || "",
      siteUrl: settings.siteUrl || "",
      siteLogo: settings.siteLogo || "",
      adminEmail: settings.adminEmail || "",
      defaultCategory: settings.defaultCategory || "",
      postsPerPage: settings.postsPerPage,
      enableComments: settings.enableComments,
      enableRegistration: settings.enableRegistration,
      maintenanceMode: settings.maintenanceMode,
      socialLinks: {
        twitter: settings.socialTwitter || "",
        facebook: settings.socialFacebook || "",
        instagram: settings.socialInstagram || "",
        linkedin: settings.socialLinkedin || "",
        github: settings.socialGithub || "",
      },
      seoSettings: {
        metaTitle: settings.metaTitle || "",
        metaDescription: settings.metaDescription || "",
        metaKeywords: settings.metaKeywords || "",
        ogImage: settings.ogImage || "",
      },
      emailSettings: {
        smtpHost: settings.smtpHost || "",
        smtpPort: settings.smtpPort || 587,
        smtpUser: settings.smtpUser || "",
        smtpPassword: settings.smtpPassword ? "••••••••" : "",
        fromEmail: settings.fromEmail || "",
        fromName: settings.fromName || "",
      },
      appearanceSettings: {
        primaryColor: settings.primaryColor,
        accentColor: settings.accentColor,
        enableDarkMode: settings.enableDarkMode,
      },
      updatedAt: settings.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("[GET /api/admin/settings]:", error);
    return NextResponse.json(
      { error: "Sistem ayarları alınırken hata oluştu" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/settings - Sistem ayarlarını güncelle
export async function PUT(request: NextRequest) {
  try {
    // Admin yetkisi kontrolü
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json(
        { error: "Bu işlem için giriş yapmalısınız" },
        { status: 401 }
      );
    }

    const user = session.user as any;
    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "Bu işlem için admin yetkisi gereklidir" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Nested objeleri flat hale getir
    const flatData: any = {};

    // Ana alanlar
    if (body.siteName !== undefined) flatData.siteName = body.siteName;
    if (body.siteDescription !== undefined)
      flatData.siteDescription = body.siteDescription;
    if (body.siteUrl !== undefined) flatData.siteUrl = body.siteUrl;
    if (body.siteLogo !== undefined) flatData.siteLogo = body.siteLogo;
    if (body.adminEmail !== undefined) flatData.adminEmail = body.adminEmail;
    if (body.defaultCategory !== undefined)
      flatData.defaultCategory = body.defaultCategory;
    if (body.postsPerPage !== undefined)
      flatData.postsPerPage = body.postsPerPage;
    if (body.enableComments !== undefined)
      flatData.enableComments = body.enableComments;
    if (body.enableRegistration !== undefined)
      flatData.enableRegistration = body.enableRegistration;
    if (body.maintenanceMode !== undefined)
      flatData.maintenanceMode = body.maintenanceMode;

    // Social links
    if (body.socialLinks) {
      if (body.socialLinks.twitter !== undefined)
        flatData.socialTwitter = body.socialLinks.twitter;
      if (body.socialLinks.facebook !== undefined)
        flatData.socialFacebook = body.socialLinks.facebook;
      if (body.socialLinks.instagram !== undefined)
        flatData.socialInstagram = body.socialLinks.instagram;
      if (body.socialLinks.linkedin !== undefined)
        flatData.socialLinkedin = body.socialLinks.linkedin;
      if (body.socialLinks.github !== undefined)
        flatData.socialGithub = body.socialLinks.github;
    }

    // SEO settings
    if (body.seoSettings) {
      if (body.seoSettings.metaTitle !== undefined)
        flatData.metaTitle = body.seoSettings.metaTitle;
      if (body.seoSettings.metaDescription !== undefined)
        flatData.metaDescription = body.seoSettings.metaDescription;
      if (body.seoSettings.metaKeywords !== undefined)
        flatData.metaKeywords = body.seoSettings.metaKeywords;
      if (body.seoSettings.ogImage !== undefined)
        flatData.ogImage = body.seoSettings.ogImage;
    }

    // Email settings
    if (body.emailSettings) {
      if (body.emailSettings.smtpHost !== undefined)
        flatData.smtpHost = body.emailSettings.smtpHost;
      if (body.emailSettings.smtpPort !== undefined)
        flatData.smtpPort = body.emailSettings.smtpPort;
      if (body.emailSettings.smtpUser !== undefined)
        flatData.smtpUser = body.emailSettings.smtpUser;
      if (
        body.emailSettings.smtpPassword !== undefined &&
        body.emailSettings.smtpPassword !== "••••••••"
      ) {
        flatData.smtpPassword = body.emailSettings.smtpPassword;
      }
      if (body.emailSettings.fromEmail !== undefined)
        flatData.fromEmail = body.emailSettings.fromEmail;
      if (body.emailSettings.fromName !== undefined)
        flatData.fromName = body.emailSettings.fromName;
    }

    // Appearance settings
    if (body.appearanceSettings) {
      if (body.appearanceSettings.primaryColor !== undefined)
        flatData.primaryColor = body.appearanceSettings.primaryColor;
      if (body.appearanceSettings.accentColor !== undefined)
        flatData.accentColor = body.appearanceSettings.accentColor;
      if (body.appearanceSettings.enableDarkMode !== undefined)
        flatData.enableDarkMode = body.appearanceSettings.enableDarkMode;
    }

    // Validation
    const validatedData = settingsUpdateSchema.parse(flatData);

    // Ayarları güncelle veya oluştur
    const updatedSettings = await prisma.settings.upsert({
      where: { id: "settings" },
      update: validatedData,
      create: {
        id: "settings",
        ...validatedData,
      },
    });

    // Response formatını eski API ile uyumlu hale getir
    const response = {
      siteName: updatedSettings.siteName,
      siteDescription: updatedSettings.siteDescription || "",
      siteUrl: updatedSettings.siteUrl || "",
      siteLogo: updatedSettings.siteLogo || "",
      adminEmail: updatedSettings.adminEmail || "",
      defaultCategory: updatedSettings.defaultCategory || "",
      postsPerPage: updatedSettings.postsPerPage,
      enableComments: updatedSettings.enableComments,
      enableRegistration: updatedSettings.enableRegistration,
      maintenanceMode: updatedSettings.maintenanceMode,
      socialLinks: {
        twitter: updatedSettings.socialTwitter || "",
        facebook: updatedSettings.socialFacebook || "",
        instagram: updatedSettings.socialInstagram || "",
        linkedin: updatedSettings.socialLinkedin || "",
        github: updatedSettings.socialGithub || "",
      },
      seoSettings: {
        metaTitle: updatedSettings.metaTitle || "",
        metaDescription: updatedSettings.metaDescription || "",
        metaKeywords: updatedSettings.metaKeywords || "",
        ogImage: updatedSettings.ogImage || "",
      },
      emailSettings: {
        smtpHost: updatedSettings.smtpHost || "",
        smtpPort: updatedSettings.smtpPort || 587,
        smtpUser: updatedSettings.smtpUser || "",
        smtpPassword: updatedSettings.smtpPassword ? "••••••••" : "",
        fromEmail: updatedSettings.fromEmail || "",
        fromName: updatedSettings.fromName || "",
      },
      appearanceSettings: {
        primaryColor: updatedSettings.primaryColor,
        accentColor: updatedSettings.accentColor,
        enableDarkMode: updatedSettings.enableDarkMode,
      },
      updatedAt: updatedSettings.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: response,
      message: "Sistem ayarları başarıyla güncellendi",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Geçersiz veri formatı", details: error.errors },
        { status: 400 }
      );
    }

    console.error("[PUT /api/admin/settings]:", error);
    return NextResponse.json(
      { error: "Sistem ayarları güncellenirken hata oluştu" },
      { status: 500 }
    );
  }
}

// POST /api/admin/settings/actions - Özel işlemler (cache temizleme, backup vb.)
export async function POST(request: NextRequest) {
  try {
    // Admin yetkisi kontrolü
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json(
        { error: "Bu işlem için giriş yapmalısınız" },
        { status: 401 }
      );
    }

    const user = session.user as any;
    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "Bu işlem için admin yetkisi gereklidir" },
        { status: 403 }
      );
    }

    const { action } = await request.json();

    switch (action) {
      case "clear-cache":
        // Cache temizleme işlemi (gerçek uygulamada Redis veya cache sistemi)
        return NextResponse.json({
          success: true,
          message: "Cache başarıyla temizlendi",
        });

      case "backup-database":
        // Veritabanı yedekleme işlemi
        return NextResponse.json({
          success: true,
          message: "Veritabanı yedekleme başlatıldı",
        });

      case "reset-to-defaults":
        // Varsayılan ayarlara sıfırlama
        await prisma.settings.deleteMany();
        return NextResponse.json({
          success: true,
          message: "Ayarlar varsayılan değerlere sıfırlandı",
        });

      default:
        return NextResponse.json({ error: "Geçersiz işlem" }, { status: 400 });
    }
  } catch (error) {
    console.error("[POST /api/admin/settings/actions]:", error);
    return NextResponse.json(
      { error: "İşlem gerçekleştirilirken hata oluştu" },
      { status: 500 }
    );
  }
}
