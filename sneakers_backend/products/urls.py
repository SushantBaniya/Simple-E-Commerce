from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, BrandViewSet, ProductViewSet, ReviewViewSet, signupview, loginview

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'brands', BrandViewSet)
router.register(r'products', ProductViewSet)
router.register(r'reviews', ReviewViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('signup/', signupview.as_view({'post': 'create'}), name='signup'),
    path('login/', loginview.as_view({'post': 'create'}), name='login'),
]
