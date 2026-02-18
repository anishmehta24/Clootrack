from rest_framework import generics, filters
from django.db.models import Count, Avg
from django.utils.timezone import now
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Ticket
from .serializers import TicketSerializer


# CREATE + LIST tickets
class TicketListCreateView(generics.ListCreateAPIView):
    queryset = Ticket.objects.all().order_by("-created_at")
    serializer_class = TicketSerializer

    filter_backends = [filters.SearchFilter]
    search_fields = ["title", "description"]

    def get_queryset(self):
        queryset = super().get_queryset()

        category = self.request.query_params.get("category")
        priority = self.request.query_params.get("priority")
        status = self.request.query_params.get("status")

        if category:
            queryset = queryset.filter(category=category)
        if priority:
            queryset = queryset.filter(priority=priority)
        if status:
            queryset = queryset.filter(status=status)

        return queryset


# UPDATE ticket
class TicketUpdateView(generics.UpdateAPIView):
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer


# STATS endpoint (DB aggregation — very important)
class TicketStatsView(APIView):
    def get(self, request):
        total = Ticket.objects.count()
        open_tickets = Ticket.objects.filter(status="open").count()

        avg_per_day = (
            Ticket.objects.extra({"day": "date(created_at)"})
            .values("day")
            .annotate(count=Count("id"))
            .aggregate(avg=Avg("count"))["avg"]
            or 0
        )

        priority_breakdown = dict(
            Ticket.objects.values("priority").annotate(count=Count("id")).values_list(
                "priority", "count"
            )
        )

        category_breakdown = dict(
            Ticket.objects.values("category").annotate(count=Count("id")).values_list(
                "category", "count"
            )
        )

        return Response(
            {
                "total_tickets": total,
                "open_tickets": open_tickets,
                "avg_tickets_per_day": round(avg_per_day, 2),
                "priority_breakdown": priority_breakdown,
                "category_breakdown": category_breakdown,
            }
        )
