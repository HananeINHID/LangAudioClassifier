from django.urls import path
from .views import ProcessAudioView, route_audio
from django.http import JsonResponse

def health_check(request):
    return JsonResponse({"status": "ok", "service": "LangAudioClassifier API"})

urlpatterns = [
    path('', health_check, name='api-root'),
    path('predict/', ProcessAudioView.as_view(), name='predict'),
    path('route-audio/', route_audio, name='route-audio'),
]
