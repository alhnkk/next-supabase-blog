import { Metadata } from "next";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export const metadata: Metadata = {
  title: "İletişim | Blog",
  description: "Bizimle iletişime geçin",
};

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">İletişim</h1>
        <p className="text-lg text-slate-600 mx-auto">
          Sorularınız, önerileriniz veya işbirliği teklifleriniz için bizimle
          iletişime geçin.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                İletişim Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="font-medium">E-posta</p>
                  <p className="text-slate-600">info@blog.com</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="font-medium">Telefon</p>
                  <p className="text-slate-600">+90 (212) 555 0123</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="font-medium">Adres</p>
                  <p className="text-slate-600">İstanbul, Türkiye</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="font-medium">Çalışma Saatleri</p>
                  <p className="text-slate-600">
                    Pazartesi - Cuma: 09:00 - 18:00
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sık Sorulan Sorular</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">
                  Yazı göndermek istiyorum, nasıl yapabilirim?
                </h3>
                <p className="text-sm text-slate-600">
                  Kayıt olduktan sonra profil sayfanızdan yeni yazı
                  oluşturabilirsiniz.
                </p>
              </div>

              <div>
                <h3 className="font-medium mb-1">
                  İçeriklerimde sorun var, kimle iletişime geçebilirim?
                </h3>
                <p className="text-sm text-slate-600">
                  Aşağıdaki form üzerinden bizimle iletişime geçebilir veya
                  e-posta gönderebilirsiniz.
                </p>
              </div>

              <div>
                <h3 className="font-medium mb-1">Reklam vermek istiyorum?</h3>
                <p className="text-sm text-slate-600">
                  Reklam seçenekleri için lütfen e-posta ile bizimle iletişime
                  geçin.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form */}
        <Card>
          <CardHeader>
            <CardTitle>Mesaj Gönder</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Ad Soyad</Label>
                  <Input id="name" placeholder="Adınızı girin" required />
                </div>
                <div>
                  <Label htmlFor="email">E-posta</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="E-posta adresinizi girin"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="subject">Konu</Label>
                <Input
                  id="subject"
                  placeholder="Mesaj konusunu girin"
                  required
                />
              </div>

              <div>
                <Label htmlFor="message">Mesaj</Label>
                <Textarea
                  id="message"
                  placeholder="Mesajınızı yazın..."
                  rows={6}
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                Mesaj Gönder
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
