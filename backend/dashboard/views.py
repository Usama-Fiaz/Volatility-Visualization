import pandas as pd
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET

DATA_PATH = 'data.csv'

@require_GET
@csrf_exempt
def get_metadata(request):
    try:
        df = pd.read_csv(DATA_PATH)

        meta = {
            "strike_min": float(df["strike"].min()),
            "strike_max": float(df["strike"].max()),
            "days_min": int(df["days_to_expiration"].min()),
            "days_max": int(df["days_to_expiration"].max()),
            "iv_min": float(df["implied_volatility"].min()),
            "iv_max": float(df["implied_volatility"].max())
        }
        return JsonResponse(meta)
    
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@require_GET
@csrf_exempt
def get_filtered_data(request):
    try:
        strike_min = float(request.GET["strike_min"])
        strike_max = float(request.GET["strike_max"])
        days_min = int(request.GET["days_min"])
        days_max = int(request.GET["days_max"])
        iv_min = float(request.GET["iv_min"])
        iv_max = float(request.GET["iv_max"])

        df = pd.read_csv(DATA_PATH)

        filtered = df[
            (df["strike"] >= strike_min) &
            (df["strike"] <= strike_max) &
            (df["days_to_expiration"] >= days_min) &
            (df["days_to_expiration"] <= days_max) &
            (df["implied_volatility"] >= iv_min) &
            (df["implied_volatility"] <= iv_max)
        ]

        return JsonResponse(filtered.to_dict(orient='records'), safe=False)
    
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

