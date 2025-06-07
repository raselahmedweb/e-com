export type Category = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  created_at?: Date;
  updated_at?: Date;
};

export type UserT = {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
};

export type Product = {
    id: number
    name: string
    slug?: string
    price: number
    sale_price?: number | null
    image_url?: string
    category_name?: string
    category_slug?: string
  }

  export type FeaturedProduct =   {
    id: number,
    name: string,
    slug: string,
    price: number,
    sale_price?: number,
    image_url: string,
    category_name: string,
    category_slug: string,
  }