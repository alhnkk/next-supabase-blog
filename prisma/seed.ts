import { PrismaClient, PostStatus, PostType } from "@prisma/client";
import bcrypt from "bcryptjs"; // ✅ bcrypt'i geri ekle

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding started...");

  // ✅ HASHED PASSWORD - Better Auth için şifreleri hash'le
  const hashedAdminPassword = await bcrypt.hash("admin123", 10);
  const hashedTestPassword = await bcrypt.hash("test123", 10);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@journalize.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@journalize.com",
      emailVerified: true,
      role: "admin",
      username: "admin",
      bio: "JURNALİZE blog yöneticisi",
      password: hashedAdminPassword, // ✅ User'a da password ekle
      accounts: {
        create: {
          accountId: "admin-account",
          providerId: "credential",
          password: hashedAdminPassword, // ✅ Hashed password
        },
      },
    },
  });

  const testUser = await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: {},
    create: {
      name: "Test Kullanıcı",
      email: "test@example.com",
      emailVerified: true,
      role: "user",
      username: "testuser",
      bio: "Test kullanıcısı",
      password: hashedTestPassword, // ✅ User'a da password ekle
      accounts: {
        create: {
          accountId: "test-account",
          providerId: "credential",
          password: hashedTestPassword, // ✅ Hashed password
        },
      },
    },
  });

  // 3. Kategoriler (aynı kalır)
  const categories = [
    {
      name: "Edebiyat",
      slug: "edebiyat",
      description: "Genel edebiyat yazıları",
      color: "#f59e0b",
      icon: "📚",
    },
    {
      name: "Şiir",
      slug: "siir",
      description: "Şiir ve poetik yazılar",
      color: "#8b5cf6",
      icon: "🌸",
    },
    {
      name: "Kitap İnceleme",
      slug: "kitap-inceleme",
      description: "Kitap eleştiri ve incelemeleri",
      color: "#06b6d4",
      icon: "📖",
    },
  ];

  const createdCategories = [];
  for (const category of categories) {
    const createdCategory = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
    createdCategories.push(createdCategory);
  }

  // 4. Etiketler (aynı kalır)
  const tags = [
    { name: "Modern Edebiyat", slug: "modern-edebiyat", color: "#ef4444" },
    { name: "Klasik", slug: "klasik", color: "#10b981" },
    { name: "Çeviri", slug: "ceviri", color: "#6366f1" },
    { name: "Yerli Yazar", slug: "yerli-yazar", color: "#f59e0b" },
  ];

  const createdTags = [];
  for (const tag of tags) {
    const createdTag = await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: {},
      create: tag,
    });
    createdTags.push(createdTag);
  }

  // 5. Posts (aynı kalır)
  const posts = [
    {
      title: "Sonbaharın Renkleri ve Edebiyat",
      slug: "sonbaharin-renkleri-ve-edebiyat",
      excerpt:
        "Sonbahar mevsiminin edebiyat üzerindeki etkilerini ve bu dönemde yazılan eserlerden örnekleri inceliyoruz.",
      content:
        "<h2>Sonbahar ve Edebiyat</h2><p>Sonbahar, edebiyatçılar için her zaman ilham kaynağı olmuştur...</p>",
      status: PostStatus.PUBLISHED,
      postType: PostType.ARTICLE,
      publishedAt: new Date(),
      authorId: adminUser.id,
      categoryId: createdCategories[0].id,
      allowComments: true,
      allowLikes: true,
    },
    {
      title: "Modern Türk Şiirinde Yeni Arayışlar",
      slug: "modern-turk-siirinde-yeni-arayislar",
      excerpt:
        "Çağdaş Türk şiirinin geldiği nokta ve genç şairlerin getirdiği yeni perspektifler.",
      content:
        "<h2>Yeni Nesil Şairler</h2><p>Türk şiiri, son yıllarda ciddi bir dönüşüm geçiriyor...</p>",
      status: PostStatus.PUBLISHED,
      postType: PostType.ARTICLE,
      publishedAt: new Date(),
      authorId: testUser.id,
      categoryId: createdCategories[1].id,
      allowComments: true,
      allowLikes: true,
    },
  ];

  const createdPosts = [];
  for (const post of posts) {
    const createdPost = await prisma.post.upsert({
      where: { slug: post.slug },
      update: {},
      create: post,
    });
    createdPosts.push(createdPost);
  }

  // 6. Post-tag ilişkileri
  await prisma.postTag.upsert({
    where: {
      postId_tagId: {
        postId: createdPosts[0].id,
        tagId: createdTags[0].id,
      },
    },
    update: {},
    create: {
      postId: createdPosts[0].id,
      tagId: createdTags[0].id,
    },
  });

  await prisma.postTag.upsert({
    where: {
      postId_tagId: {
        postId: createdPosts[1].id,
        tagId: createdTags[1].id,
      },
    },
    update: {},
    create: {
      postId: createdPosts[1].id,
      tagId: createdTags[1].id,
    },
  });

  console.log("✅ Seeding completed!");
  console.log(`👤 Admin: admin@journalize.com / admin123`);
  console.log(`👤 Test: test@example.com / test123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
