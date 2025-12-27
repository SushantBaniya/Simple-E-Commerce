from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Category, Brand, Product, ProductImage, Size, Review


class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'product_count']

    def get_product_count(self, obj):
        return obj.products.count()


class BrandSerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Brand
        fields = ['id', 'name', 'slug', 'logo', 'description', 'product_count']

    def get_product_count(self, obj):
        return obj.products.count()


class ProductImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'image_url', 'is_primary']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and hasattr(obj.image, 'url'):
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class SizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Size
        fields = ['id', 'size', 'us_size', 'stock']


class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['id', 'product', 'user_name',
                  'rating', 'comment', 'created_at']
        read_only_fields = ['created_at']


class ProductListSerializer(serializers.ModelSerializer):
    """Serializer for product list view - shows minimal info"""
    category = CategorySerializer(read_only=True)
    brand = BrandSerializer(read_only=True)
    primary_image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'price', 'discount_price',
            'final_price', 'discount_percentage', 'category',
            'brand', 'stock', 'is_available', 'featured', 'primary_image'
        ]

    def get_primary_image(self, obj):
        primary_image = obj.images.filter(is_primary=True).first()
        if not primary_image:
            primary_image = obj.images.first()

        if primary_image:
            request = self.context.get('request')
            if request and hasattr(primary_image.image, 'url'):
                return request.build_absolute_uri(primary_image.image.url)
            return primary_image.image.url if hasattr(primary_image.image, 'url') else None
        return None


class ProductDetailSerializer(serializers.ModelSerializer):
    """Serializer for product detail view - shows all info"""
    category = CategorySerializer(read_only=True)
    brand = BrandSerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    sizes = SizeSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    average_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'price',
            'discount_price', 'final_price', 'discount_percentage',
            'category', 'brand', 'stock', 'is_available', 'featured',
            'images', 'sizes', 'reviews', 'average_rating',
            'review_count', 'created_at', 'updated_at'
        ]

    def get_average_rating(self, obj):
        reviews = obj.reviews.all()
        if reviews.exists():
            total = sum(r.rating for r in reviews)
            return round(total / reviews.count(), 1)
        return 0

    def get_review_count(self, obj):
        return obj.reviews.count()


class CreateReviewSerializer(serializers.ModelSerializer):
    """Serializer for creating reviews"""
    class Meta:
        model = Review
        fields = ['product', 'user_name', 'rating', 'comment']

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5")
        return value

class SignupSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user