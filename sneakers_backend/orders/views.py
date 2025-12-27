from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Order, OrderItem
from .serializers import OrderSerializer
from cart.models import Cart


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

    @action(detail=False, methods=['post'])
    def create_order(self, request):
        session_key = request.session.session_key

        try:
            cart = Cart.objects.get(session_key=session_key)
        except Cart.DoesNotExist:
            return Response(
                {'error': 'Cart is empty'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not cart.items.exists():
            return Response(
                {'error': 'Cart is empty'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create order
        order_data = {
            'full_name': request.data.get('full_name'),
            'email': request.data.get('email'),
            'phone': request.data.get('phone'),
            'address': request.data.get('address'),
            'city': request.data.get('city'),
            'postal_code': request.data.get('postal_code'),
            'country': request.data.get('country'),
            'subtotal': cart.total_price,
            'shipping_cost': request.data.get('shipping_cost', 10.00),
            'notes': request.data.get('notes', ''),
        }

        order_data['total'] = float(
            order_data['subtotal']) + float(order_data['shipping_cost'])

        order = Order.objects.create(**order_data)

        # Create order items from cart items
        for cart_item in cart.items.all():
            OrderItem.objects.create(
                order=order,
                product=cart_item.product,
                size=cart_item.size,
                quantity=cart_item.quantity,
                price=cart_item.product.final_price
            )

        # Clear cart
        cart.items.all().delete()

        serializer = self.get_serializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def track(self, request, pk=None):
        try:
            order = Order.objects.get(order_number=pk)
            serializer = self.get_serializer(order)
            return Response(serializer.data)
        except Order.DoesNotExist:
            return Response(
                {'error': 'Order not found'},
                status=status.HTTP_404_NOT_FOUND
            )
