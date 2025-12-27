from rest_framework import serializers
from .models import Order, OrderItem
from products.serializers import ProductListSerializer, SizeSerializer


class OrderItemSerializer(serializers.ModelSerializer):
    """Serializer for order items"""
    product = ProductListSerializer(read_only=True)
    size = SizeSerializer(read_only=True)
    subtotal = serializers.DecimalField(
        max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'size', 'quantity', 'price', 'subtotal']
        read_only_fields = ['subtotal']


class OrderSerializer(serializers.ModelSerializer):
    """Serializer for viewing orders"""
    items = OrderItemSerializer(many=True, read_only=True)
    status_display = serializers.CharField(
        source='get_status_display', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'full_name', 'email', 'phone',
            'address', 'city', 'postal_code', 'country',
            'subtotal', 'shipping_cost', 'total',
            'status', 'status_display', 'notes',
            'items', 'created_at', 'updated_at'
        ]
        read_only_fields = ['order_number', 'created_at', 'updated_at']


class CreateOrderSerializer(serializers.ModelSerializer):
    """Serializer for creating new orders"""

    class Meta:
        model = Order
        fields = [
            'full_name', 'email', 'phone', 'address',
            'city', 'postal_code', 'country', 'notes'
        ]

    def validate_email(self, value):
        if not value:
            raise serializers.ValidationError("Email is required")
        return value

    def validate_phone(self, value):
        if not value:
            raise serializers.ValidationError("Phone number is required")
        return value

    def validate_full_name(self, value):
        if not value or len(value.strip()) < 2:
            raise serializers.ValidationError("Please enter a valid full name")
        return value


class OrderTrackingSerializer(serializers.ModelSerializer):
    """Simplified serializer for order tracking"""
    status_display = serializers.CharField(
        source='get_status_display', read_only=True)
    items_count = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'order_number', 'full_name', 'status', 'status_display',
            'total', 'items_count', 'created_at', 'updated_at'
        ]

    def get_items_count(self, obj):
        return obj.items.count()


class UpdateOrderStatusSerializer(serializers.Serializer):
    """Serializer for updating order status"""
    status = serializers.ChoiceField(
        choices=Order.STATUS_CHOICES,
        required=True
    )
