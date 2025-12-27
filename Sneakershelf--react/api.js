// api.js - API Service for Sneaker E-commerce

const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Helper function to handle fetch requests
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    const config = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        credentials: 'include', // Important for session/cookies
    };

    try {
        const response = await fetch(url, config);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
}

// ==================== PRODUCTS API ====================

export const ProductAPI = {
    // Get all products
    getAll: async (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `/products/?${queryString}` : '/products/';
        return apiRequest(endpoint);
    },

    // Get single product by slug
    getBySlug: async (slug) => {
        return apiRequest(`/products/${slug}/`);
    },

    // Get featured products
    getFeatured: async () => {
        return apiRequest('/products/featured/');
    },

    // Get latest products
    getLatest: async () => {
        return apiRequest('/products/latest/');
    },

    // Get products on sale
    getOnSale: async () => {
        return apiRequest('/products/on_sale/');
    },

    // Search products
    search: async (searchTerm) => {
        return apiRequest(`/products/?search=${encodeURIComponent(searchTerm)}`);
    },

    // Filter products by category
    filterByCategory: async (categorySlug) => {
        return apiRequest(`/products/?category=${categorySlug}`);
    },

    // Filter products by brand
    filterByBrand: async (brandSlug) => {
        return apiRequest(`/products/?brand=${brandSlug}`);
    },

    // Filter by price range
    filterByPrice: async (minPrice, maxPrice) => {
        return apiRequest(`/products/?min_price=${minPrice}&max_price=${maxPrice}`);
    },
};

// ==================== CATEGORIES API ====================

export const CategoryAPI = {
    // Get all categories
    getAll: async () => {
        return apiRequest('/categories/');
    },

    // Get category by slug
    getBySlug: async (slug) => {
        return apiRequest(`/categories/${slug}/`);
    },
};

// ==================== BRANDS API ====================

export const BrandAPI = {
    // Get all brands
    getAll: async () => {
        return apiRequest('/brands/');
    },

    // Get brand by slug
    getBySlug: async (slug) => {
        return apiRequest(`/brands/${slug}/`);
    },
};

// ==================== CART API ====================

export const CartAPI = {
    // Get cart
    get: async () => {
        return apiRequest('/cart/');
    },

    // Add item to cart
    addItem: async (productId, sizeId, quantity = 1) => {
        return apiRequest('/cart/add_item/', {
            method: 'POST',
            body: JSON.stringify({
                product_id: productId,
                size_id: sizeId,
                quantity: quantity
            })
        });
    },

    // Update cart item quantity
    updateItem: async (itemId, quantity) => {
        return apiRequest('/cart/update_item/', {
            method: 'POST',
            body: JSON.stringify({
                item_id: itemId,
                quantity: quantity
            })
        });
    },

    // Remove item from cart
    removeItem: async (itemId) => {
        return apiRequest('/cart/remove_item/', {
            method: 'POST',
            body: JSON.stringify({
                item_id: itemId
            })
        });
    },

    // Clear cart
    clear: async () => {
        return apiRequest('/cart/clear/', {
            method: 'POST'
        });
    },
};

// ==================== REVIEWS API ====================

export const ReviewAPI = {
    // Get all reviews (optionally filtered by product)
    getAll: async (productId = null) => {
        const endpoint = productId ? `/reviews/?product=${productId}` : '/reviews/';
        return apiRequest(endpoint);
    },

    // Create a review
    create: async (productId, userName, rating, comment) => {
        return apiRequest('/reviews/', {
            method: 'POST',
            body: JSON.stringify({
                product: productId,
                user_name: userName,
                rating: rating,
                comment: comment
            })
        });
    },
};

// ==================== ORDERS API ====================

export const OrderAPI = {
    // Get all orders
    getAll: async () => {
        return apiRequest('/orders/');
    },

    // Create order from cart
    create: async (orderData) => {
        return apiRequest('/orders/create_order/', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
    },

    // Track order by order number
    track: async (orderNumber) => {
        return apiRequest(`/orders/${orderNumber}/track/`);
    },
};

// Export all APIs
export default {
    products: ProductAPI,
    categories: CategoryAPI,
    brands: BrandAPI,
    cart: CartAPI,
    reviews: ReviewAPI,
    orders: OrderAPI,
};