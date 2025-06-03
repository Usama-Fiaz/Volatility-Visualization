from django.urls import path
from .views import get_filtered_data, get_metadata

urlpatterns = [
    path('data/', get_filtered_data),
    path('metadata/', get_metadata),
]
