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



#LLM INTEGRATION 
from google import genai
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
import json
import re


class TicketClassifyView(APIView):
    def post(self, request):
        description = request.data.get("description")

        if not description:
            return Response({"error": "Description is required"}, status=400)

        try:
            client = genai.Client(api_key=settings.GEMINI_API_KEY)

            prompt = f"""
You are a support ticket classifier.

Classify the ticket into:
Category: billing, technical, account, or general
Priority: low, medium, high, or critical

Return ONLY valid JSON:
{{"category": "...", "priority": "..."}}

Ticket description:
{description}
"""

            response = client.models.generate_content(
                model="gemini-2.0-flash",
                contents=prompt,
            )

            text = response.text
            match = re.search(r"\{.*\}", text, re.DOTALL)
            data = json.loads(match.group()) if match else {}

            return Response({
                "suggested_category": data.get("category", "general"),
                "suggested_priority": data.get("priority", "low"),
            })

        except Exception as e:
            print("Gemini Error:", str(e))

            description_lower = description.lower()

            # simple intelligent fallback
            if "payment" in description_lower or "charge" in description_lower:
                category = "billing"
                priority = "medium"
            elif "error" in description_lower or "bug" in description_lower:
                category = "technical"
                priority = "high"
            elif "login" in description_lower or "account" in description_lower:
                category = "account"
                priority = "medium"
            else:
                category = "general"
                priority = "low"

            return Response({
                "suggested_category": category,
                "suggested_priority": priority,
                "warning": "LLM quota exceeded, using intelligent fallback"
            })

