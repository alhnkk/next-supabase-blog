import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "./ui/button";

const PostNotFound = () => {
  return (
    <div className="bg-background">
      <div className="container max-w-7xl mx-auto px-4 py-16">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h2 className="font-bold text-3xl lg:text-4xl text-foreground">
              Henüz Hiç Yazı Yok
            </h2>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              İlk yazıyı eklemek için admin panelini kullanın ve içerik
              oluşturmaya başlayın.
            </p>
          </div>
          <Button
            asChild
            size="lg"
            className="px-8 py-3 font-semibold shadow-lg"
          >
            <Link href="/admin" className="flex items-center gap-2">
              Admin Panel
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PostNotFound;
