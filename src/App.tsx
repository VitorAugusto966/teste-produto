import { useEffect, useState } from "react";
import axios from "axios";

const STORAGE_KEY = "product-user-data";

type Address = {
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: string;
};

type Product = {
  title: string;
  price: number;
  images: string[];
};

export default function ProductPage() {
  const [product, setProduct] = useState<Product | null>(null);
  const [mainImage, setMainImage] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [cep, setCep] = useState("");
  const [address, setAddress] = useState<Address | null>(null);

  const sizes = ["38", "39", "40", "41", "42"];
  const colors = ["Preto", "Branco", "Azul"];

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const now = Date.now();
      const isValid = now - parsed.timestamp < 15 * 60 * 1000;
      if (isValid) {
        setMainImage(parsed.mainImage);
        setSelectedSize(parsed.selectedSize);
        setSelectedColor(parsed.selectedColor);
        setCep(parsed.cep);
        setAddress(parsed.address);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      const res = await axios.get("https://dummyjson.com/products/124");
      const data = res.data;
      setProduct({
        title: data.title,
        price: data.price,
        images: data.images,
      });
      setMainImage((prev) => prev || data.images[0]);
    };
    fetchProduct();
  }, []);

  useEffect(() => {
    if (!product) return;
    const data = {
      mainImage,
      selectedSize,
      selectedColor,
      cep,
      address,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [mainImage, selectedSize, selectedColor, cep, address, product]);

  const handleCepSearch = async () => {
    try {
      const res = await axios.get(
        `https://viacep.com.br/ws/${cep.replace("-", "")}/json/`
      );
      if (!res.data.erro) {
        setAddress(res.data);
      } else {
        setAddress({ erro: "CEP não encontrado" });
      }
    } catch {
      setAddress({ erro: "Erro ao buscar o CEP" });
    }
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 5) {
      value = value.replace(/^(\d{5})(\d{0,3})/, "$1-$2");
    }
    setCep(value);
  };

  if (!product)
    return <p className="text-center p-6 text-lg">Carregando produto...</p>;

  return (
    <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-12">
      <div>
        <img
          src={mainImage}
          alt="Produto"
          className="w-full h-[480px] object-cover rounded-xl shadow-md border"
        />
        <div className="flex gap-3 mt-6">
          {product.images.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`Thumb ${index}`}
              onClick={() => setMainImage(img)}
              className={`w-20 h-20 rounded-lg border transition-all duration-300 cursor-pointer hover:scale-105 ${
                mainImage === img ? "border-blue-600 ring-2 ring-blue-400" : ""
              }`}
            />
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <h1 className="text-4xl font-bold text-white">{product.title}</h1>
        <p className="text-3xl font-semibold text-green-600">
          R$ {(product.price * 6).toFixed(2)}
        </p>

        <div>
          <h2 className="font-medium text-white mb-2">Tamanho:</h2>
          <div className="flex flex-wrap gap-3">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`px-5 py-2 rounded-full border transition-all duration-300 ${
                  selectedSize === size
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-black hover:bg-blue-100"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-medium text-white mb-2">Cor:</h2>
          <div className="flex flex-wrap gap-3">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`px-5 py-2 rounded-full border transition-all duration-300 ${
                  selectedColor === color
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-black hover:bg-blue-100"
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-medium text-white mb-2">Calcular Frete (CEP):</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={cep}
              onChange={handleCepChange}
              className="border rounded px-4 py-2 w-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="00000-000"
              maxLength={9}
            />
            <button
              onClick={handleCepSearch}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-all"
            >
              Buscar
            </button>
          </div>
          {address && (
            <div className="mt-3 text-sm text-white">
              {address.erro ? (
                <p className="text-red-600">{address.erro}</p>
              ) : (
                <p>{`${address.logradouro}, ${address.bairro}, ${address.localidade} - ${address.uf}`}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
