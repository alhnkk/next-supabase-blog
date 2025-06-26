import { Button } from "../ui/button";
import { Megaphone } from "lucide-react";

export function AdPlaceholder() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
      <div className="mb-4">
        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto">
          <Megaphone className="w-6 h-6 text-gray-500" />
        </div>
      </div>

      <h3 className="font-semibold text-gray-900 mb-2">Reklam Alanı</h3>

      <p className="text-gray-600 text-sm mb-4 leading-relaxed">
        Bu premium alana markanızı yerleştirin ve hedef kitlenize ulaşın.
      </p>

      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-center gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span>Premium konum</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Yüksek görünürlük</span>
          </div>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
      >
        İletişim
      </Button>

      <div className="mt-3">
        <p className="text-xs text-gray-500">
          <span className="font-semibold text-gray-700">10K+</span> aylık
          görüntüleme
        </p>
      </div>
    </div>
  );
}
