from django.urls import path
from .views import TicketListCreateView, TicketUpdateView, TicketStatsView

urlpatterns = [
    path("tickets/", TicketListCreateView.as_view()),
    path("tickets/<int:pk>/", TicketUpdateView.as_view()),
    path("tickets/stats/", TicketStatsView.as_view()),
]
