// Item.tsx
export interface Product {
    id: string;
    name: string;
    price: number;
}

export interface CartItem {
    id: string;
    productName: string;
    description: string;
    unitPrice: number;
    category: string;
    imageURL: string;
    quantity?: number;
}

