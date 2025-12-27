
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, AllowAny
from django.db.models import Q, Count, Avg
from django.contrib.auth.models import User
from .models import Category, Brand, Product, Review
from .serializers import (
    CategorySerializer, BrandSerializer,
    ProductListSerializer, ProductDetailSerializer,
    ReviewSerializer, CreateReviewSerializer
)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for categories"""
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    lookup_field = 'slug'


class BrandViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for brands"""
    queryset = Brand.objects.filter(is_active=True)
    serializer_class = BrandSerializer
    lookup_field = 'slug'


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for products

    Supports:
    - Filtering by category, brand, gender, price range
    - Search by name, description
    - Ordering by price, date, name
    """
    queryset = Product.objects.filter(is_available=True).select_related(
        'category', 'brand'
    ).prefetch_related('images', 'sizes', 'reviews')

    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description',
                     'brand__name', 'category__name', 'color']
    ordering_fields = ['price', 'created_at', 'name', 'views_count']
    ordering = ['-created_at']
    lookup_field = 'slug'

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProductDetailSerializer
        return ProductListSerializer

    def retrieve(self, request, *args, **kwargs):
        """Increment view count when product is viewed"""
        instance = self.get_object()
        instance.views_count += 1
        instance.save(update_fields=['views_count'])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def get_queryset(self):
        queryset = super().get_queryset()

        # Filter by category slug
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category__slug=category)

        # Filter by brand slug
        brand = self.request.query_params.get('brand')
        if brand:
            queryset = queryset.filter(brand__slug=brand)

        # Filter by gender
        gender = self.request.query_params.get('gender')
        if gender:
            queryset = queryset.filter(gender=gender)

        # Filter by color
        color = self.request.query_params.get('color')
        if color:
            queryset = queryset.filter(color__icontains=color)

        # Filter by featured
        featured = self.request.query_params.get('featured')
        if featured and featured.lower() in ['true', '1', 'yes']:
            queryset = queryset.filter(is_featured=True)

        # Filter by new arrivals
        new_arrival = self.request.query_params.get('new_arrival')
        if new_arrival and new_arrival.lower() in ['true', '1', 'yes']:
            queryset = queryset.filter(is_new_arrival=True)

        # Filter by best sellers
        best_seller = self.request.query_params.get('best_seller')
        if best_seller and best_seller.lower() in ['true', '1', 'yes']:
            queryset = queryset.filter(is_best_seller=True)

        # Filter by price range
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')

        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)

        # Filter by availability
        in_stock = self.request.query_params.get('in_stock')
        if in_stock and in_stock.lower() in ['true', '1', 'yes']:
            queryset = queryset.filter(stock__gt=0)

        return queryset

    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured products"""
        products = self.get_queryset().filter(is_featured=True)[:8]
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def new_arrivals(self, request):
        """Get new arrival products"""
        products = self.get_queryset().filter(
            is_new_arrival=True).order_by('-created_at')[:8]
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def best_sellers(self, request):
        """Get best selling products"""
        products = self.get_queryset().filter(
            is_best_seller=True).order_by('-views_count')[:8]
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def on_sale(self, request):
        """Get products on sale"""
        products = self.get_queryset().exclude(discount_price__isnull=True)
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def trending(self, request):
        """Get trending products (most viewed recently)"""
        products = self.get_queryset().order_by('-views_count')[:8]
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def related(self, request, slug=None):
        """Get related products (same category/brand)"""
        product = self.get_object()
        related = self.get_queryset().filter(
            Q(category=product.category) | Q(brand=product.brand)
        ).exclude(id=product.id)[:4]
        serializer = self.get_serializer(related, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def filters(self, request):
        """Get available filter options"""
        queryset = self.get_queryset()

        filters_data = {
            'categories': CategorySerializer(
                Category.objects.filter(
                    is_active=True, products__in=queryset).distinct(),
                many=True,
                context={'request': request}
            ).data,
            'brands': BrandSerializer(
                Brand.objects.filter(
                    is_active=True, products__in=queryset).distinct(),
                many=True,
                context={'request': request}
            ).data,
            'genders': list(queryset.values_list('gender', flat=True).distinct()),
            'colors': list(queryset.values_list('color', flat=True).distinct()),
            'price_range': {
                'min': queryset.order_by('price').first().price if queryset.exists() else 0,
                'max': queryset.order_by('-price').first().price if queryset.exists() else 0,
            }
        }

        return Response(filters_data)


class ReviewViewSet(viewsets.ModelViewSet):
    """API endpoint for product reviews"""
    queryset = Review.objects.filter(
        is_approved=True).select_related('product', 'user')
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return CreateReviewSerializer
        return ReviewSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        # Filter by product
        product_id = self.request.query_params.get('product')
        if product_id:
            queryset = queryset.filter(product_id=product_id)

        # Filter by product slug
        product_slug = self.request.query_params.get('product_slug')
        if product_slug:
            queryset = queryset.filter(product__slug=product_slug)

        # Filter by rating
        rating = self.request.query_params.get('rating')
        if rating:
            queryset = queryset.filter(rating=rating)

        return queryset.order_by('-created_at')

    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            serializer.save(user=self.request.user)
        else:
            serializer.save()

    @action(detail=True, methods=['post'])
    def mark_helpful(self, request, pk=None):
        """Mark review as helpful"""
        review = self.get_object()
        review.helpful_count += 1
        review.save()
        return Response({'helpful_count': review.helpful_count})


class signupview(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    queryset = User.objects.all()

    def create(self, request, *args, **kwargs):
        user_name = request.data.get('user_name')
        password = request.data.get('password')
        email = request.data.get('email')

        if not user_name or not password or not email:
            return Response(
                {'error': 'Name, password, and email are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(email=email).exists():
            return Response(
                {'email': ['Email already exists']},
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(username=user_name).exists():
            return Response(
                {'user_name': ['Username already exists']},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.create_user(
                username=user_name,
                password=password,
                email=email,
                first_name=user_name.split()[0] if user_name else ''
            )
            return Response(
                {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'message': 'User created successfully'
                },
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            return Response(
                {'detail': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class loginview(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    queryset = User.objects.all()

    def create(self, request, *args, **kwargs):
        from django.contrib.auth import authenticate
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response(
                {'error': 'Email and password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Lookup the user by email then authenticate with their username
        user_obj = User.objects.filter(email=email).first()
        if not user_obj:
            return Response(
                {'error': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        user = authenticate(username=user_obj.username, password=password)
        if user is not None:
            return Response(
                {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'message': 'Login successful'
                },
                status=status.HTTP_200_OK
            )
        else:
            return Response(
                {'error': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )
