import requests
import os


def get_ghin_rounds(ghin_id):
    login_ghin_id = os.environ.get("GHIN_ID")
    ghin_password = os.environ.get("GHIN_PASSWORD")

    headers = {
        "Content-Type": "application/json; charset=utf-8",
        "Accept": "application/json",
    }

    data = {
        "user": {
            "email_or_ghin": login_ghin_id,
            "password": ghin_password,
            "remember_me": "true",
        },
        "token": "nonblank",
    }

    response = requests.post(
        "https://api2.ghin.com/api/v1/golfer_login.json", headers=headers, json=data
    )
    headers["Authorization"] = (
        "Bearer " + response.json()["golfer_user"]["golfer_user_token"]
    )

    url = f"https://api2.ghin.com/api/v1/golfers/{ghin_id}/scores.json?source=GHINcom"

    response = requests.get(url, headers=headers)
    data = response.json()

    return data
