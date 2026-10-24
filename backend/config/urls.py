from django.contrib import admin
from django.urls import include, path, re_path

from vitrine import views

admin.site.site_header = "AirTrack · Site vitrine"
admin.site.site_title = "AirTrack"
admin.site.index_title = "Newsletter, assistant et téléchargements"

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("vitrine.urls")),
    path("download/<str:platform>/", views.download, name="download"),
    # Toute autre URL renvoie l'application React (build Vite) en production.
    re_path(r"^(?!api/|admin/|static/|download/).*$", views.spa, name="spa"),
]
