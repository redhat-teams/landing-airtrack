from django.urls import path

from . import views

urlpatterns = [
    path("health/", views.health, name="health"),
    path("config/", views.site_config, name="site-config"),
    path("assistant/", views.assistant, name="assistant"),
    path("newsletter/subscribe/", views.subscribe, name="newsletter-subscribe"),
    path("newsletter/unsubscribe/<uuid:token>/", views.unsubscribe, name="newsletter-unsubscribe"),
]
